import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

/**
 * DELETE endpoint to remove a scheduled form session
 * This clears the schedule dates from Library_Year records
 * Also deletes the SurveySession record for the year
 */
export async function DELETE(request: NextRequest) {
  try {
    const { year, userRoles } = await request.json();

    // Verify user is super admin (role ID 1)
    if (!userRoles || !userRoles.includes('1')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    if (!year) {
      return NextResponse.json(
        { error: 'Missing required field: year' },
        { status: 400 }
      );
    }

    // Check if session exists
    const libraryYears = await prisma.library_Year.findMany({
      where: { 
        year: year,
        OR: [
          { opening_date: { not: null } },
          { closing_date: { not: null } }
        ]
      },
      select: {
        id: true,
        is_open_for_editing: true
      }
    });

    if (libraryYears.length === 0) {
      return NextResponse.json(
        { error: `No scheduled session found for year ${year}` },
        { status: 404 }
      );
    }

    // Count current status before deletion (for logging purposes)
    const openLibraries = libraryYears.filter(ly => ly.is_open_for_editing).length;
    const closedLibraries = libraryYears.length - openLibraries;

    console.log(`📋 Deleting session for year ${year}: ${libraryYears.length} Library_Year records`);
    console.log(`   ${openLibraries} forms open, ${closedLibraries} forms closed`);

    // Clear the schedule dates from Library_Year records
    const updateResult = await prisma.library_Year.updateMany({
      where: { year: year },
      data: {
        opening_date: null,
        closing_date: null,
        fiscal_year_start: null,
        fiscal_year_end: null,
        publication_date: null,
        updated_at: new Date()
      }
    });

    // Delete the SurveySession record for this year
    let surveySessionDeleted = false;
    try {
      const deletedSession = await prisma.surveySession.deleteMany({
        where: { academicYear: year }
      });
      surveySessionDeleted = deletedSession.count > 0;
      if (surveySessionDeleted) {
        console.log(`✅ Deleted SurveySession for year ${year}`);
      }
    } catch (sessionErr) {
      console.log(`⚠️  No SurveySession found for year ${year}`);
    }

    // Log the action
    await logUserAction(
      'DELETE',
      'Survey_Session',
      `year_${year}`,
      {
        year: year,
        library_year_records_updated: updateResult.count,
        survey_session_deleted: surveySessionDeleted
      },
      null,
      true,
      undefined,
      request
    );

    console.log(`✅ Cleared scheduled dates for ${updateResult.count} Library_Year records`);

    return NextResponse.json({
      success: true,
      year: year,
      deletedCount: updateResult.count,
      surveySessionDeleted: surveySessionDeleted,
      message: `Survey session for year ${year} has been deleted. Schedule dates cleared from ${updateResult.count} libraries.`
    });

  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete scheduled session',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Also support POST for consistency with other endpoints
export async function POST(request: NextRequest) {
  return DELETE(request);
}
