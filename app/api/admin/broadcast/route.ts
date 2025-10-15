import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { Resend } from "resend"
import { logUserAction } from "@/lib/auditLogger"
import { getSurveyDates } from "@/lib/surveyDates"
import { convertToEasternTime, formatAsEasternTime } from "@/lib/timezoneUtils"
import { formatDateRange, formatDateWithWeekday } from "@/lib/dateFormatting"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { openingDate, closingDate, year, userRoles, sendImmediately = false } = await request.json()

    // Verify user is super admin (role contains 1)
    if (!userRoles || !userRoles.includes("1")) {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 })
    }

    // Validate required fields
    if (!openingDate || !closingDate || !year) {
      return NextResponse.json({ error: "Missing required fields: openingDate, closingDate, year" }, { status: 400 })
    }

    console.log(`📧 Broadcast mode: ${sendImmediately ? "IMMEDIATE" : "SCHEDULED"}`)

    // Convert dates to Pacific Time (PT) at midnight, then to UTC
    const openDate = convertToEasternTime(openingDate, false) // Midnight PT
    const closeDate = convertToEasternTime(closingDate, true) // 11:59:59 PM PT

    console.log("📅 Date Conversion Summary (Pacific Time):")
    console.log("  Opening:", openingDate, "→", formatAsEasternTime(openDate))
    console.log("  Opening UTC:", openDate.toISOString())
    console.log("  Closing:", closingDate, "→", formatAsEasternTime(closeDate))
    console.log("  Closing UTC:", closeDate.toISOString())

    if (closeDate <= openDate) {
      return NextResponse.json({ error: "Closing date must be after opening date" }, { status: 400 })
    }

    // Check for existing scheduled sessions
    const now = new Date()
    const existingSessions = await prisma.library_Year.findMany({
      where: {
        OR: [{ opening_date: { not: null } }, { closing_date: { not: null } }],
      },
      select: {
        year: true,
        opening_date: true,
        closing_date: true,
        is_open_for_editing: true,
      },
      distinct: ["year"],
    })

    // Filter to find scheduled (future) or active sessions
    const activeOrScheduledSessions = existingSessions.filter((session) => {
      if (!session.opening_date || !session.closing_date) return false

      const openingDate = new Date(session.opening_date)
      const closingDate = new Date(session.closing_date)

      return now < closingDate
    })

    // Check if there's an existing session for THIS year
    const existingSessionForThisYear = activeOrScheduledSessions.find(s => s.year === Number.parseInt(year))
    
    // Check if there are sessions for OTHER years
    const sessionsForOtherYears = activeOrScheduledSessions.filter(s => s.year !== Number.parseInt(year))

    // Only block if trying to create a session when OTHER years have active sessions
    if (sessionsForOtherYears.length > 0) {
      const sessionYears = sessionsForOtherYears.map((s) => s.year).join(", ")
      return NextResponse.json(
        {
          error: "Cannot create new session: existing sessions found",
          detail: `There ${sessionsForOtherYears.length === 1 ? "is" : "are"} ${sessionsForOtherYears.length} existing scheduled or active session${sessionsForOtherYears.length === 1 ? "" : "s"} for year${sessionsForOtherYears.length === 1 ? "" : "s"}: ${sessionYears}. Please delete the existing session${sessionsForOtherYears.length === 1 ? "" : "s"} before creating a new one.`,
          existingSessions: sessionsForOtherYears.map((s) => ({
            year: s.year,
            opening_date: s.opening_date,
            closing_date: s.closing_date,
            is_active: s.is_open_for_editing,
          })),
        },
        { status: 409 },
      )
    }
    
    // Flag to track if this is for an existing session
    const isExistingSession = existingSessionForThisYear !== undefined
    console.log(`📋 Session check: Year ${year} ${isExistingSession ? 'HAS existing session' : 'is NEW session'}`)

    // Check if RESEND_API_KEY is available
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Initialize Resend at runtime
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Calculate survey dates
    const surveyDates = getSurveyDates(year, openDate, closeDate)

    // Calculate fiscal year dates for the email
    const reportingYearEnd = new Date(Number.parseInt(year), 9, 1) // October 1 of next year

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinators of the CEAL Statistics Survey,</h3>
        
        <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>
        
        <p style="margin-bottom: 16px;"><i>You are receiving this message because you are listed in the CEAL Statistics Database as the primary contact or CEAL statistics coordinator for your institution. If you are no longer serving in this role, please reply to this email with updated contact information for your institution. Thank you for your cooperation.</i></p>
        
        <div style="margin: 24px 0;">
          <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
          <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) ${Number.parseInt(year) - 1}–${year}</strong>, defined as the most recent 12-month period ending before October 1, ${year}, corresponding to your institution's fiscal year. For most institutions, this period covers <strong>
          July 1, ${Number.parseInt(year) - 1} through June 30, ${year}</strong>.</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
          <p style="margin: 0;">The CEAL Online Survey will be open from <strong>${formatDateRange(openDate, closeDate)} (11:59 p.m. Pacific Time)</strong>.</p>
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
        <p style="font-size: 12px; color: #6b7280; text-align: left;">
          You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
        </p>
      </div>
    `

    // Get audience ID from environment
    const audienceId = process.env.RESEND_BROADCAST_LIST_ID
    if (!audienceId) {
      return NextResponse.json(
        {
          error: "Broadcast audience ID not configured. Please set RESEND_BROADCAST_LIST_ID in environment variables.",
        },
        { status: 500 },
      )
    }

    console.log("📧 Creating broadcast with Resend API...")
    console.log("Audience ID:", audienceId)
    console.log("Year:", year)
    console.log("Opening Date:", openDate.toISOString())
    console.log("Closing Date:", closeDate.toISOString())

    let broadcast: any = null
    let updateResult: any = null

    // ========================================
    // BRANCH 1: SEND BROADCAST IMMEDIATELY
    // ========================================
    if (sendImmediately) {
      console.log("🚀 IMMEDIATE MODE: Sending broadcast and opening forms NOW")

      // Send broadcast via Resend
      try {
        // Step 1: Create the broadcast (saves as draft)
        broadcast = await resend.broadcasts.create({
          audienceId: audienceId,
          from: "CEAL Statistics Database <noreply@cealstats.org>",
          subject: `CEAL Statistics Online Surveys Are Now Open`,
          html: emailTemplate,
        })

        console.log("✅ Broadcast created with ID:", broadcast.data?.id)

        // Step 2: Send the broadcast immediately
        if (broadcast.data?.id) {
          await resend.broadcasts.send(broadcast.data.id)
          console.log("✅ Broadcast sent immediately:", broadcast.data.id)
        } else {
          throw new Error("No broadcast ID returned from Resend")
        }
      } catch (emailError) {
        console.error("❌ Failed to send broadcast email:", emailError)
        throw new Error(
          "Failed to send broadcast email: " + (emailError instanceof Error ? emailError.message : "Unknown error"),
        )
      }

      // Open all forms immediately AND mark broadcast as sent
      updateResult = await prisma.library_Year.updateMany({
        where: { year: year },
        data: {
          is_open_for_editing: true,
          broadcast_sent: true,
          opening_date: surveyDates.openingDate,
          closing_date: surveyDates.closingDate,
          fiscal_year_start: surveyDates.fiscalYearStart,
          fiscal_year_end: surveyDates.fiscalYearEnd,
          publication_date: surveyDates.publicationDate,
          updated_at: new Date(),
        },
      })

      // Create or update SurveySession record
      if (isExistingSession) {
        // Update existing session
        await prisma.surveySession.updateMany({
          where: { academicYear: Number.parseInt(year) },
          data: {
            isOpen: true,
            notifiedOnOpen: true,
            updatedAt: new Date(),
          },
        })
        console.log(`✅ Updated existing SurveySession for year ${year}`)
      } else {
        // Create new session
        await prisma.surveySession.create({
          data: {
            academicYear: Number.parseInt(year),
            openingDate: openDate,
            closingDate: closeDate,
            isOpen: true,
            notifiedOnOpen: true,
          },
        })
        console.log(`✅ Created new SurveySession for year ${year}`)
      }

      // Create COMPLETED scheduled events for record keeping
      await prisma.scheduledEvent.createMany({
        data: [
          {
            event_type: "BROADCAST",
            year,
            scheduled_date: openDate,
            status: "completed",
            completed_at: new Date(),
            notes: "Broadcast sent immediately",
          },
          {
            event_type: "FORM_OPENING",
            year,
            scheduled_date: openDate,
            status: "completed",
            completed_at: new Date(),
            notes: "Forms opened immediately",
          },
          {
            event_type: "FORM_CLOSING",
            year,
            scheduled_date: closeDate,
            status: "pending",
            notes: "Scheduled to close automatically",
          },
        ],
      })

      console.log(`✅ Broadcast sent immediately to ${audienceId}`)
      console.log(`✅ ${updateResult.count} libraries opened for year ${year}`)
      console.log(`✅ SurveySession created for year ${year}`)
    }
    // ========================================
    // BRANCH 2: SCHEDULE BROADCAST FOR LATER
    // ========================================
    else {
      console.log("📅 SCHEDULED MODE: Creating scheduled broadcast via Resend")

      // Schedule broadcast via Resend with scheduledAt parameter
      try {
        // Create broadcast with schedule time (TypeScript workaround)
        const broadcastOptions: any = {
          audienceId: audienceId,
          from: "CEAL Statistics Database <noreply@cealstats.org>",
          subject: `CEAL Statistics Online Surveys Are Now Open`,
          html: emailTemplate,
          scheduledAt: openDate.toISOString(), // Resend will automatically send at this time
        }
        
        broadcast = await resend.broadcasts.create(broadcastOptions)

        console.log("✅ Broadcast scheduled with ID:", broadcast.data?.id)
        console.log("✅ Will be sent automatically on:", openDate.toISOString())
      } catch (emailError) {
        console.error("❌ Failed to schedule broadcast email:", emailError)
        throw new Error(
          "Failed to schedule broadcast email: " + (emailError instanceof Error ? emailError.message : "Unknown error"),
        )
      }

      // Do NOT open forms yet - keep forms CLOSED until opening date
      updateResult = await prisma.library_Year.updateMany({
        where: { year: year },
        data: {
          is_open_for_editing: false,
          broadcast_sent: false,
          opening_date: surveyDates.openingDate,
          closing_date: surveyDates.closingDate,
          fiscal_year_start: surveyDates.fiscalYearStart,
          fiscal_year_end: surveyDates.fiscalYearEnd,
          publication_date: surveyDates.publicationDate,
          updated_at: new Date(),
        },
      })

      // Create or update SurveySession record (scheduled, not yet open)
      if (isExistingSession) {
        // Update existing session
        await prisma.surveySession.updateMany({
          where: { academicYear: Number.parseInt(year) },
          data: {
            openingDate: openDate,
            closingDate: closeDate,
            isOpen: false,
            notifiedOnOpen: false,
            updatedAt: new Date(),
          },
        })
        console.log(`✅ Updated existing SurveySession for year ${year} (scheduled)`)
      } else {
        // Create new session
        await prisma.surveySession.create({
          data: {
            academicYear: Number.parseInt(year),
            openingDate: openDate,
            closingDate: closeDate,
            isOpen: false,
            notifiedOnOpen: false,
          },
        })
        console.log(`✅ Created new SurveySession for year ${year} (scheduled)`)
      }

      // Create three SEPARATE pending scheduled events
      await prisma.scheduledEvent.createMany({
        data: [
          {
            event_type: "BROADCAST",
            year,
            scheduled_date: openDate,
            status: "pending",
            notes: "Broadcast email to be sent on this date",
          },
          {
            event_type: "FORM_OPENING",
            year,
            scheduled_date: openDate,
            status: "pending",
            notes: "Forms will open on this date",
          },
          {
            event_type: "FORM_CLOSING",
            year,
            scheduled_date: closeDate,
            status: "pending",
            notes: "Forms will close on this date",
          },
        ],
      })

      console.log("📅 Created SurveySession for year", year, "(scheduled, not yet open)")
      console.log("📅 Created 3 separate scheduled events for form automation:")
      console.log("   1. BROADCAST on", openDate.toISOString(), "(handled by Resend)")
      console.log("   2. FORM_OPENING on", openDate.toISOString(), "(needs cron job)")
      console.log("   3. FORM_CLOSING on", closeDate.toISOString(), "(needs cron job)")
    }

    // Log the action
    await logUserAction(
      "UPDATE",
      "Library_Year",
      `${year}`,
      null,
      {
        year: year,
        opening_date: openDate.toISOString(),
        closing_date: closeDate.toISOString(),
        broadcast_id: broadcast.data?.id || "unknown",
        libraries_opened: updateResult.count,
      },
      true,
      undefined,
      request,
    )

    const responseMessage = sendImmediately
      ? `Broadcast sent immediately and ${updateResult.count} libraries opened for year ${year}. Forms will automatically close on ${formatDateWithWeekday(closeDate)} at 11:59 PM Pacific Time.`
      : `Session scheduled for year ${year}. Three separate events created: 1) Broadcast email, 2) Form opening, 3) Form closing. All events can be managed individually in the Session Queue. ${updateResult.count} libraries scheduled.`

    return NextResponse.json({
      success: true,
      year: year,
      opening_date: openDate.toISOString(),
      closing_date: closeDate.toISOString(),
      broadcast: {
        id: broadcast?.data?.id || (sendImmediately ? "sent" : "scheduled"),
        status: sendImmediately ? "sent" : "scheduled",
      },
      sendMode: sendImmediately ? "immediate" : "scheduled",
      librariesAffected: updateResult.count,
      message: responseMessage,
    })
  } catch (error) {
    console.error("Broadcast API Error:", error)

    // Log the error
    try {
      await logUserAction(
        "CREATE",
        "Library_Year",
        "failed",
        null,
        null,
        false,
        error instanceof Error ? error.message : "Unknown error",
        request,
      )
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    return NextResponse.json(
      {
        error: "Failed to open forms and send broadcast",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year")
    const openingDate = searchParams.get("openingDate")
    const closingDate = searchParams.get("closingDate")

    if (!year || !openingDate || !closingDate) {
      return NextResponse.json(
        { error: "Missing required parameters: year, openingDate, closingDate" },
        { status: 400 },
      )
    }

    // Convert dates to Pacific Time
    const openDate = convertToEasternTime(openingDate, false)
    const closeDate = convertToEasternTime(closingDate, true)

    // Calculate fiscal year dates
    const fiscalYearStart = new Date(Number.parseInt(year) - 1, 6, 1) // July 1
    const fiscalYearEnd = new Date(Number.parseInt(year), 5, 30) // June 30 of next year
    const reportingYearEnd = new Date(Number.parseInt(year), 9, 1) // October 1 of next year

    // Generate preview template with new design
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinators of the CEAL Statistics Survey,</h3>
        
        <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>
        
        <p style="margin-bottom: 16px;"><i>You are receiving this message because you are listed in the CEAL Statistics Database as the primary contact or CEAL statistics coordinator for your institution. If you are no longer serving in this role, please reply to this email with updated contact information for your institution. Thank you for your cooperation.</i></p>
        
        <div style="margin: 24px 0;">
          <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
          <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) ${Number.parseInt(year) - 1}–${year}</strong>, defined as the most recent 12-month period ending before October 1, ${year}, corresponding to your institution's fiscal year. For most institutions, this period covers <strong>
          July 1, ${Number.parseInt(year) - 1} through June 30, ${year}
          </strong>.</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
          <p style="margin: 0;">The CEAL Online Survey will be open from <strong>${formatDateRange(openDate, closeDate)} (11:59 p.m. Pacific Time)</strong>.</p>
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
        <p style="font-size: 12px; color: #6b7280; text-align: left;">
          You can unsubscribe from these notifications here: {{{RESEND_UNSUBSCRIBE_URL}}}
        </p>
      </div>
    `

    return NextResponse.json({
      template: emailTemplate,
      preview: {
        year: year,
        openingDate: openDate.toISOString(),
        closingDate: closeDate.toISOString(),
        fiscalYearStart: fiscalYearStart.toISOString(),
        fiscalYearEnd: fiscalYearEnd.toISOString(),
      },
    })
  } catch (error) {
    console.error("Template preview error:", error)
    return NextResponse.json({ error: "Failed to generate template preview" }, { status: 500 })
  }
}
