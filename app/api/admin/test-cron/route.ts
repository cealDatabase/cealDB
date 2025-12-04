import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { 
  sendFormsOpenedNotification, 
  sendFormsClosedNotification,
  sendAdminFormsOpenedNotification,
  sendAdminFormsClosedNotification
} from '@/lib/email';
import { getSuperAdminEmails, getAllActiveUserEmails, getLibraryYearCount } from '@/lib/userUtils';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

/**
 * TEST ENDPOINT - Manual Cron Job Trigger
 * 
 * This endpoint allows super admins to manually trigger form opening/closing
 * for TESTING purposes without waiting for the scheduled cron job.
 * 
 * ⚠️ WARNING: This bypasses the time-based checks and forces immediate action
 * 
 * Usage:
 * POST /api/admin/test-cron
 * Body: {
 *   action: "open" | "close",
 *   year: 2025,
 *   userRoles: ["1"],
 *   testMode: true,  // If true, only sends to test users
 *   testEmails: ["test1@example.com", "test2@example.com"]  // Optional test recipients
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🧪 TEST CRON: Manual trigger started:', new Date().toISOString());

  try {
    const { action, year, userRoles, testMode = false, testEmails = [] } = await request.json();

    // Verify user is super admin
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    if (!action || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: action, year' },
        { status: 400 }
      );
    }

    if (!['open', 'close'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "open" or "close"' },
        { status: 400 }
      );
    }

    console.log(`🧪 TEST MODE: ${testMode ? 'ENABLED (test emails only)' : 'DISABLED (all users)'}`);
    console.log(`🎯 Action: ${action.toUpperCase()} forms for year ${year}`);

    // Get Library_Year records for this year
    const libraryYears = await prisma.library_Year.findMany({
      where: { year: year }
    });

    if (libraryYears.length === 0) {
      return NextResponse.json(
        { error: `No Library_Year records found for year ${year}` },
        { status: 404 }
      );
    }

    const results = {
      action,
      year,
      testMode,
      recordsUpdated: 0,
      emailsSent: 0,
      errors: [] as string[]
    };

    // Determine email recipients
    let userEmails: string[] = [];
    let adminEmails: string[] = [];

    if (testMode && testEmails.length > 0) {
      // Test mode with specific test emails
      userEmails = testEmails;
      adminEmails = await getSuperAdminEmails();
      console.log(`📧 TEST MODE: Sending to ${testEmails.length} test users:`, testEmails);
    } else if (testMode) {
      // Test mode but no specific emails provided - use only super admins
      adminEmails = await getSuperAdminEmails();
      userEmails = adminEmails;
      console.log(`📧 TEST MODE: Sending only to super admins:`, adminEmails);
    } else {
      // Production mode - send to all users
      userEmails = await getAllActiveUserEmails();
      adminEmails = await getSuperAdminEmails();
      console.log(`📧 PRODUCTION MODE: Sending to ${userEmails.length} users and ${adminEmails.length} admins`);
    }

    const totalLibraries = await getLibraryYearCount(year);

    // ========================================
    // OPEN FORMS
    // ========================================
    if (action === 'open') {
      console.log(`🔓 Opening forms for year ${year}...`);

      // Update all Library_Year records
      const updateResult = await prisma.library_Year.updateMany({
        where: { year: year },
        data: { is_open_for_editing: true }
      });

      console.log(`✅ Opened ${updateResult.count} libraries for year ${year}`);
      results.recordsUpdated = updateResult.count;

      // Get session dates for emails
      const sampleLibrary = libraryYears[0];
      const openingDate = sampleLibrary.opening_date || new Date();
      const closingDate = sampleLibrary.closing_date || new Date();

      // Send notifications to users
      try {
        await sendFormsOpenedNotification({
          academicYear: year,
          openingDate,
          closingDate,
          recipientEmails: userEmails
        });
        console.log(`✅ Sent opening notification to ${userEmails.length} users`);
        results.emailsSent += userEmails.length;
      } catch (error) {
        const errorMsg = `Failed to send user notifications: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }

      // Send admin notification
      try {
        await sendAdminFormsOpenedNotification(
          adminEmails,
          year,
          {
            librariesOpened: updateResult.count,
            totalLibraries: totalLibraries
          }
        );
        console.log(`✅ Sent admin notification to ${adminEmails.length} admins`);
        results.emailsSent += adminEmails.length;
      } catch (error) {
        const errorMsg = `Failed to send admin notifications: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }

      // Log the action
      await logUserAction(
        'TEST_OPEN_FORMS',
        'Library_Year',
        year.toString(),
        null,
        {
          academicYear: year,
          librariesOpened: updateResult.count,
          testMode,
          emailsSent: results.emailsSent
        },
        true,
        undefined,
        request
      );
    }

    // ========================================
    // CLOSE FORMS
    // ========================================
    if (action === 'close') {
      console.log(`🔒 Closing forms for year ${year}...`);

      // Update all Library_Year records
      const updateResult = await prisma.library_Year.updateMany({
        where: { year: year },
        data: { is_open_for_editing: false }
      });

      console.log(`✅ Updated ${updateResult.count} libraries for year ${year}`);

      // VERIFY all forms are actually closed
      const stillOpenForms = await prisma.library_Year.findMany({
        where: {
          year: year,
          is_open_for_editing: true
        }
      });

      if (stillOpenForms.length > 0) {
        const errorMsg = `⚠️ WARNING: ${stillOpenForms.length} forms are still open after closure attempt!`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      } else {
        console.log(`✅ VERIFIED: All ${updateResult.count} forms are closed for year ${year}`);
      }

      results.recordsUpdated = updateResult.count;

      // Get session dates for emails
      const sampleLibrary = libraryYears[0];
      const openingDate = sampleLibrary.opening_date || new Date();
      const closingDate = sampleLibrary.closing_date || new Date();

      // Send notifications to users
      try {
        await sendFormsClosedNotification({
          academicYear: year,
          openingDate,
          closingDate,
          recipientEmails: userEmails
        });
        console.log(`✅ Sent closing notification to ${userEmails.length} users`);
        results.emailsSent += userEmails.length;
      } catch (error) {
        const errorMsg = `Failed to send user notifications: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }

      // Send admin notification AFTER verification
      if (stillOpenForms.length === 0) {
        try {
          console.log(`📧 Sending VERIFIED closure confirmation to ${adminEmails.length} super admins...`);
          await sendAdminFormsClosedNotification(
            adminEmails,
            year,
            {
              librariesClosed: updateResult.count,
              totalLibraries: totalLibraries
            }
          );
          console.log(`✅ Super admin confirmation email sent successfully`);
          results.emailsSent += adminEmails.length;
        } catch (error) {
          const errorMsg = `Failed to send admin notifications: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error('❌', errorMsg);
          results.errors.push(errorMsg);
        }
      }

      // Log the action
      await logUserAction(
        'TEST_CLOSE_FORMS',
        'Library_Year',
        year.toString(),
        null,
        {
          academicYear: year,
          librariesClosed: updateResult.count,
          testMode,
          emailsSent: results.emailsSent,
          verified: stillOpenForms.length === 0
        },
        true,
        undefined,
        request
      );
    }

    const duration = Date.now() - startTime;
    console.log(`✅ TEST CRON completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results,
      message: `Successfully ${action === 'open' ? 'opened' : 'closed'} ${results.recordsUpdated} forms for year ${year}. Sent ${results.emailsSent} emails.${results.errors.length > 0 ? ` ${results.errors.length} errors occurred.` : ''}`
    });

  } catch (error) {
    console.error('❌ TEST CRON failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test cron execution failed',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );}
}
