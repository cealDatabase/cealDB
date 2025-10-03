import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSurveyDates } from '@/lib/surveyDates';

const prisma = new PrismaClient();

/**
 * GET /api/survey-dates
 * Fetches survey dates for a given year
 * If dates aren't in database, returns calculated defaults
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Try to get dates from any Library_Year record for this year
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

    // If dates exist in database, use them; otherwise calculate defaults
    const surveyDates = getSurveyDates(
      year,
      libraryYear?.opening_date,
      libraryYear?.closing_date
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
      isStoredInDatabase: !!(libraryYear?.opening_date && libraryYear?.closing_date),
      isCurrentlyOpen: libraryYear?.is_open_for_editing || false,
    });

  } catch (error) {
    console.error('Survey dates API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch survey dates',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
