/**
 * Survey Date Utilities
 * Handles automatic date calculations for the CEAL Statistics Database survey system
 */

import { formatShortDate, formatDateWithWeekday, formatSimpleDate } from './dateFormatting';

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

  // Helper function to convert date string to Pacific Time midnight
  const toPacificMidnight = (dateInput: Date | string): Date => {
    const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    // Create date at midnight Pacific Time by adding 7 or 8 hours to UTC
    // Use 8 hours (PST) as default - this ensures the date stays correct year-round
    return new Date(Date.UTC(y, m - 1, d, 8, 0, 0));
  };

  // Helper function to convert date string to Pacific Time 11:59 PM
  const toPacificEndOfDay = (dateInput: Date | string): Date => {
    const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    // To represent 11:59 PM Pacific on day D: next day at 7:59 AM UTC
    // Example: 12/19 11:59 PM PST = 12/20 7:59 AM UTC
    return new Date(Date.UTC(y, m - 1, d + 1, 7, 59, 0));
  };

  // Default opening date: October 1, current year at 12:00 AM Pacific
  const defaultOpening = new Date(Date.UTC(currentYear, 9, 1, 7, 0, 0)); // Oct 1, 12:00 AM Pacific (UTC-7)
  
  // Default closing date: December 2, current year at 11:59 PM Pacific
  const defaultClosing = new Date(Date.UTC(currentYear, 11, 2, 6, 59, 0)); // Dec 2, 11:59 PM Pacific (UTC-8)

  // Fiscal year period (FIXED - not customizable)
  const fiscalStart = new Date(Date.UTC(pastYear, 6, 1, 0, 0, 0)); // July 1, past year
  const fiscalEnd = new Date(Date.UTC(currentYear, 5, 30, 23, 59, 59)); // June 30, current year

  // Publication date (FIXED - not customizable)
  const publication = new Date(Date.UTC(nextYear, 1, 1, 0, 0, 0)); // February 1, next year

  return {
    openingDate: customOpeningDate ? toPacificMidnight(customOpeningDate) : defaultOpening,
    closingDate: customClosingDate ? toPacificEndOfDay(customClosingDate) : defaultClosing,
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
    return `${formatDateWithWeekday(date)} at 11:59 PM Pacific`;
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
  return `${formatSimpleDate(dates.fiscalYearStart)} to ${formatSimpleDate(dates.fiscalYearEnd)}`;
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
  
  const openMonth = formatShortDate(dates.openingDate).replace(/, \d{4}$/, ''); // Remove year
  const closeMonth = formatShortDate(dates.closingDate);
  
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
