import { getSurveyDates, formatSurveyDate, getShortDateRange, formatFiscalYear, formatPublicationDate } from '@/lib/surveyDates';
import db from '@/lib/db';

const prisma = db;

export interface FormattedSurveyDates {
  year: number;
  shortDateRange: string; // "Oct 1 - Dec 1, 2025"
  fullOpeningDate: string; // "Monday, October 1, 2025"
  fullClosingDate: string; // "Monday, December 1, 2025"
  fiscalYearPeriod: string; // "July 1, 2024 to June 30, 2025"
  publicationMonth: string; // "February 2026"
  isStoredInDatabase: boolean;
  isCurrentlyOpen: boolean;
  // Three-state status system
  status: 'not_set' | 'scheduled' | 'open' | 'closed';
  daysUntilOpening: number | null;
  daysUntilClosing: number | null;
  daysSinceClosed: number | null;
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

    // Calculate three-state status and countdowns
    const now = new Date();
    const openingDateTime = surveyDates.openingDate ? new Date(surveyDates.openingDate) : null;
    const closingDateTime = surveyDates.closingDate ? new Date(surveyDates.closingDate) : null;
    const isStoredInDatabase = !!(libraryYear?.opening_date && libraryYear?.closing_date);
    const isCurrentlyOpen = libraryYear?.is_open_for_editing || false;

    let status: 'not_set' | 'scheduled' | 'open' | 'closed' = 'not_set';
    let daysUntilOpening: number | null = null;
    let daysUntilClosing: number | null = null;
    let daysSinceClosed: number | null = null;

    if (!isStoredInDatabase) {
      status = 'not_set';
    } else if (isCurrentlyOpen) {
      status = 'open';
      if (closingDateTime) {
        daysUntilClosing = Math.ceil((closingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    } else if (openingDateTime && now < openingDateTime) {
      status = 'scheduled';
      daysUntilOpening = Math.ceil((openingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      status = 'closed';
      if (closingDateTime) {
        daysSinceClosed = Math.floor((now.getTime() - closingDateTime.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    return {
      year: currentYear,
      shortDateRange: getShortDateRange(currentYear, libraryYear?.opening_date, libraryYear?.closing_date),
      fullOpeningDate: formatSurveyDate(surveyDates.openingDate, false),
      fullClosingDate: formatSurveyDate(surveyDates.closingDate, false),
      fiscalYearPeriod: formatFiscalYear(currentYear),
      publicationMonth: formatPublicationDate(currentYear),
      isStoredInDatabase,
      isCurrentlyOpen,
      status,
      daysUntilOpening,
      daysUntilClosing,
      daysSinceClosed,
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
      status: 'not_set' as const,
      daysUntilOpening: null,
      daysUntilClosing: null,
      daysSinceClosed: null,
    };}
}
