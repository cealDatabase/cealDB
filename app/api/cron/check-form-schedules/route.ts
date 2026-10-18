import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import db from '@/lib/db';
import { Resend } from 'resend';
import { 
  sendFormsClosedNotification,
  sendAdminFormsClosedNotification,
  sendBroadcastNow,
  type NotificationResult,
} from '@/lib/email';
import { buildTemplateContext, renderTemplate } from '@/lib/emailTemplate';
import { getSurveyDates } from '@/lib/surveyDates';
import { getSuperAdminEmails, getLibraryYearCount } from '@/lib/userUtils';
import { logUserAction } from '@/lib/auditLogger';
import { EmailFailure, emailErrorFrom, emailErrorLogFields } from '@/lib/emailError';
import { formatDateRange } from '@/lib/dateFormatting';

const prisma = db;

/**
 * When CRON_SECRET is set, Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * with every scheduled run (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs),
 * so that is the only thing accepted. This used to accept any request that
 * carried an `x-vercel-cron` header - which anyone can send - and, with the
 * secret unset, the literal "Bearer undefined".
 *
 * Without CRON_SECRET there is nothing to check against. Rather than stop
 * forms opening and closing on schedule, the old header check stays as a
 * fallback and every run logs that the secret is missing.
 */
function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('⚠️ CRON_SECRET is not set: anyone can trigger this job. Set it in Vercel → Settings → Environment Variables.');
    return request.headers.get('x-vercel-cron') !== null;
  }
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Sending to every member goes out in batches with retries (lib/email.ts).
// Give the job room to finish and record the outcome even when Resend is
// slow; 60s is the most every Vercel plan allows.
export const maxDuration = 60;

/**
 * Summary of a notification for the cron response and the audit log, or null
 * when every email went out. The audit log lists the addresses that failed,
 * so a super admin can follow up with them.
 */
function describeEmailFailures(what: string, result: NotificationResult) {
  if (result.failed.length === 0) return null;
  const reasons = [...new Set(result.failed.map((f) => f.reason))].join('; ');
  return {
    message: `${result.failed.length} of ${result.attempted} ${what} emails were not accepted by Resend: ${reasons}`,
    failedRecipients: result.failed.slice(0, 100),
  };
}

/**
 * Vercel Cron Job Handler - Automated Email & Form Status Management
 * Runs twice daily (04:00 and 08:00 UTC, see vercel.json) to manage scheduled events
 * 
 * ═══════════════════════════════════════════════════════════════
 * EMAIL TYPES & DUPLICATE PREVENTION
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. BROADCAST EMAILS (Sent ONCE per year when scheduled):
 *    - Announces survey opening to all users via Resend audience list
 *    - Sent by this job (STEP 1) at the first run after the opening time.
 *      Resend does not send it on its own: scheduling on /admin/broadcast
 *      only leaves a draft there. Sending here uses the template and dates
 *      as they are on the day.
 *    - If Resend refuses it, the event stays pending, the failure is in the
 *      audit log, and the next run tries again.
 *    - DUPLICATE PREVENTION:
 *      • Only processes events with status='pending'
 *      • Checks Library_Year.broadcast_sent=false before sending
 *      • After sending: status='completed' AND broadcast_sent=true
 *      • Will NEVER be sent again once marked complete
 * 
 * 2. ADMIN NOTIFICATION EMAILS (Sent ONCE per event):
 *    - Forms Closed: Notifies super admins when forms close
 *    - Forms Opened: NOT sent to admins (only users are notified)
 *    - DUPLICATE PREVENTION:
 *      • Only processes sessions with notifiedOnClose=false
 *      • After sending: notifiedOnClose=true
 *      • Will NEVER be sent again once marked
 * 
 * 3. NO SEPARATE "FORMS OPEN" EMAIL TO USERS:
 *    - The broadcast (1) is the opening announcement. Opening forms sends
 *      nothing more: a second email to every user is redundant, and on the
 *      Resend free plan it would use up the 100-a-day allowance for
 *      transactional email, leaving none for password resets on opening day.
 *    - Super admins can still email one user or institution from the user
 *      admin page (/api/admin/send-individual-email).
 * 
 * ═══════════════════════════════════════════════════════════════
 * EXECUTION FLOW
 * ═══════════════════════════════════════════════════════════════
 * 
 * STEP 1: Send the opening broadcast once its time has come
 * STEP 2: Check for sessions to open (no email; the broadcast announces it)
 * STEP 3: Check for sessions to close (send admin notifications only)
 * 
 * All actions include audit logging and comprehensive error handling.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🕐 Cron job started:', new Date().toISOString());

  // Only Vercel's scheduler (or someone holding CRON_SECRET) may run this.
  if (process.env.NODE_ENV === 'production' && !isAuthorizedCronRequest(request)) {
    console.error('❌ Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = {
    broadcasts_sent: [] as number[],
    opened: [] as number[],
    closed: [] as number[],
    errors: [] as string[]
  };

  try {
    // ========================================
    // STEP 1: Send PENDING BROADCASTS whose time has come
    // ========================================
    // This is what sends a scheduled opening broadcast; Resend holds only a
    // draft (see the header above).
    // - DUPLICATE PREVENTION: Only processes broadcasts with status='pending'
    // - Once sent, status changes to 'completed' and will NEVER be sent again
    const pendingBroadcasts = await prisma.scheduledEvent.findMany({
      where: {
        event_type: 'BROADCAST',
        status: 'pending', // CRITICAL: Only pending broadcasts
        scheduled_date: {
          lte: now // Scheduled date has passed
        }
      }
    });

    console.log(`📧 Found ${pendingBroadcasts.length} pending broadcasts due`);
    
    // Additional safety check: Filter out broadcasts that were already sent
    // This prevents duplicate sends if there's a database sync issue
    const broadcastsToProcess = [];
    for (const event of pendingBroadcasts) {
      const libraryYearCheck = await prisma.library_Year.findFirst({
        where: { 
          year: event.year,
          broadcast_sent: true // Already marked as sent
        }
      });
      
      if (libraryYearCheck) {
        console.log(`⚠️ DUPLICATE PREVENTED: Broadcast for year ${event.year} is pending but Library_Year shows broadcast_sent=true. Marking as completed without sending.`);
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date(),
            notes: 'Marked completed - broadcast_sent was already true in Library_Year (duplicate prevented)'
          }
        });
      } else {
        broadcastsToProcess.push(event);
      }
    }

    console.log(`📧 Processing ${broadcastsToProcess.length} broadcasts after duplicate check (prevented ${pendingBroadcasts.length - broadcastsToProcess.length} duplicates)`);

    // One opening broadcast per year: the most recent schedule. A year
    // scheduled more than once had a pending broadcast from each schedule,
    // and every one that was due went out to all members. An earlier one is
    // cancelled; if the latest is not due yet, nothing is sent until it is.
    const latestPendingByYear = new Map<number, number>();
    if (broadcastsToProcess.length > 0) {
      const allPending = await prisma.scheduledEvent.findMany({
        where: {
          event_type: 'BROADCAST',
          status: 'pending',
          year: { in: [...new Set(broadcastsToProcess.map((e) => e.year))] },
        },
        select: { id: true, year: true },
      });
      for (const e of allPending) {
        latestPendingByYear.set(e.year, Math.max(latestPendingByYear.get(e.year) ?? 0, e.id));
      }
    }
    const broadcastsToSend = [];
    for (const event of broadcastsToProcess) {
      const latestId = latestPendingByYear.get(event.year);
      if (latestId !== undefined && latestId !== event.id) {
        console.log(`⚠️ DUPLICATE PREVENTED: Broadcast event #${event.id} for year ${event.year} was replaced by event #${latestId}. Cancelling it.`);
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'cancelled',
            cancelled_at: new Date(),
            notes: `Replaced by event #${latestId} (the year was scheduled again); one broadcast is sent per year`,
          },
        });
      } else {
        broadcastsToSend.push(event);
      }
    }

    for (const event of broadcastsToSend) {
      try {
        console.log(`📧 BACKUP: Sending missed broadcast for year ${event.year}`);

        // Initialize Resend
        if (!process.env.RESEND_API_KEY) {
          throw new EmailFailure('RESEND_API_KEY not configured', 'config_missing');
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        const audienceId = process.env.RESEND_BROADCAST_LIST_ID;

        if (!audienceId) {
          throw new EmailFailure('RESEND_BROADCAST_LIST_ID not configured', 'config_missing');
        }

        // Get Library_Year info for this year
        const libraryYears = await prisma.library_Year.findMany({
          where: { year: event.year },
          take: 1
        });

        if (libraryYears.length === 0) {
          throw new Error(`No Library_Year found for year ${event.year}`);
        }

        const session = libraryYears[0];
        const currentYear = new Date().getFullYear();
        // Dates for the email come from the SurveySession: it is what this job
        // opens and closes on, so the email states the dates that will actually
        // apply. Library_Year rows written by the broadcast route carried the
        // closing date one day late, so reading them put the wrong deadline in
        // front of every member. Library_Year, then the defaults, are fallbacks.
        const surveySession = await prisma.surveySession.findUnique({
          where: { academicYear: event.year },
          select: { openingDate: true, closingDate: true },
        });
        const fallbackDates = getSurveyDates(event.year);
        const openDateObj = surveySession?.openingDate
          ? new Date(surveySession.openingDate)
          : session.opening_date ? new Date(session.opening_date) : fallbackDates.openingDate;
        const closeDateObj = surveySession?.closingDate
          ? new Date(surveySession.closingDate)
          : session.closing_date ? new Date(session.closing_date) : fallbackDates.closingDate;

        // Load editable template (DB-backed, falls back to built-in default)
        const _ctx = buildTemplateContext(event.year, openDateObj, closeDateObj);
        const _rendered = await renderTemplate('broadcast_open_forms', _ctx);
        const emailTemplate = _rendered.html;
        const emailSubject = _rendered.subject;

        // Legacy hardcoded HTML removed — content now comes from EmailTemplate.broadcast_open_forms (see lib/emailTemplate.ts)

        // Throws if Resend does not create or send it; the event then stays
        // pending (see catch below). It used to be marked sent either way.
        const { id: broadcastId } = await sendBroadcastNow(resend, {
          audienceId,
          subject: emailSubject,
          html: emailTemplate,
        });
        console.log('✅ Opening broadcast sent:', broadcastId);

        // CRITICAL: Mark broadcast as sent - this prevents duplicate sends
        await prisma.library_Year.updateMany({
          where: { year: event.year },
          data: { broadcast_sent: true }
        });

        // CRITICAL: Mark event as completed - this ensures it will NEVER be sent again
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date(),
            notes: 'Sent by the scheduled job on the opening date'
          }
        });
        
        console.log(`✅ DUPLICATE PREVENTION: Broadcast for year ${event.year} marked as completed. It will NEVER be sent again.`);

        // Log the action
        await logUserAction(
          'CREATE',
          'ScheduledEvent',
          event.id.toString(),
          null,
          {
            year: event.year,
            action: 'BROADCAST_SENT',
            broadcast_id: broadcastId,
            scheduled_date: event.scheduled_date.toISOString(),
            sent_via: 'cron',
            duplicate_prevention: 'status=completed, broadcast_sent=true'
          },
          true,
          undefined,
          request
        );

        results.broadcasts_sent.push(event.year);
      } catch (error) {
        const reason = (error instanceof Error ? error.message : 'Unknown error').replace(/\.$/, '');
        const errorMsg = `Opening broadcast for year ${event.year} was not sent: ${reason}. It stays pending; the next run tries again.`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
        // Shown in red in the audit log and on the Email Send Status page,
        // with an error code to copy, so a super admin sees it without
        // reading the cron output.
        await logUserAction(
          'CREATE',
          'ScheduledEvent',
          event.id.toString(),
          null,
          {
            year: event.year,
            action: 'BROADCAST_FAILED',
            scheduled_date: event.scheduled_date.toISOString(),
            ...emailErrorLogFields(emailErrorFrom(error, 'cron-opening-broadcast')),
          },
          false,
          errorMsg,
          request
        );
      }
    }

    // ========================================
    // STEP 2: Check for sessions to OPEN
    // ========================================
    // - No email here: the broadcast (STEP 1) is the opening announcement. See "NO SEPARATE FORMS OPEN EMAIL" above.
    // - DUPLICATE PREVENTION: Only processes where notifiedOnOpen=false
    const sessionsToOpen = await prisma.surveySession.findMany({
      where: {
        openingDate: {
          lte: now // Opening date has passed
        },
        isOpen: false, // Not currently open
        notifiedOnOpen: false // Haven't sent notification yet (DUPLICATE PREVENTION)
      }
    });

    console.log(`📋 Found ${sessionsToOpen.length} sessions to open`);

    for (const session of sessionsToOpen) {
      try {
        console.log(`🔓 Opening session for year ${session.academicYear}`);

        // Update all Library_Year records for this academic year
        const updateResult = await prisma.library_Year.updateMany({
          where: { year: session.academicYear },
          data: { is_open_for_editing: true }
        });

        console.log(`✅ Opened ${updateResult.count} libraries for year ${session.academicYear}`);

        // CRITICAL: Mark session as opened - the cron never opens it again
        await prisma.surveySession.update({
          where: { id: session.id },
          data: {
            isOpen: true,
            notifiedOnOpen: true // DUPLICATE PREVENTION: Will never send again
          }
        });
        console.log(`✅ DUPLICATE PREVENTION: Session ${session.academicYear} marked as notifiedOnOpen=true. Notification will NEVER be sent again.`);

        // Log the action
        await logUserAction(
          'SYSTEM_OPEN_FORMS',
          'Library_Year',
          session.academicYear.toString(),
          null,
          {
            academicYear: session.academicYear,
            librariesOpened: updateResult.count,
            openingDate: session.openingDate.toISOString(),
            userEmailsSent: 0, // the broadcast is the announcement
            adminEmailsSent: 0
          },
          true,
          undefined,
          request
        );

        results.opened.push(session.academicYear);
      } catch (error) {
        const errorMsg = `Failed to open session for year ${session.academicYear}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // ========================================
    // STEP 2.5: Check for sessions that need the 1-WEEK-BEFORE-CLOSE REMINDER
    // ========================================
    // Sends Broadcast 3 (broadcast_closing_reminder) to all CEAL users when
    // there are 7 days or fewer left before the scheduled closing date.
    //
    // DUPLICATE PREVENTION:
    //   - notifiedClosingReminder=false (set to true after first successful send)
    //   - Window: closingDate - 7 days <= now < closingDate
    //     (we still allow it to fire even if there are <7 days left, e.g. if
    //     cron was skipped, but never after the closing date itself)
    try {
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const reminderTargets = await prisma.surveySession.findMany({
        where: {
          isOpen: true,
          closingDate: { gt: now, lte: sevenDaysFromNow },
          notifiedClosingReminder: false,
        } as any,
      });

      console.log(`⏰ Found ${reminderTargets.length} session(s) needing the 1-week-before-close reminder`);

      // Recorded with an error code, so the Email Send Status page shows it.
      const logReminderFailure = async (year: number, err: unknown) => {
        const reason = (err instanceof Error ? err.message : 'Unknown error').replace(/\.$/, '');
        const msg = `Closing reminder for year ${year} was not sent: ${reason}. The next run tries again.`;
        console.error('❌', msg);
        results.errors.push(msg);
        await logUserAction(
          'CREATE',
          'EmailBroadcast',
          `auto:broadcast_closing_reminder:${year}`,
          null,
          {
            templateKey: 'broadcast_closing_reminder',
            academicYear: year,
            ...emailErrorLogFields(emailErrorFrom(err, 'cron-closing-reminder')),
          },
          false,
          msg,
          request,
        );
      };

      const missingSetting = !process.env.RESEND_API_KEY
        ? 'RESEND_API_KEY'
        : !process.env.RESEND_BROADCAST_LIST_ID
          ? 'RESEND_BROADCAST_LIST_ID'
          : null;
      if (reminderTargets.length > 0 && missingSetting) {
        console.warn(`⏰ ${missingSetting} missing — skipping closing reminder`);
        for (const session of reminderTargets) {
          await logReminderFailure(session.academicYear, new EmailFailure(`${missingSetting} not configured`, 'config_missing'));
        }
      } else {
        const reminderResend = new Resend(process.env.RESEND_API_KEY);
        const reminderAudience = process.env.RESEND_BROADCAST_LIST_ID!;

        for (const session of reminderTargets) {
          try {
            const ctx = buildTemplateContext(
              session.academicYear,
              new Date(session.openingDate),
              new Date(session.closingDate),
            );
            const rendered = await renderTemplate('broadcast_closing_reminder', ctx);

            // Throws if Resend does not send it, so the reminder is not
            // marked sent and the next run tries again.
            const { id: bid } = await sendBroadcastNow(reminderResend, {
              audienceId: reminderAudience,
              subject: rendered.subject,
              html: rendered.html,
            });

            await prisma.surveySession.update({
              where: { id: session.id },
              data: { notifiedClosingReminder: true } as any,
            });

            await logUserAction(
              'CREATE',
              'EmailBroadcast',
              `auto:broadcast_closing_reminder:${session.academicYear}`,
              null,
              {
                templateKey: 'broadcast_closing_reminder',
                broadcastId: bid,
                academicYear: session.academicYear,
                closingDate: session.closingDate.toISOString(),
              },
              true,
              undefined,
              request,
            );

            console.log(`✅ Closing reminder sent for year ${session.academicYear} (broadcast ${bid})`);
            results.broadcasts_sent.push(session.academicYear);
          } catch (sendErr) {
            await logReminderFailure(session.academicYear, sendErr);
          }
        }
      }
    } catch (err) {
      const msg = `Closing-reminder step failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('❌', msg);
      results.errors.push(msg);
    }

    // ========================================
    // STEP 3: Check for sessions to CLOSE
    // ========================================
    // NOTE: These are FORM CLOSURE NOTIFICATIONS (not broadcasts)
    // - Verify forms are successfully closed
    // - Admin emails ONLY: Notify super admins that forms are closed
    // - User emails: NOT sent when forms close (only sent when forms open)
    // - DUPLICATE PREVENTION: Only processes where notifiedOnClose=false
    const sessionsToClose = await prisma.surveySession.findMany({
      where: {
        closingDate: {
          lte: now // Closing date has passed
        },
        isOpen: true, // Currently open
        notifiedOnClose: false // Haven't sent notification yet (DUPLICATE PREVENTION)
      }
    });

    console.log(`📋 Found ${sessionsToClose.length} sessions to close`);

    for (const session of sessionsToClose) {
      try {
        console.log(`🔒 Closing session for year ${session.academicYear}`);

        // Update all Library_Year records for this academic year
        const updateResult = await prisma.library_Year.updateMany({
          where: { year: session.academicYear },
          data: { is_open_for_editing: false }
        });

        console.log(`✅ Updated ${updateResult.count} libraries for year ${session.academicYear}`);

        // VERIFY all forms are actually closed before sending confirmation
        const stillOpenForms = await prisma.library_Year.findMany({
          where: {
            year: session.academicYear,
            is_open_for_editing: true
          }
        });

        if (stillOpenForms.length > 0) {
          console.error(`⚠️ WARNING: ${stillOpenForms.length} forms are still open after closure attempt!`);
          throw new Error(`Failed to close all forms. ${stillOpenForms.length} forms remain open.`);
        }

        console.log(`✅ VERIFIED: All ${updateResult.count} forms are closed for year ${session.academicYear}`);

        // Get email recipients (super admins only)
        const adminEmails = await getSuperAdminEmails();
        const totalLibraries = await getLibraryYearCount(session.academicYear);

        console.log(`📧 Sending closure notification to ${adminEmails.length} super admins (users NOT notified)`);

        // IMPORTANT: Send super admin notification AFTER verification that all forms are closed
        // Users are NOT notified when forms close (only when forms open)
        console.log(`📧 Sending VERIFIED closure confirmation to ${adminEmails.length} super admins...`);
        const adminEmailResult = await sendAdminFormsClosedNotification(
          adminEmails,
          session.academicYear,
          {
            librariesClosed: updateResult.count,
            totalLibraries: totalLibraries
          }
        );
        const adminEmailFailures = describeEmailFailures('"forms closed" admin', adminEmailResult);
        if (adminEmailFailures) {
          results.errors.push(`Year ${session.academicYear} closed, but ${adminEmailFailures.message}`);
        }

        // CRITICAL: Mark session as notified - prevents duplicate notifications
        await prisma.surveySession.update({
          where: { id: session.id },
          data: {
            isOpen: false,
            notifiedOnClose: true // DUPLICATE PREVENTION: Will never send again
          }
        });
        console.log(`✅ DUPLICATE PREVENTION: Session ${session.academicYear} marked as notifiedOnClose=true. Notification will NEVER be sent again.`);

        // Log the action
        await logUserAction(
          'SYSTEM_CLOSE_FORMS',
          'Library_Year',
          session.academicYear.toString(),
          null,
          {
            academicYear: session.academicYear,
            librariesClosed: updateResult.count,
            closingDate: session.closingDate.toISOString(),
            emailsAttempted: adminEmailResult.attempted,
            emailsSent: adminEmailResult.sent, // Only super admins notified on close
            ...(adminEmailFailures ? { emailsFailed: adminEmailFailures.failedRecipients } : {}),
            usersNotified: false
          },
          !adminEmailFailures,
          adminEmailFailures ? `Forms closed, but ${adminEmailFailures.message}` : undefined,
          request
        );

        results.closed.push(session.academicYear);
      } catch (error) {
        const errorMsg = `Failed to close session for year ${session.academicYear}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      duration: `${duration}ms`,
      results: {
        broadcasts_sent: results.broadcasts_sent,
        opened: results.opened,
        closed: results.closed,
        errors: results.errors
      },
      message: `Sent ${results.broadcasts_sent.length} broadcasts, opened ${results.opened.length} sessions, closed ${results.closed.length} sessions${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job execution failed',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );}
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
