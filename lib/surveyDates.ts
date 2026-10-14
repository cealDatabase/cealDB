/**
 * Survey Date Utilities
 * Handles automatic date calculations for the CEAL Statistics Database survey system
 */

import { formatDateWithWeekday } from './dateFormatting';
import {
  openingInstant,
  closingInstant,
  openingDateKey,
  closingDateKey,
  formatOpeningDate,
  formatClosingDate,
  CLOSING_TIME_LABEL,
} from './surveyTime';

export interface SurveyDates {
  openingDate: Date;
  closingDate: Date;
  fiscalYearStart: Date;
  fiscalYearEnd: Date;
  publicationDate: Date;
}

/**
 * Get default survey dates for a given academic year
 * @param year - The academic year (e.g., 2025)
 * @param customOpeningDate - Optional custom opening date set by super admin
 * @param customClosingDate - Optional custom closing date set by super admin
 * @returns Object containing all survey-related dates
 */
export function getSurveyDates(
  year: number,
  customOpeningDate?: Date | string | null,
  customClosingDate?: Date | string | null
): SurveyDates {
  const currentYear = year;
  const pastYear = year - 1;
  const nextYear = year + 1;

  // A custom date arrives either as a bare YYYY-MM-DD (from a form) or as an
  // instant already stored in the database. An instant has to be read on the
  // calendar of the zone it was set in. Reading it off the UTC calendar - what
  // this used to do - moved every closing date a day later, because 11:59 PM
  // Pacific is already the next day in UTC; callers that passed a stored
  // closing date back in got it shifted again.
  //
  // A Date at exactly UTC midnight is a bare date that went through
  // `new Date("YYYY-MM-DD")`, so it is read as that date. No stored opening or
  // closing instant falls on UTC midnight (they sit at 04:00-08:00 UTC), so
  // this cannot mistake one for the other.
  const dateKeyOf = (input: Date | string): string | null => {
    if (typeof input === 'string') {
      return /^\d{4}-\d{2}-\d{2}$/.test(input.trim()) ? input.trim() : null;
    }
    const isUtcMidnight =
      input.getUTCHours() === 0 && input.getUTCMinutes() === 0 &&
      input.getUTCSeconds() === 0 && input.getUTCMilliseconds() === 0;
    return isUtcMidnight ? input.toISOString().slice(0, 10) : null;
  };
  const toOpening = (input: Date | string): Date =>
    openingInstant(dateKeyOf(input) ?? openingDateKey(input));
  const toClosing = (input: Date | string): Date =>
    closingInstant(dateKeyOf(input) ?? closingDateKey(input));

  // Fallbacks for a year with no dates set yet. The real dates are set by the
  // super admin each year; these only fill the gap until then.
  const defaultOpening = openingInstant(`${currentYear}-10-01`); // Oct 1, 12:00 AM Eastern
  const defaultClosing = closingInstant(`${currentYear}-12-02`); // Dec 2, 11:59 PM Pacific

  // Fiscal year period (FIXED - not customizable)
  const fiscalStart = new Date(Date.UTC(pastYear, 6, 1, 0, 0, 0)); // July 1, past year
  const fiscalEnd = new Date(Date.UTC(currentYear, 5, 30, 23, 59, 59)); // June 30, current year

  // Publication date (FIXED - not customizable)
  const publication = new Date(Date.UTC(nextYear, 1, 1, 0, 0, 0)); // February 1, next year

  return {
    openingDate: customOpeningDate ? toOpening(customOpeningDate) : defaultOpening,
    closingDate: customClosingDate ? toClosing(customClosingDate) : defaultClosing,
    fiscalYearStart: fiscalStart,
    fiscalYearEnd: fiscalEnd,
    publicationDate: publication,
  };
}

/**
 * Format date for display in Pacific Time
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string in Pacific Time
 */
export function formatSurveyDate(date: Date, includeTime: boolean = false): string {
  if (includeTime) {
    // For dates with time, show the date part with time text in Pacific Time
    return `${formatDateWithWeekday(date)} at ${CLOSING_TIME_LABEL}`;
  }
  return formatDateWithWeekday(date);
}

/**
 * Format fiscal year period for display
 * @param year - Academic year
 * @returns Formatted fiscal year string (e.g., "July 1, 2024 to June 30, 2025")
 */
export function formatFiscalYear(year: number): string {
  const dates = getSurveyDates(year);
  // The fiscal-year bounds are defined at UTC midnight, so format them in UTC.
  // In Pacific time July 1 00:00 UTC is still June 30, which printed the year
  // as "June 30, 2025 to June 30, 2026".
  const utc = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return `${utc(dates.fiscalYearStart)} to ${utc(dates.fiscalYearEnd)}`;
}

/**
 * Format publication date for display in Pacific Time
 * @param year - Academic year
 * @returns Formatted publication date string (e.g., "February 2026")
 */
export function formatPublicationDate(year: number): string {
  const dates = getSurveyDates(year);
  const d = dates.publicationDate;
  return d.toLocaleDateString('en-US', { 
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

/**
 * Get short date range display (e.g., "Oct 1 - Dec 1, 2025")
 * @param year - Academic year
 * @param customOpeningDate - Optional custom opening date
 * @param customClosingDate - Optional custom closing date
 * @returns Short formatted date range
 */
export function getShortDateRange(
  year: number,
  customOpeningDate?: Date | string | null,
  customClosingDate?: Date | string | null
): string {
  const dates = getSurveyDates(year, customOpeningDate, customClosingDate);
  
  const short: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const openMonth = formatOpeningDate(dates.openingDate, short).replace(/, \d{4}$/, ''); // Remove year
  const closeMonth = formatClosingDate(dates.closingDate, short);
  
  return `${openMonth} - ${closeMonth}`;
}

/**
 * Check if a date string or Date is a default date (not customized)
 * @param date - Date to check
 * @param year - Academic year
 * @param type - Type of date to check ('opening' or 'closing')
 * @returns True if date is the default, false if customized
 */
export function isDefaultDate(date: Date | string | null | undefined, year: number, type: 'opening' | 'closing'): boolean {
  if (!date) return true;
  
  const defaultDates = getSurveyDates(year);
  const checkDate = new Date(date);
  const defaultDate = type === 'opening' ? defaultDates.openingDate : defaultDates.closingDate;
  
  return checkDate.getTime() === defaultDate.getTime();
}
