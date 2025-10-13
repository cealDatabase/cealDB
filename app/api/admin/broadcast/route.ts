import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { logUserAction } from '@/lib/auditLogger';
import { getSurveyDates } from '@/lib/surveyDates';
import { convertToEasternTime, formatAsEasternTime } from '@/lib/timezoneUtils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { openingDate, closingDate, year, userRoles } = await request.json();

    // Verify user is super admin (role contains 1)
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!openingDate || !closingDate || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: openingDate, closingDate, year' },
        { status: 400 }
      );
    }

    // Convert dates to Pacific Time (PT) at midnight, then to UTC
    // When admin selects "Oct 14", they mean Oct 14 00:00 AM Pacific Time
    // When admin selects "Dec 16", closing means Dec 16 11:59 PM Pacific Time
    // The utility automatically handles PDT/PST based on the date
    
    const openDate = convertToEasternTime(openingDate, false); // Midnight PT
    const closeDate = convertToEasternTime(closingDate, true);  // 11:59:59 PM PT
    
    console.log('📅 Date Conversion Summary (Pacific Time):');
    console.log('  Opening:', openingDate, '→', formatAsEasternTime(openDate));
    console.log('  Opening UTC:', openDate.toISOString());
    console.log('  Closing:', closingDate, '→', formatAsEasternTime(closeDate));
    console.log('  Closing UTC:', closeDate.toISOString());
    
    if (closeDate <= openDate) {
      return NextResponse.json(
        { error: 'Closing date must be after opening date' },
        { status: 400 }
      );
    }

    // Check for existing scheduled sessions
    // Prevent creating new sessions if there are already scheduled ones
    const now = new Date();
    const existingSessions = await prisma.library_Year.findMany({
      where: {
        OR: [
          { opening_date: { not: null } },
          { closing_date: { not: null } }
        ]
      },
      select: {
        year: true,
        opening_date: true,
        closing_date: true,
        is_open_for_editing: true
      },
      distinct: ['year']
    });

    // Filter to find scheduled (future) or active sessions
    const activeOrScheduledSessions = existingSessions.filter(session => {
      if (!session.opening_date || !session.closing_date) return false;
      
      const openingDate = new Date(session.opening_date);
      const closingDate = new Date(session.closing_date);
      
      // Session is scheduled (not yet open) or active (currently open)
      return now < closingDate;
    });

    if (activeOrScheduledSessions.length > 0) {
      const sessionYears = activeOrScheduledSessions.map(s => s.year).join(', ');
      return NextResponse.json(
        { 
          error: 'Cannot create new session: existing sessions found',
          detail: `There ${activeOrScheduledSessions.length === 1 ? 'is' : 'are'} ${activeOrScheduledSessions.length} existing scheduled or active session${activeOrScheduledSessions.length === 1 ? '' : 's'} (Year${activeOrScheduledSessions.length === 1 ? '' : 's'}: ${sessionYears}). Please delete the existing session${activeOrScheduledSessions.length === 1 ? '' : 's'} before creating a new one.`,
          existingSessions: activeOrScheduledSessions.map(s => ({
            year: s.year,
            opening_date: s.opening_date,
            closing_date: s.closing_date,
            is_active: s.is_open_for_editing
          }))
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Check if RESEND_API_KEY is available
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use the provided dates
    const totalDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if forms are already open for this year (informational only)
    const openLibraries = await prisma.library_Year.findMany({
      where: {
        year: year,
        is_open_for_editing: true
      }
    });

    if (openLibraries.length > 0) {
      console.log(`⚠️  Warning: ${openLibraries.length} libraries are already open for year ${year}. Proceeding with broadcast anyway.`);
    }

    // Get audience ID from environment (for Resend Broadcast API)
    const audienceId = process.env.RESEND_BROADCAST_LIST_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: 'Broadcast audience ID not configured. Please set RESEND_BROADCAST_LIST_ID in environment variables.' },
        { status: 500 }
      );
    }

    console.log('📧 Creating broadcast with Resend API...');
    console.log('Audience ID:', audienceId);
    console.log('Year:', year);
    console.log('Opening Date:', openDate.toISOString());
    console.log('Closing Date:', closeDate.toISOString());

    // Create email template
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">CEAL Database Forms Now Open for ${year}</h2>
        
        <p>Dear CEAL Member,</p>
        
        <p>The annual data collection forms are now open for academic year <strong>${year}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Important Dates</h3>
          <ul>
            <li><strong>Forms Open:</strong> ${openDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
            <li><strong>Forms Close:</strong> ${closeDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
            <li><strong>Time Period:</strong> ${totalDays} days</li>
          </ul>
        </div>
        
        <p>You can now access and submit your library's data through the CEAL Database system. Please ensure all forms are completed before the closing date.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cealstats.org/" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Forms
          </a>
        </div>
        
        <p>If you have any questions or need assistance, please contact the CEAL Database administrators.</p>
        
        <p>Best regards,<br>
        CEAL Database Administration</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
        </p>
      </div>
    `;

    // Create broadcast via Resend Broadcast API
    // Reference: https://resend.com/docs/api-reference/broadcasts/create-broadcast
    const broadcast = await resend.broadcasts.create({
      audienceId: audienceId,
      from: 'CEAL Database <notifications@cealstats.org>',
      subject: `CEAL Database Forms Open for ${year} - Action Required`,
      html: emailTemplate
    });

    console.log('✅ Broadcast created successfully:', broadcast.data?.id);

    // Calculate all survey dates (fiscal year and publication date are automatic)
    const surveyDates = getSurveyDates(year, openDate, closeDate);

    // Update all Library_Year records to open for editing with all date fields
    const updateResult = await prisma.library_Year.updateMany({
      where: { year: year },
      data: { 
        is_open_for_editing: true,
        opening_date: surveyDates.openingDate,
        closing_date: surveyDates.closingDate,
        fiscal_year_start: surveyDates.fiscalYearStart,
        fiscal_year_end: surveyDates.fiscalYearEnd,
        publication_date: surveyDates.publicationDate,
        updated_at: new Date()
      }
    });

    // Log the action
    await logUserAction(
      'UPDATE',
      'Library_Year',
      `${year}`,
      null,
      {
        year: year,
        opening_date: openDate.toISOString(),
        closing_date: closeDate.toISOString(),
        broadcast_id: broadcast.data?.id || 'unknown',
        libraries_opened: updateResult.count
      },
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      year: year,
      opening_date: openDate.toISOString(),
      closing_date: closeDate.toISOString(),
      broadcast: {
        id: broadcast.data?.id || 'sent',
        status: 'sent'
      },
      librariesOpened: updateResult.count,
      message: `Forms opened for year ${year}. Notification sent to all CEAL members. ${updateResult.count} libraries opened for editing.`
    });

  } catch (error) {
    console.error('Broadcast API Error:', error);
    
    // Log the error
    try {
      await logUserAction(
        'CREATE',
        'Library_Year',
        'failed',
        null,
        null,
        false,
        error instanceof Error ? error.message : 'Unknown error',
        request
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to open forms and send broadcast',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to preview email template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const openingDate = searchParams.get('openingDate');
    const closingDate = searchParams.get('closingDate');

    if (!year || !openingDate || !closingDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, openingDate, closingDate' },
        { status: 400 }
      );
    }

    // Convert dates to Pacific Time - same logic as POST
    const openDate = convertToEasternTime(openingDate, false); // Midnight PT
    const closeDate = convertToEasternTime(closingDate, true);  // 11:59:59 PM PT
    const totalDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate preview template
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">CEAL Database Forms Now Open for ${year}</h2>
        
        <p>Dear CEAL Member,</p>
        
        <p>The annual data collection forms are now open for academic year <strong>${year}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Important Dates</h3>
          <ul>
            <li><strong>Forms Open:</strong> ${openDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
            <li><strong>Forms Close:</strong> ${closeDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
            <li><strong>Time Period:</strong> ${totalDays} days</li>
          </ul>
        </div>
        
        <p>You can now access and submit your library's data through the CEAL Database system. Please ensure all forms are completed before the closing date.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://cealstats.org" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Forms
          </a>
        </div>
        
        <p>If you have any questions or need assistance, please contact the CEAL Database administrators.</p>
        
        <p>Best regards,<br>
        CEAL Database Administration</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
        </p>
      </div>
    `;

    return NextResponse.json({
      template: emailTemplate,
      preview: {
        year: year,
        openingDate: openDate.toISOString(),
        closingDate: closeDate.toISOString(),
        duration: `${totalDays} days`
      }
    });

  } catch (error) {
    console.error('Template preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    );
  }
}