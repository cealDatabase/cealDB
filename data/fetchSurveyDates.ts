import { getSurveyDates, getShortDateRange, formatFiscalYear, formatPublicationDate } from '@/lib/surveyDates';
import { formatOpeningDate, formatClosingDate } from '@/lib/surveyTime';
import db from '@/lib/db';

const prisma = db;

export interface FormattedSurveyDates {
  year: number;
  shortDateRange: string; // "Oct 1 - Dec 1, 2025"
  fullOpeningDate: string; // "Thursday, October 15, 2026" (Eastern calendar)
  fullClosingDate: string; // "Tuesday, December 15, 2026" (Pacific calendar)
  // Display these as-is. Re-parsing the strings above with `new Date()` reads
  // them at midnight in the server's zone (UTC on Vercel), which is the
  // previous evening in the Americas and showed the opening date a day early.
  openingDateLabel: string; // "10/15/2026"
  closingDateLabel: string; // "12/15/2026"
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

// Opening dates are read on the Eastern calendar and closing dates on the
// Pacific calendar, matching when forms actually open and close.
const WEEKDAY_DATE: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const NUMERIC_DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
function dateLabels(opening: Date, closing: Date) {
  return {
    fullOpeningDate: formatOpeningDate(opening, WEEKDAY_DATE),
    fullClosingDate: formatClosingDate(closing, WEEKDAY_DATE),
    openingDateLabel: formatOpeningDate(opening, NUMERIC_DATE),
    closingDateLabel: formatClosingDate(closing, NUMERIC_DATE),
  };
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

    // The SurveySession holds the dates the cron actually opens and closes on,
    // so prefer it. Library_Year rows written by the broadcast route carried
    // the closing date one day late; reading them first showed members the
    // wrong deadline.
    const surveySession = await prisma.surveySession.findUnique({
      where: { academicYear: currentYear },
      select: { openingDate: true, closingDate: true },
    });
    const storedOpening = surveySession?.openingDate ?? libraryYear?.opening_date;
    const storedClosing = surveySession?.closingDate ?? libraryYear?.closing_date;

    // Calculate dates (uses database dates if available, otherwise defaults)
    const surveyDates = getSurveyDates(
      currentYear,
      storedOpening,
      storedClosing
    );

    // Calculate three-state status and countdowns
    const now = new Date();
    const openingDateTime = surveyDates.openingDate ? new Date(surveyDates.openingDate) : null;
    const closingDateTime = surveyDates.closingDate ? new Date(surveyDates.closingDate) : null;
    const isStoredInDatabase = !!(storedOpening && storedClosing);
    const isCurrentlyOpen = libraryYear?.is_open_for_editing || false;

    let status: 'not_set' | 'scheduled' | 'open' | 'closed' = 'not_set';
    let daysUntilOpening: number | null = null;
    let daysUntilClosing: number | null = null;
    let daysSinceClosed: number | null = null;

    if (!isStoredInDatabase) {
      status = 'not_set';
    } else if (isCurrentlyOpen && closingDateTime && now > closingDateTime) {
      // is_open_for_editing is still true but closing date has passed — treat as closed
      status = 'closed';
      daysSinceClosed = Math.floor((now.getTime() - closingDateTime.getTime()) / (1000 * 60 * 60 * 24));
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
      shortDateRange: getShortDateRange(currentYear, storedOpening, storedClosing),
      ...dateLabels(surveyDates.openingDate, surveyDates.closingDate),
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
      ...dateLabels(surveyDates.openingDate, surveyDates.closingDate),
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
