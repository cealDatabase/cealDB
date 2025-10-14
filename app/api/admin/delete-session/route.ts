import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

/**
 * DELETE endpoint to remove a scheduled form session
 * This clears the schedule dates (opening_date, closing_date) but does NOT change
 * the current open/closed status of forms. Forms remain in their current state.
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

    console.log(`📋 Deleting session for year ${year}: ${openLibraries} forms open, ${closedLibraries} forms closed`);
    console.log(`⚠️  Note: Form open/closed status will NOT be changed, only schedule dates will be cleared`);

    // Clear the schedule dates ONLY - do NOT touch is_open_for_editing
    // Forms will remain in their current state (open or closed)
    const updateResult = await prisma.library_Year.updateMany({
      where: { year: year },
      data: {
        opening_date: null,
        closing_date: null,
        fiscal_year_start: null,
        fiscal_year_end: null,
        publication_date: null,
        updated_at: new Date()
        // IMPORTANT: is_open_for_editing is NOT modified - forms keep current status
      }
    });

    // Log the action
    await logUserAction(
      'DELETE',
      'Library_Year_Schedule',
      `year_${year}`,
      {
        year: year,
        records_cleared: updateResult.count
      },
      null,
      true,
      undefined,
      request
    );

    console.log(`✅ Deleted scheduled session for year ${year}, cleared ${updateResult.count} records`);
    console.log(`✅ Forms retained their status: ${openLibraries} remain open, ${closedLibraries} remain closed`);

    return NextResponse.json({
      success: true,
      year: year,
      recordsCleared: updateResult.count,
      formsStatus: {
        open: openLibraries,
        closed: closedLibraries,
        note: 'Form status unchanged - only schedule dates cleared'
      },
      message: `Scheduled session for year ${year} has been deleted. Forms remain in their current state.`
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
