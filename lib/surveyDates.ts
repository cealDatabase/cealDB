/**
 * Survey Date Utilities
 * Handles automatic date calculations for the CEAL Statistics Database survey system
 */

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

  // Default opening date: October 1, current year
  const defaultOpening = new Date(Date.UTC(currentYear, 9, 1, 7, 0, 0)); // Oct 1, 12:00 AM Pacific (UTC-7)
  
  // Default closing date: December 1, current year at 11:59 PM Pacific
  const defaultClosing = new Date(Date.UTC(currentYear, 11, 2, 6, 59, 0)); // Dec 1, 11:59 PM Pacific (UTC-8)

  // Fiscal year period (FIXED - not customizable)
  const fiscalStart = new Date(Date.UTC(pastYear, 6, 1, 0, 0, 0)); // July 1, past year
  const fiscalEnd = new Date(Date.UTC(currentYear, 5, 30, 23, 59, 59)); // June 30, current year

  // Publication date (FIXED - not customizable)
  const publication = new Date(Date.UTC(nextYear, 1, 1, 0, 0, 0)); // February 1, next year

  return {
    openingDate: customOpeningDate ? new Date(customOpeningDate) : defaultOpening,
    closingDate: customClosingDate ? new Date(customClosingDate) : defaultClosing,
    fiscalYearStart: fiscalStart,
    fiscalYearEnd: fiscalEnd,
    publicationDate: publication,
  };
}

/**
 * Format date for display
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatSurveyDate(date: Date, includeTime: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.timeZoneName = 'short';
  }

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format fiscal year period for display
 * @param year - Academic year
 * @returns Formatted fiscal year string (e.g., "July 1, 2024 to June 30, 2025")
 */
export function formatFiscalYear(year: number): string {
  const dates = getSurveyDates(year);
  
  // Use UTC dates to avoid timezone conversion issues
  const startMonth = dates.fiscalYearStart.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC'
  });
  const endMonth = dates.fiscalYearEnd.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC'
  });
  return `${startMonth} to ${endMonth}`;
}

/**
 * Format publication date for display
 * @param year - Academic year
 * @returns Formatted publication date string (e.g., "February 2026")
 */
export function formatPublicationDate(year: number): string {
  const dates = getSurveyDates(year);
  return dates.publicationDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric',
    timeZone: 'UTC'
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
  
  const openMonth = dates.openingDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC'
  });
  const closeMonth = dates.closingDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC'
  });
  
  return `${openMonth} - ${closeMonth}, ${year}`;
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
