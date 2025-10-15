/**
 * Unified Date Formatting Utilities
 * 
 * PURPOSE: Display dates in Pacific Time for the CEAL Statistics Database
 * 
 * PROBLEM: Dates are stored in UTC in the database, but need to be displayed in Pacific Time
 * for users on the West Coast.
 * 
 * SOLUTION: Use America/Los_Angeles timezone for all date formatting to ensure dates
 * are displayed in the correct timezone for frontend users.
 */

/**
 * Format a date as a simple calendar date in Pacific Time (e.g., "December 19, 2025")
 * Converts UTC dates from database to Pacific Time for display
 */
export function formatSimpleDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Format in Pacific Time
  return d.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

/**
 * Format a date with weekday in Pacific Time (e.g., "Friday, December 19, 2025")
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

/**
 * Format a date with short month in Pacific Time (e.g., "Dec 19, 2025")
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

/**
 * Format a date as month and day only in Pacific Time (e.g., "December 19")
 */
export function formatMonthDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}

/**
 * Format a date range (e.g., "October 15 through December 19, 2025")
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startMonthDay = formatMonthDay(start);
  const endSimple = formatSimpleDate(end);
  
  return `${startMonthDay} through ${endSimple}`;
}
