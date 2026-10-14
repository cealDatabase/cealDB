import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isSuperAdminDb } from '@/lib/auth';
import { logUserAction } from '@/lib/auditLogger';
import { closeSurveyYear, reopenSurveyYear } from '@/lib/surveyControl';

const prisma = db;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    let whereClause;
    
    if (year) {
      whereClause = { year: parseInt(year) };
    } else {
      // Get most recent year with open forms
      const currentYear = new Date().getFullYear();
      whereClause = { year: currentYear };
    }

    // Get Library_Year records for the specified year
    const libraryYears = await prisma.library_Year.findMany({
      where: whereClause,
      include: {
        Library: {
          select: {
            id: true,
            library_name: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    if (libraryYears.length === 0) {
      return NextResponse.json({
        session: null,
        isOpen: false,
        message: year ? `No libraries found for year ${year}` : 'No library records found'
      });
    }

    const openLibraries = libraryYears.filter(ly => ly.is_open_for_editing);
    const isOpen = openLibraries.length > 0;
    const targetYear = libraryYears[0].year;

    return NextResponse.json({
      session: {
        year: targetYear,
        totalLibraries: libraryYears.length,
        openLibraries: openLibraries.length,
        closedLibraries: libraryYears.length - openLibraries.length,
        lastUpdated: libraryYears[0].updated_at,
        libraries: libraryYears.map(ly => ({
          id: ly.id,
          libraryId: ly.library,
          libraryName: ly.Library?.library_name,
          isOpen: ly.is_open_for_editing,
          isActive: ly.is_active,
          adminNotes: ly.admin_notes
        }))
      },
      isOpen: isOpen,
      status: {
        totalLibraries: libraryYears.length,
        openForEditing: openLibraries.length,
        percentage: Math.round((openLibraries.length / libraryYears.length) * 100)
      }
    });

  } catch (error) {
    console.error('Form session status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve form session status' },
      { status: 500 }
    );}
}

export async function PATCH(request: NextRequest) {
  try {
    const { year, action, closingDate } = await request.json();

    // Verify user is super admin (DB-backed, never trust request body)
    if (!(await isSuperAdminDb())) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      );
    }

    if (!year || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: year, action' },
        { status: 400 }
      );
    }

    // Check if Library_Year records exist for this year
    const existingLibraries = await prisma.library_Year.findMany({
      where: { year: year }
    });

    if (existingLibraries.length === 0) {
      return NextResponse.json(
        { error: `No library records found for year ${year}` },
        { status: 404 }
      );
    }

    // Both actions also update the year's SurveySession, so the daily job
    // agrees with the admin (lib/surveyControl.ts).
    let librariesAffected = 0;
    let adminNote = '';
    let closesAtLabel: string | null = null;

    switch (action) {
      case 'close': {
        const result = await closeSurveyYear(year);
        librariesAffected = result.librariesClosed;
        adminNote = `Forms closed by admin on ${new Date().toISOString()}`;
        break;
      }

      case 'reopen': {
        const result = await reopenSurveyYear(year, closingDate ?? null);
        if (!result.ok) {
          return NextResponse.json(
            { error: result.error, needsClosingDate: result.needsClosingDate ?? false, closingDate: result.closingDate },
            { status: result.status }
          );
        }
        librariesAffected = result.librariesOpened;
        closesAtLabel = result.closesAtLabel;
        adminNote = `Forms reopened by admin on ${new Date().toISOString()}`;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: close, reopen' },
          { status: 400 }
        );
    }

    const libraryUpdateResult = { count: librariesAffected };

    // Log the action
    await logUserAction(
      'UPDATE',
      'Library_Year',
      `year_${year}`,
      null,
      {
        year: year,
        action: action,
        libraries_affected: libraryUpdateResult.count,
        admin_note: adminNote
      },
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      year: year,
      action: action,
      librariesUpdated: libraryUpdateResult.count,
      closesAt: closesAtLabel,
      message: `Forms ${action} completed successfully for ${libraryUpdateResult.count} libraries in year ${year}${closesAtLabel ? `. They close automatically on ${closesAtLabel}.` : ''}`
    });

  } catch (error) {
    console.error('Form session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update form session' },
      { status: 500 }
    );}
}