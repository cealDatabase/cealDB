import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSurveyDates } from '@/lib/surveyDates';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

/**
 * GET /api/admin/survey-dates
 * Fetch survey dates for a specific year (for admin editing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Get any Library_Year record for this year to check existing dates
    const libraryYear = await prisma.library_Year.findFirst({
      where: { year: year },
      select: {
        opening_date: true,
        closing_date: true,
        fiscal_year_start: true,
        fiscal_year_end: true,
        publication_date: true,
        is_open_for_editing: true,
      }
    });

    // Calculate dates (uses DB dates if available, otherwise defaults)
    const surveyDates = getSurveyDates(
      year,
      libraryYear?.opening_date,
      libraryYear?.closing_date
    );

    // Count how many Library_Year records exist for this year
    const recordCount = await prisma.library_Year.count({
      where: { year: year }
    });

    return NextResponse.json({
      success: true,
      year: year,
      dates: {
        openingDate: surveyDates.openingDate.toISOString(),
        closingDate: surveyDates.closingDate.toISOString(),
        fiscalYearStart: surveyDates.fiscalYearStart.toISOString(),
        fiscalYearEnd: surveyDates.fiscalYearEnd.toISOString(),
        publicationDate: surveyDates.publicationDate.toISOString(),
      },
      hasCustomDates: !!(libraryYear?.opening_date && libraryYear?.closing_date),
      isCurrentlyOpen: libraryYear?.is_open_for_editing || false,
      libraryRecordsCount: recordCount,
      message: recordCount === 0 
        ? `No Library_Year records exist for ${year}. Dates will be saved when you update them.`
        : `Found ${recordCount} Library_Year records for ${year}.`
    });

  } catch (error) {
    console.error('Survey dates fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch survey dates',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );}
}

/**
 * PUT /api/admin/survey-dates
 * Update survey dates for a specific year (creates/updates Library_Year records)
 */
export async function PUT(request: NextRequest) {
  try {
    const { year, openingDate, closingDate, userRoles } = await request.json();

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

    // Convert dates to Pacific Time to prevent timezone issues
    // IMPORTANT: When user selects 12/19, forms should close at 11:59 PM Pacific on 12/19
    // This is stored as 12/20 7:59 AM UTC (PST = UTC-8)
    const toPacificMidnight = (dateStr: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d, 8, 0, 0)); // 12:00 AM Pacific = 8:00 AM UTC
    };
    
    const toPacificEndOfDay = (dateStr: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      // User picks date D → close at 11:59 PM Pacific on D → store as D+1 7:59 AM UTC
      return new Date(Date.UTC(y, m - 1, d + 1, 7, 59, 0));
    };

    const openDate = toPacificMidnight(openingDate);
    const closeDate = toPacificEndOfDay(closingDate);
    
    if (closeDate <= openDate) {
      return NextResponse.json(
        { error: 'Closing date must be after opening date' },
        { status: 400 }
      );
    }

    // Calculate all survey dates (fiscal year and publication are automatic)
    const surveyDates = getSurveyDates(year, openDate, closeDate);

    // Check if Library_Year records exist for this year
    const existingCount = await prisma.library_Year.count({
      where: { year: year }
    });

    if (existingCount === 0) {
      // No records exist - we need to create them
      // Get all libraries to create Library_Year records for each
      const libraries = await prisma.library.findMany({
        select: { id: true }
      });

      // Create Library_Year records for all libraries
      const createPromises = libraries.map(library => 
        prisma.library_Year.create({
          data: {
            library: library.id,
            year: year,
            is_open_for_editing: false, // Don't auto-open, just set dates
            opening_date: surveyDates.openingDate,
            closing_date: surveyDates.closingDate,
            fiscal_year_start: surveyDates.fiscalYearStart,
            fiscal_year_end: surveyDates.fiscalYearEnd,
            publication_date: surveyDates.publicationDate,
            updated_at: new Date(),
            is_active: true,
          }
        })
      );

      await Promise.all(createPromises);

      // Log the action
      await logUserAction(
        'CREATE',
        'Library_Year',
        `dates_${year}`,
        null,
        {
          year: year,
          opening_date: surveyDates.openingDate.toISOString(),
          closing_date: surveyDates.closingDate.toISOString(),
          fiscal_year_start: surveyDates.fiscalYearStart.toISOString(),
          fiscal_year_end: surveyDates.fiscalYearEnd.toISOString(),
          publication_date: surveyDates.publicationDate.toISOString(),
          libraries_created: libraries.length,
          action: 'Set survey dates and created Library_Year records'
        },
        true,
        undefined,
        request
      );

      return NextResponse.json({
        success: true,
        year: year,
        dates: {
          openingDate: surveyDates.openingDate.toISOString(),
          closingDate: surveyDates.closingDate.toISOString(),
          fiscalYearStart: surveyDates.fiscalYearStart.toISOString(),
          fiscalYearEnd: surveyDates.fiscalYearEnd.toISOString(),
          publicationDate: surveyDates.publicationDate.toISOString(),
        },
        recordsCreated: libraries.length,
        message: `Survey dates set for ${year}. Created ${libraries.length} Library_Year records.`
      });

    } else {
      // Records exist - update them with new dates
      const updateResult = await prisma.library_Year.updateMany({
        where: { year: year },
        data: {
          opening_date: surveyDates.openingDate,
          closing_date: surveyDates.closingDate,
          fiscal_year_start: surveyDates.fiscalYearStart,
          fiscal_year_end: surveyDates.fiscalYearEnd,
          publication_date: surveyDates.publicationDate,
          updated_at: new Date(),
        }
      });

      // Log the action
      await logUserAction(
        'UPDATE',
        'Library_Year',
        `dates_${year}`,
        null,
        {
          year: year,
          opening_date: surveyDates.openingDate.toISOString(),
          closing_date: surveyDates.closingDate.toISOString(),
          fiscal_year_start: surveyDates.fiscalYearStart.toISOString(),
          fiscal_year_end: surveyDates.fiscalYearEnd.toISOString(),
          publication_date: surveyDates.publicationDate.toISOString(),
          records_updated: updateResult.count,
          action: 'Updated survey dates'
        },
        true,
        undefined,
        request
      );

      return NextResponse.json({
        success: true,
        year: year,
        dates: {
          openingDate: surveyDates.openingDate.toISOString(),
          closingDate: surveyDates.closingDate.toISOString(),
          fiscalYearStart: surveyDates.fiscalYearStart.toISOString(),
          fiscalYearEnd: surveyDates.fiscalYearEnd.toISOString(),
          publicationDate: surveyDates.publicationDate.toISOString(),
        },
        recordsUpdated: updateResult.count,
        message: `Survey dates updated for ${year}. ${updateResult.count} Library_Year records updated.`
      });
    }

  } catch (error) {
    console.error('Survey dates update error:', error);
    
    // Log the error
    try {
      await logUserAction(
        'UPDATE',
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
        success: false,
        error: 'Failed to update survey dates',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );}
}
