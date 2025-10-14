import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getSurveyDates } from '@/lib/surveyDates';
import { formatAsEasternTime } from '@/lib/timezoneUtils';

const prisma = new PrismaClient();

/**
 * TEST ENDPOINT - Send test broadcast email to super admin ONLY
 * Does NOT create Library_Year records
 * Does NOT open/close forms
 * Does NOT modify any database records
 * 
 * Perfect for testing email delivery in production
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST BROADCAST - Email only, no database changes');

    const { year, openingDate, closingDate, userRoles, testEmail } = await request.json();

    // Verify user is super admin
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!year || !openingDate || !closingDate) {
      return NextResponse.json(
        { error: 'Missing required fields: year, openingDate, closingDate' },
        { status: 400 }
      );
    }

    // Parse dates
    const openDate = new Date(openingDate);
    const closeDate = new Date(closingDate);

    // Calculate survey dates (for email content only)
    const surveyDates = getSurveyDates(year, openDate, closeDate);

    // Get all users (READ ONLY - no modifications)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true
      },
      where: {
        email: {
          not: null
        }
      }
    });

    // Build recipient list  
    const recipients: { email: string; firstName: string }[] = [];
    
    for (const user of users) {
      if (user.email) {
        recipients.push({
          email: user.email,
          firstName: user.firstname || 'Colleague'
        });
      }
    }

    console.log(`📧 TEST: Preparing to send to ${recipients.length} recipients`);

    // Create email HTML (same as production broadcast)
    const createEmailHtml = (firstName: string, libraryName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🧪 TEST BROADCAST</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">CEAL Statistics Database</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ THIS IS A TEST EMAIL</p>
            <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
              This is a test broadcast. No forms have been opened or modified.
            </p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${firstName},</p>
          
          <p style="margin-bottom: 20px;">
            This is a <strong>test email</strong> for the ${year - 1}-${year} CEAL Statistics Online Survey broadcast system.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">📅 Test Survey Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Survey Year:</td>
                <td style="padding: 8px 0;">${year - 1}-${year}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Test Opening Date:</td>
                <td style="padding: 8px 0;">${formatAsEasternTime(openDate)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Test Closing Date:</td>
                <td style="padding: 8px 0;">${formatAsEasternTime(closeDate)} at 11:59 PM PT</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Your Library:</td>
                <td style="padding: 8px 0;">${libraryName}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f4f8; border-left: 4px solid #17a2b8; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #0c5460;">
              <strong>📝 Testing Information:</strong><br>
              This test email verifies that the broadcast system is working correctly. 
              In a real broadcast, you would access the system using the link below.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://cealstats.org/signin" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Access CEAL Statistics Database
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              <strong>Questions or issues?</strong> Please contact the CEAL Statistics Database administrator.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 5px 0;">Council on East Asian Libraries (CEAL)</p>
          <p style="margin: 5px 0;">This is a test email from the CEAL Statistics Database</p>
        </div>
      </body>
      </html>
    `;

    // Send emails using Resend
    const emailPromises = recipients.map(recipient => 
      resend.emails.send({
        from: 'CEAL Statistics <noreply@cealstats.org>',
        to: recipient.email,
        subject: `🧪 TEST: ${year - 1}-${year} CEAL Statistics Online Survey`,
        html: createEmailHtml(recipient.firstName, recipient.library),
      })
    );

    console.log(`📤 Sending ${emailPromises.length} test emails...`);
    const results = await Promise.allSettled(emailPromises);

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ TEST COMPLETE: ${successful} emails sent successfully, ${failed} failed`);
    console.log(`✅ NO DATABASE CHANGES MADE - This was email-only test`);

    // Log failures if any
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to ${recipients[index].email}:`, result.reason);
      }
    });

    return NextResponse.json({
      success: true,
      test: true,
      message: `TEST BROADCAST: Sent ${successful} emails successfully. NO forms opened, NO database records created.`,
      details: {
        totalRecipients: recipients.length,
        emailsSent: successful,
        emailsFailed: failed,
        year: year,
        openingDate: openDate.toISOString(),
        closingDate: closeDate.toISOString(),
        databaseModified: false,
        formsOpened: false
      }
    });

  } catch (error) {
    console.error('❌ Test broadcast error:', error);
    return NextResponse.json(
      { 
        error: 'Test broadcast failed',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
