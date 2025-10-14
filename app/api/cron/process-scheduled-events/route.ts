/**
 * NEW Cron Job Handler for ScheduledEvent System
 * 
 * Purpose: Execute scheduled events (BROADCAST, FORM_OPENING, FORM_CLOSING) at correct Pacific Time
 * 
 * Schedule: Runs at 8:00 AM UTC = 12:00 AM PST (winter) or 1:00 AM PDT (summer)
 * 
 * How Pacific Time is Handled:
 * - Scheduled dates are stored in UTC in database
 * - Cron compares Pacific DATE (not time) to scheduled date
 * - Events trigger when Pacific date matches scheduled date
 * - This ensures forms open at midnight Pacific, regardless of DST
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

/**
 * Get current date in Pacific Time (ignoring time, just date)
 */
function getPacificDate(): Date {
  const now = new Date();
  
  // Convert to Pacific Time string, then extract just the date
  const pacificDateString = now.toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Parse to get Pacific midnight
  const [month, day, year] = pacificDateString.split('/');
  const pacificMidnight = new Date(`${year}-${month}-${day}T00:00:00-08:00`); // Use PST offset for consistency
  
  console.log('🕐 Current time (UTC):', now.toISOString());
  console.log('📅 Pacific Date:', pacificDateString);
  console.log('🌙 Pacific Midnight:', pacificMidnight.toISOString());
  
  return pacificMidnight;
}

/**
 * Check if a scheduled date matches today's Pacific date
 */
function shouldRunToday(scheduledDate: Date): boolean {
  const pacificToday = getPacificDate();
  const scheduledDateObj = new Date(scheduledDate);
  
  // Compare dates only (ignore time)
  const todayDateStr = pacificToday.toISOString().split('T')[0];
  const scheduledDateStr = scheduledDateObj.toISOString().split('T')[0];
  
  const shouldRun = scheduledDateStr <= todayDateStr;
  
  console.log(`   Scheduled: ${scheduledDateStr}, Today: ${todayDateStr}, Should Run: ${shouldRun}`);
  
  return shouldRun;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🕐 Scheduled Events Cron started:', new Date().toISOString());

  // Verify this is a legitimate cron request from Vercel
  if (process.env.NODE_ENV === 'production') {
    const cronHeader = request.headers.get('x-vercel-cron');
    const authHeader = request.headers.get('authorization');
    
    const isVercelCron = cronHeader !== null;
    const isAuthorizedManual = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    if (!isVercelCron && !isAuthorizedManual) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Authorized cron request:', isVercelCron ? 'Vercel Cron' : 'Manual Bearer Token');
  }

  const results = {
    broadcasts_sent: [] as number[],
    forms_opened: [] as number[],
    forms_closed: [] as number[],
    errors: [] as string[]
  };

  try {
    const pacificToday = getPacificDate();

    // ========================================
    // STEP 1: Process BROADCAST Events
    // ========================================
    const broadcastEvents = await prisma.scheduledEvent.findMany({
      where: {
        event_type: 'BROADCAST',
        status: 'pending',
        scheduled_date: {
          lte: pacificToday // Scheduled date has arrived (Pacific Time)
        }
      }
    });

    console.log(`📧 Found ${broadcastEvents.length} broadcast events to process`);

    for (const event of broadcastEvents) {
      if (!shouldRunToday(event.scheduled_date)) {
        console.log(`⏭️  Skipping broadcast for year ${event.year} - not scheduled for today`);
        continue;
      }

      try {
        console.log(`📧 Sending broadcast for year ${event.year}`);

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
        const totalDays = Math.ceil((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));

        // Create email template
        const emailTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">CEAL Database Forms Now Open for ${event.year}</h2>
            
            <p>Dear CEAL Member,</p>
            
            <p>The annual data collection forms are now open for academic year <strong>${event.year}</strong>.</p>
            
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

        // Send broadcast via Resend
        const broadcast = await resend.broadcasts.create({
          audienceId: audienceId,
          from: 'CEAL Database <noreply@cealstats.org>',
          subject: `CEAL Database Forms Now Open for ${event.year}`,
          html: emailTemplate
        });

        console.log('✅ Broadcast sent:', broadcast.data?.id);

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
            completed_at: new Date()
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
            broadcast_id: broadcast.data?.id,
            scheduled_date: event.scheduled_date.toISOString()
          },
          true,
          undefined,
          request
        );

        results.broadcasts_sent.push(event.year);
      } catch (error) {
        const errorMsg = `Failed to send broadcast for year ${event.year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // ========================================
    // STEP 2: Process FORM_OPENING Events
    // ========================================
    const openingEvents = await prisma.scheduledEvent.findMany({
      where: {
        event_type: 'FORM_OPENING',
        status: 'pending',
        scheduled_date: {
          lte: pacificToday
        }
      }
    });

    console.log(`📂 Found ${openingEvents.length} form opening events to process`);

    for (const event of openingEvents) {
      if (!shouldRunToday(event.scheduled_date)) {
        console.log(`⏭️  Skipping form opening for year ${event.year} - not scheduled for today`);
        continue;
      }

      try {
        console.log(`📂 Opening forms for year ${event.year}`);

        // Open all forms for this year
        const updateResult = await prisma.library_Year.updateMany({
          where: { year: event.year },
          data: { is_open_for_editing: true }
        });

        console.log(`✅ Opened ${updateResult.count} libraries for year ${event.year}`);

        // Mark event as completed
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date()
          }
        });

        // Log the action
        await logUserAction(
          'SYSTEM_OPEN_FORMS',
          'ScheduledEvent',
          event.id.toString(),
          null,
          {
            year: event.year,
            libraries_opened: updateResult.count,
            scheduled_date: event.scheduled_date.toISOString()
          },
          true,
          undefined,
          request
        );

        results.forms_opened.push(event.year);
      } catch (error) {
        const errorMsg = `Failed to open forms for year ${event.year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // ========================================
    // STEP 3: Process FORM_CLOSING Events
    // ========================================
    const closingEvents = await prisma.scheduledEvent.findMany({
      where: {
        event_type: 'FORM_CLOSING',
        status: 'pending',
        scheduled_date: {
          lte: pacificToday
        }
      }
    });

    console.log(`🔒 Found ${closingEvents.length} form closing events to process`);

    for (const event of closingEvents) {
      if (!shouldRunToday(event.scheduled_date)) {
        console.log(`⏭️  Skipping form closing for year ${event.year} - not scheduled for today`);
        continue;
      }

      try {
        console.log(`🔒 Closing forms for year ${event.year}`);

        // Close all forms for this year
        const updateResult = await prisma.library_Year.updateMany({
          where: { year: event.year },
          data: { is_open_for_editing: false }
        });

        console.log(`✅ Closed ${updateResult.count} libraries for year ${event.year}`);

        // Mark event as completed
        await prisma.scheduledEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            completed_at: new Date()
          }
        });

        // Log the action
        await logUserAction(
          'SYSTEM_CLOSE_FORMS',
          'ScheduledEvent',
          event.id.toString(),
          null,
          {
            year: event.year,
            libraries_closed: updateResult.count,
            scheduled_date: event.scheduled_date.toISOString()
          },
          true,
          undefined,
          request
        );

        results.forms_closed.push(event.year);
      } catch (error) {
        const errorMsg = `Failed to close forms for year ${event.year}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        results.errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      pacificDate: getPacificDate().toISOString(),
      duration: `${duration}ms`,
      results: {
        broadcasts_sent: results.broadcasts_sent,
        forms_opened: results.forms_opened,
        forms_closed: results.forms_closed,
        errors: results.errors
      },
      message: `Sent ${results.broadcasts_sent.length} broadcasts, opened ${results.forms_opened.length} sessions, closed ${results.forms_closed.length} sessions${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
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

// Support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
