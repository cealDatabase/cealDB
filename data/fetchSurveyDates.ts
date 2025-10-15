import { PrismaClient } from '@prisma/client';
import { getSurveyDates, formatSurveyDate, getShortDateRange, formatFiscalYear, formatPublicationDate } from '@/lib/surveyDates';

const prisma = new PrismaClient();

export interface FormattedSurveyDates {
  year: number;
  shortDateRange: string; // "Oct 1 - Dec 1, 2025"
  fullOpeningDate: string; // "Monday, October 1, 2025"
  fullClosingDate: string; // "Monday, December 1, 2025"
  fiscalYearPeriod: string; // "July 1, 2024 to June 30, 2025"
  publicationMonth: string; // "February 2026"
  isStoredInDatabase: boolean;
  isCurrentlyOpen: boolean;
}

/**
 * Server-side function to fetch formatted survey dates
 * @param year - Academic year (defaults to current year)
 * @returns Formatted survey dates ready for display
 */
export async function getFormattedSurveyDates(year?: number): Promise<FormattedSurveyDates> {
  const currentYear = year || new Date().getFullYear();

  try {
    // Try to get dates from database
    const libraryYear = await prisma.library_Year.findFirst({
      where: { year: currentYear },
      select: {
        opening_date: true,
        closing_date: true,
        is_open_for_editing: true,
      }
    });

    // Calculate dates (uses database dates if available, otherwise defaults)
    const surveyDates = getSurveyDates(
      currentYear,
      libraryYear?.opening_date,
      libraryYear?.closing_date
    );

    return {
      year: currentYear,
      shortDateRange: getShortDateRange(currentYear, libraryYear?.opening_date, libraryYear?.closing_date),
      fullOpeningDate: formatSurveyDate(surveyDates.openingDate, false),
      fullClosingDate: formatSurveyDate(surveyDates.closingDate, false),
      fiscalYearPeriod: formatFiscalYear(currentYear),
      publicationMonth: formatPublicationDate(currentYear),
      isStoredInDatabase: !!(libraryYear?.opening_date && libraryYear?.closing_date),
      isCurrentlyOpen: libraryYear?.is_open_for_editing || false,
    };

  } catch (error) {
    console.error('Error fetching survey dates:', error);
    
    // Return default calculated dates on error
    const surveyDates = getSurveyDates(currentYear);
    
    return {
      year: currentYear,
      shortDateRange: getShortDateRange(currentYear),
      fullOpeningDate: formatSurveyDate(surveyDates.openingDate, false),
      fullClosingDate: formatSurveyDate(surveyDates.closingDate, false),
      fiscalYearPeriod: formatFiscalYear(currentYear),
      publicationMonth: formatPublicationDate(currentYear),
      isStoredInDatabase: false,
      isCurrentlyOpen: false,
    };
  } finally {
    await prisma.$disconnect();
  }
}
