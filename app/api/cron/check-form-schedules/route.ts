// app/api/cron/check-form-schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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
 * Runs every 15 minutes to check if forms should be opened or closed
 * 
 * How it works:
 * 1. Checks for sessions where opening date has passed but forms aren't open yet
 * 2. Checks for sessions where closing date has passed but forms haven't been closed
 * 3. Updates Library_Year records to open/close forms
 * 4. Sends email notifications to all users and super admins
 * 5. Marks sessions as notified to prevent duplicate notifications
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
    opened: [] as number[],
    closed: [] as number[],
    errors: [] as string[]
  };

  try {
    // ========================================
    // STEP 1: Check for sessions to OPEN
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

        console.log(`✅ Closed ${updateResult.count} libraries for year ${session.academicYear}`);

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

        // Send admin notification
        await sendAdminFormsClosedNotification(
          adminEmails,
          session.academicYear,
          {
            librariesClosed: updateResult.count,
            totalLibraries: totalLibraries
          }
        );

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
        opened: results.opened,
        closed: results.closed,
        errors: results.errors
      },
      message: `Opened ${results.opened.length} sessions, closed ${results.closed.length} sessions${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
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
