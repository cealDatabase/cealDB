/**
 * Unified Date Formatting Utilities
 * 
 * PURPOSE: Display dates as simple calendar dates without timezone confusion
 * 
 * PROBLEM: When you pick "December 19, 2025", you want it to show as "December 19, 2025"
 * everywhere - not December 20 or 21 because of timezone conversion.
 * 
 * SOLUTION: Extract the UTC date components directly and format them as a calendar date.
 */

/**
 * Format a date as a simple calendar date (e.g., "December 19, 2025")
 * Shows the date WITHOUT timezone conversion - exactly as stored in the database
 */
export function formatSimpleDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Extract UTC components to avoid timezone shifts
  const month = d.toLocaleDateString('en-US', { 
    month: 'long',
    timeZone: 'UTC'
  });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Format a date with weekday (e.g., "Friday, December 19, 2025")
 */
export function formatDateWithWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const weekday = d.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC'
  });
  const month = d.toLocaleDateString('en-US', { 
    month: 'long',
    timeZone: 'UTC'
  });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  
  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Format a date with short month (e.g., "Dec 19, 2025")
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const month = d.toLocaleDateString('en-US', { 
    month: 'short',
    timeZone: 'UTC'
  });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Format a date as month and day only (e.g., "December 19")
 */
export function formatMonthDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const month = d.toLocaleDateString('en-US', { 
    month: 'long',
    timeZone: 'UTC'
  });
  const day = d.getUTCDate();
  
  return `${month} ${day}`;
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
