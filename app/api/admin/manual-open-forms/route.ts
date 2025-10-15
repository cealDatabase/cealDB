import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Manual endpoint to open forms immediately
 * Use this when the cron job hasn't run or forms need to be opened urgently
 */
export async function POST(request: NextRequest) {
  try {
    const { year, userRoles } = await request.json()

    // Verify user is super admin
    if (!userRoles || !userRoles.includes("1")) {
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

    // Update all Library_Year records to open forms
    const updateResult = await prisma.library_Year.updateMany({
      where: { year: parseInt(year) },
      data: { is_open_for_editing: true }
    })

    console.log(`✅ Opened ${updateResult.count} libraries for year ${year}`)

    // Update SurveySession if it exists
    const session = await prisma.surveySession.findFirst({
      where: { academicYear: parseInt(year) }
    })

    if (session) {
      await prisma.surveySession.update({
        where: { id: session.id },
        data: {
          isOpen: true,
          notifiedOnOpen: true
        }
      })
      console.log(`✅ Updated SurveySession for year ${year}`)
    }

    // Update any pending FORM_OPENING events to completed
    await prisma.scheduledEvent.updateMany({
      where: {
        year: parseInt(year),
        event_type: "FORM_OPENING",
        status: "pending"
      },
      data: {
        status: "completed",
        completed_at: new Date(),
        notes: "Manually opened via admin panel"
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully opened ${updateResult.count} libraries for year ${year}`,
      librariesOpened: updateResult.count,
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
  } finally {
    await prisma.$disconnect()
  }
}
