// app/api/cron/check-form-schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { 
  sendFormsOpenedNotification, 
  sendFormsClosedNotification,
  sendAdminFormsOpenedNotification,
  sendAdminFormsClosedNotification
} from '@/lib/email';
import { getSuperAdminEmails, getAllActiveUserEmails, getLibraryYearCount } from '@/lib/userUtils';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

/**
 * Vercel Cron Job Handler
 * Runs twice daily (8:00 AM and 8:00 PM UTC) to manage scheduled events
 * 
 * How it works:
 * 1. BROADCASTS (Backup Safety Net): Checks for pending broadcast events in case Resend's scheduledAt fails
 *    - Primary: Resend automatically sends broadcasts via scheduledAt parameter
 *    - Backup: This cron sends any missed broadcasts that are still pending
 * 2. FORM OPENING: Checks for sessions where opening date has passed but forms aren't open yet
 * 3. FORM CLOSING: Checks for sessions where closing date has passed but forms haven't been closed
 * 4. Updates Library_Year records and sends email notifications
 * 5. Marks events as completed to prevent duplicate actions
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
    // This is a backup in case Resend's scheduledAt fails
    // Primary method: Resend automatically sends via scheduledAt
    // Backup method: This cron checks for missed broadcasts
    const pendingBroadcasts = await prisma.scheduledEvent.findMany({
      where: {
        event_type: 'BROADCAST',
        status: 'pending',
        scheduled_date: {
          lte: now // Scheduled date has passed
        }
      }
    });

    console.log(`📧 Found ${pendingBroadcasts.length} pending broadcasts to check (backup safety net)`);

    for (const event of pendingBroadcasts) {
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
        const openDate = session.opening_date || new Date();
        const closeDate = session.closing_date || new Date();

        // Calculate fiscal year dates
        const reportingYearEnd = new Date(event.year, 9, 1); // October 1

        // Create email template (matching the one in broadcast route)
        const emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
            <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinators of the CEAL Statistics Survey,</h3>
            
            <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>
            
            <p style="margin-bottom: 16px;"><i>You are receiving this message because you are listed in the CEAL Statistics Database as the primary contact or CEAL statistics coordinator for your institution. If you are no longer serving in this role, please reply to this email with updated contact information for your institution. Thank you for your cooperation.</i></p>
            
            <div style="margin: 24px 0;">
              <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
              <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) ${event.year - 1}–${event.year}</strong>, defined as the most recent 12-month period ending before ${reportingYearEnd.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric" })}, corresponding to your institution's fiscal year. For most institutions, this period covers <strong>
              July 1, ${event.year - 1} through June 30, ${event.year}
              </strong>.</p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
              <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
              <p style="margin: 0;">The CEAL Online Survey will be open from <strong>${openDate.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric" })} through ${closeDate.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long", day: "numeric", year: "numeric" })} (11:59 p.m. Pacific Time)</strong>.</p>
            </div>
            
            <div style="margin: 24px 0;">
              <h4 style="color: #374151; margin-top: 0; margin-bottom: 12px;">Accessing the Surveys:</h4>
              <p style="margin-bottom: 16px;">Visit the CEAL Statistics Database at <a href="https://cealstats.org/" style="color: #2563eb; text-decoration: none; font-weight: 600;">https://cealstats.org/</a> to access the online survey forms and instructions.</p>
              
              <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 12px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #7f1d1d;"><strong>Please note:</strong> The CEAL Statistics Database has recently been <strong>migrated and rebuilt</strong>. This is our first year using the new platform, which is currently in a "beta" phase. <strong>Some functions from the old site are still under processing (e.g., database search)</strong>. You might experience slower loading times or other minor issues. We sincerely appreciate your patience and understanding as we continue improving the system.</p>
              </div>
              
              <p style="margin-bottom: 12px;">For a quick guide to using the new survey forms, please refer to:</p>
              <p style="margin-bottom: 16px;">👉 <a href="https://cealstats.org/docs/user-guide.pdf" style="color: #2563eb; text-decoration: none; font-weight: 600;">CEAL Statistics Database User Guide (PDF)</a></p>
              
              <p style="margin: 0;">If you find it difficult to use the new platform, you are welcome to schedule a one-on-one meeting with Anlin Yang via <a href="https://calendly.com/yanganlin/meeting" style="color: #2563eb; text-decoration: none; font-weight: 600;">https://calendly.com/yanganlin/meeting</a>.</p>
            </div>
            
            <div style="margin: 24px 0;">
              <h4 style="color: #065f46; margin-top: 0; margin-bottom: 12px; font-size: 18px;">Contact Information:</h4>
              <p style="margin-bottom: 12px;">For questions about specific language resources, please contact:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Chinese resources:</strong> Jian P. Lee – <a href="mailto:jlee37@uw.edu" style="color: #2563eb; text-decoration: none;">jlee37@uw.edu</a></li>
                <li style="margin-bottom: 8px;"><strong>Japanese resources:</strong> Michiko Ito – <a href="mailto:mito@ku.edu" style="color: #2563eb; text-decoration: none;">mito@ku.edu</a></li>
                <li style="margin-bottom: 8px;"><strong>Korean resources:</strong> Ellie Kim – <a href="mailto:eunahkim@hawaii.edu" style="color: #2563eb; text-decoration: none;">eunahkim@hawaii.edu</a></li>
              </ul>
              <p style="margin-top: 12px; margin-bottom: 0;">For general questions or technical issues, please contact: <strong>Anlin Yang</strong> – <a href="mailto:anlin.yang@wisc.edu" style="color: #2563eb; text-decoration: none;">anlin.yang@wisc.edu</a></p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://cealstats.org/" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Survey Forms</a>
            </div>
            
            <p style="margin-bottom: 8px;">Thank you for your continued participation and support!</p>
            
            <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>Anlin Yang<br/><em>(on behalf of the CEAL Statistics Committee)</em></p>
            
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Committee Members:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6b7280;">
                <li>Michiko Ito, Japanese Studies Librarian, University of Kansas</li>
                <li>Ellie Kim, Korean Studies Librarian, University of Hawaiʻi at Mānoa</li>
                <li>Jian P. Lee, Chinese Language Cataloging and Metadata Librarian, University of Washington</li>
                <li>Vickie Fu Doll, Advisor, Librarian Emerita, University of Kansas</li>
              </ul>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
            </p>
          </div>
        `;

        // Send broadcast immediately (Resend didn't send it)
        const broadcast = await resend.broadcasts.create({
          audienceId: audienceId,
          from: 'CEAL Statistics Database <noreply@cealstats.org>',
          subject: `CEAL Statistics Online Surveys Are Now Open`,
          html: emailTemplate
        });

        // Send it immediately since it's already past scheduled time
        if (broadcast.data?.id) {
          await resend.broadcasts.send(broadcast.data.id);
          console.log('✅ BACKUP broadcast sent immediately:', broadcast.data.id);
        }

        // Mark broadcast_sent in Library_Year
        await prisma.library_Year.updateMany({
          where: { year: event.year },
          data: { broadcast_sent: true }
        });

        // Mark event as completed
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date(),
            notes: 'Sent by backup cron (Resend scheduledAt may have failed)'
          }
        });

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
            sent_via: 'backup_cron'
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
    const sessionsToOpen = await prisma.surveySession.findMany({
      where: {
        openingDate: {
          lte: now // Opening date has passed
        },
        isOpen: false, // Not currently open
        notifiedOnOpen: false // Haven't sent notification yet
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
        const adminEmails = await getSuperAdminEmails();
        const totalLibraries = await getLibraryYearCount(session.academicYear);

        console.log(`📧 Sending notifications to ${userEmails.length} users and ${adminEmails.length} admins`);

        // Send notifications to all users
        await sendFormsOpenedNotification({
          academicYear: session.academicYear,
          openingDate: session.openingDate,
          closingDate: session.closingDate,
          recipientEmails: userEmails
        });

        // Send admin notification
        await sendAdminFormsOpenedNotification(
          adminEmails,
          session.academicYear,
          {
            librariesOpened: updateResult.count,
            totalLibraries: totalLibraries
          }
        );

        // Mark session as open and notified
        await prisma.surveySession.update({
          where: { id: session.id },
          data: {
            isOpen: true,
            notifiedOnOpen: true
          }
        });

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
            emailsSent: userEmails.length + adminEmails.length
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
    // STEP 2: Check for sessions to CLOSE
    // ========================================
    const sessionsToClose = await prisma.surveySession.findMany({
      where: {
        closingDate: {
          lte: now // Closing date has passed
        },
        isOpen: true, // Currently open
        notifiedOnClose: false // Haven't sent notification yet
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

        // Get email recipients
        const userEmails = await getAllActiveUserEmails();
        const adminEmails = await getSuperAdminEmails();
        const totalLibraries = await getLibraryYearCount(session.academicYear);

        console.log(`📧 Sending notifications to ${userEmails.length} users and ${adminEmails.length} admins`);

        // Send notifications to all users
        await sendFormsClosedNotification({
          academicYear: session.academicYear,
          openingDate: session.openingDate,
          closingDate: session.closingDate,
          recipientEmails: userEmails
        });

        // Send admin notification AFTER verification that all forms are closed
        console.log(`📧 Sending VERIFIED closure confirmation to ${adminEmails.length} super admins...`);
        await sendAdminFormsClosedNotification(
          adminEmails,
          session.academicYear,
          {
            librariesClosed: updateResult.count,
            totalLibraries: totalLibraries
          }
        );
        console.log(`✅ Super admin confirmation email sent successfully`);

        // Mark session as closed and notified
        await prisma.surveySession.update({
          where: { id: session.id },
          data: {
            isOpen: false,
            notifiedOnClose: true
          }
        });

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
            emailsSent: userEmails.length + adminEmails.length
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
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
