import { NextRequest, NextResponse } from "next/server"
import { isSuperAdminDb } from '@/lib/auth'
import { logUserAction } from '@/lib/auditLogger'
import { reopenSurveyYear } from '@/lib/surveyControl'

/**
 * Manual endpoint to open forms immediately
 * Use this when the cron job hasn't run or forms need to be opened urgently
 */
export async function POST(request: NextRequest) {
  try {
    const { year, closingDate } = await request.json()

    // Verify user is super admin (DB-backed, never trust request body)
    if (!(await isSuperAdminDb())) {
      return NextResponse.json(
        { error: "Unauthorized: Super Admin access required" },
        { status: 403 }
      )
    }

    if (!year) {
      return NextResponse.json(
        { error: "Year is required" },
        { status: 400 }
      )
    }

    console.log(`🔓 Manually opening forms for year ${year}`)

    // Shared with the form-session "reopen" action; see lib/surveyControl.ts
    // for how this keeps the daily job in step with the manual open.
    const result = await reopenSurveyYear(parseInt(year), closingDate ?? null)
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, needsClosingDate: result.needsClosingDate ?? false, closingDate: result.closingDate },
        { status: result.status }
      )
    }

    await logUserAction(
      "UPDATE",
      "Library_Year",
      `year_${year}`,
      null,
      {
        year: parseInt(year),
        action: "manual_open",
        libraries_affected: result.librariesOpened,
        closes_at: result.closesAt?.toISOString() ?? null,
        new_closing_date: closingDate ?? null,
      },
      true,
      undefined,
      request
    )

    console.log(`✅ Opened ${result.librariesOpened} libraries for year ${year}`)

    return NextResponse.json({
      success: true,
      message: result.closesAtLabel
        ? `Successfully opened ${result.librariesOpened} libraries for year ${year}. They close automatically on ${result.closesAtLabel}.`
        : `Successfully opened ${result.librariesOpened} libraries for year ${year}. No schedule exists for this year, so they stay open until closed manually.`,
      librariesOpened: result.librariesOpened,
      closesAt: result.closesAt?.toISOString() ?? null,
      year: year
    })

  } catch (error) {
    console.error("Manual open forms error:", error)
    return NextResponse.json(
      {
        error: "Failed to open forms",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
