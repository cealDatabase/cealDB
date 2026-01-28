// Debug endpoint to check library year status
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ libid: string }> }
) {
  try {
    const { libid } = await params;
    const libraryId = Number(libid);
    const currentYear = new Date().getFullYear();

    // Find all library years for this library
    const allLibraryYears = await db.library_Year.findMany({
      where: {
        library: libraryId,
      },
      orderBy: {
        year: 'desc'
      }
    });

    // Find current year
    const currentYearRecord = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    // Find survey session for current year
    const surveySession = await db.surveySession.findFirst({
      where: {
        academicYear: currentYear,
      },
    });

    return NextResponse.json({
      libraryId,
      currentYear,
      currentYearRecord,
      surveySession,
      allLibraryYears,
    });

  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error?.message },
      { status: 500 }
    );
  }
}
