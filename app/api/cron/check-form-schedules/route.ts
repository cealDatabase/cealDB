import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Resend } from 'resend';
import { 
  sendFormsOpenedNotification, 
  sendFormsClosedNotification,
  sendAdminFormsClosedNotification
} from '@/lib/email';
import { buildTemplateContext, renderTemplate } from '@/lib/emailTemplate';
import { getSuperAdminEmails, getAllActiveUserEmails, getLibraryYearCount } from '@/lib/userUtils';
import { logUserAction } from '@/lib/auditLogger';
import { formatDateRange } from '@/lib/dateFormatting';

const prisma = db;

/**
 * Vercel Cron Job Handler - Automated Email & Form Status Management
 * Runs twice daily (8:00 AM and 8:00 PM UTC) to manage scheduled events
 * 
 * ═══════════════════════════════════════════════════════════════
 * EMAIL TYPES & DUPLICATE PREVENTION
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. BROADCAST EMAILS (Sent ONCE per year when scheduled):
 *    - Announces survey opening to all users via Resend audience list
 *    - Primary method: Resend's scheduledAt sends automatically
 *    - Backup method: This cron sends if Resend fails
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
 * 3. USER NOTIFICATION EMAILS (Sent ONCE per event):
 *    - Forms Opened: Notifies users when forms open
 *    - Forms Closed: NOT sent to users (only admins are notified)
 *    - Same duplicate prevention as admin notifications
 * 
 * ═══════════════════════════════════════════════════════════════
 * EXECUTION FLOW
 * ═══════════════════════════════════════════════════════════════
 * 
 * STEP 1: Check for pending broadcasts (backup safety net)
 * STEP 2: Check for sessions to open (send user notifications only)
 * STEP 3: Check for sessions to close (send admin notifications only)
 * 
 * All actions include audit logging and comprehensive error handling.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🕐 Cron job started:', new Date().toISOString());

  // Verify this is a legitimate cron request from Vercel
  // Vercel automatically adds the 'x-vercel-cron' header to cron requests
  // See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  if (process.env.NODE_ENV === 'production') {
    const cronHeader = request.headers.get('x-vercel-cron');
    const authHeader = request.headers.get('authorization');
    
    // Accept either Vercel's x-vercel-cron header OR manual Bearer token
    const isVercelCron = cronHeader !== null;
    const isAuthorizedManual = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    if (!isVercelCron && !isAuthorizedManual) {
      console.error('❌ Unauthorized cron request - missing x-vercel-cron header or valid Bearer token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Authorized cron request:', isVercelCron ? 'Vercel Cron' : 'Manual Bearer Token');
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
    // STEP 1: Check for PENDING BROADCASTS (Backup Safety Net)
    // ========================================
    // CRITICAL: This is a backup in case Resend's scheduledAt fails
    // - Primary method: Resend automatically sends via scheduledAt parameter
    // - Backup method: This cron sends any missed broadcasts
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

    console.log(`📧 Found ${pendingBroadcasts.length} pending broadcasts to check (backup safety net)`);
    
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

    for (const event of broadcastsToProcess) {
      try {
        console.log(`📧 BACKUP: Sending missed broadcast for year ${event.year}`);

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const audienceId = process.env.RESEND_BROADCAST_LIST_ID;

        if (!audienceId) {
          throw new Error('RESEND_BROADCAST_LIST_ID not configured');
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
        const openDateObj = session.opening_date ? new Date(session.opening_date) : new Date(Date.UTC(event.year, 9, 1, 7, 0, 0));
        const closeDateObj = session.closing_date ? new Date(session.closing_date) : new Date(Date.UTC(event.year, 11, 2, 6, 59, 0));

        // Load editable template (DB-backed, falls back to built-in default)
        const _ctx = buildTemplateContext(event.year, openDateObj, closeDateObj);
        const _rendered = await renderTemplate('broadcast_open_forms', _ctx);
        const emailTemplate = _rendered.html;
        const emailSubject = _rendered.subject;

        // Legacy hardcoded HTML removed — content now comes from EmailTemplate.broadcast_open_forms (see lib/emailTemplate.ts)

        // Send broadcast immediately (Resend didn't send it)
        const broadcast = await resend.broadcasts.create({
          audienceId: audienceId,
          from: 'CEAL Statistics Database <noreply@cealstats.org>',
          subject: emailSubject,
          html: emailTemplate
        });

        // Send it immediately since it's already past scheduled time
        if (broadcast.data?.id) {
          await resend.broadcasts.send(broadcast.data.id);
          console.log('✅ BACKUP broadcast sent immediately:', broadcast.data.id);
        }

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
            notes: 'Sent by backup cron (Resend scheduledAt may have failed)'
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
            broadcast_id: broadcast.data?.id,
            scheduled_date: event.scheduled_date.toISOString(),
            sent_via: 'backup_cron',
            duplicate_prevention: 'status=completed, broadcast_sent=true'
          },
          true,
          undefined,
          request
        );

        results.broadcasts_sent.push(event.year);
      } catch (error) {
        const errorMsg = `Failed to send backup broadcast for year ${event.year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // ========================================
    // STEP 2: Check for sessions to OPEN
    // ========================================
    // NOTE: These are FORM STATUS NOTIFICATIONS (not broadcasts)
    // - User emails: Notify when forms are opened
    // - Admin emails: NOT sent in this step (only sent in STEP 3 when forms close)
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

        // Get email recipients
        const userEmails = await getAllActiveUserEmails();

        console.log(`📧 Sending notifications to ${userEmails.length} users`);

        // Send notifications to all users
        await sendFormsOpenedNotification({
          academicYear: session.academicYear,
          openingDate: session.openingDate,
          closingDate: session.closingDate,
          recipientEmails: userEmails
        });
        console.log(`✅ Sent form opening notification to ${userEmails.length} users`);
        console.log(`ℹ️  Super admin notifications NOT sent (only sent when forms close)`);

        // CRITICAL: Mark session as notified - prevents duplicate notifications
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
            userEmailsSent: userEmails.length,
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

      if (reminderTargets.length > 0 && !process.env.RESEND_API_KEY) {
        console.warn('⏰ RESEND_API_KEY missing — skipping closing reminder');
      } else if (reminderTargets.length > 0 && !process.env.RESEND_BROADCAST_LIST_ID) {
        console.warn('⏰ RESEND_BROADCAST_LIST_ID missing — skipping closing reminder');
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

            const created = await reminderResend.broadcasts.create({
              audienceId: reminderAudience,
              from: 'CEAL Statistics Database <noreply@cealstats.org>',
              subject: rendered.subject,
              html: rendered.html,
            });
            const bid = created.data?.id;
            if (!bid) throw new Error('Resend did not return a broadcast id');
            await reminderResend.broadcasts.send(bid);

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
            const msg = `Failed to send closing reminder for year ${session.academicYear}: ${sendErr instanceof Error ? sendErr.message : 'Unknown error'}`;
            console.error('❌', msg);
            results.errors.push(msg);
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
        await sendAdminFormsClosedNotification(
          adminEmails,
          session.academicYear,
          {
            librariesClosed: updateResult.count,
            totalLibraries: totalLibraries
          }
        );
        console.log(`✅ Super admin confirmation email sent successfully (ONE-TIME notification)`);

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
            emailsSent: adminEmails.length, // Only super admins notified on close
            usersNotified: false
          },
          true,
          undefined,
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
      message: `Sent ${results.broadcasts_sent.length} broadcasts (backup), opened ${results.opened.length} sessions, closed ${results.closed.length} sessions${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
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
