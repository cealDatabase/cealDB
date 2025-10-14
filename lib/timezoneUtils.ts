/**
 * Timezone Utilities for CEAL Database
 * Handles conversion between Pacific Time and UTC
 */

/**
 * Determines if a given date falls within Pacific Daylight Time (PDT)
 * DST Rules for US Pacific Time:
 * - Starts: Second Sunday in March at 2:00 AM (PDT begins, UTC-7)
 * - Ends: First Sunday in November at 2:00 AM (PST begins, UTC-8)
 */
function isPDT(date: Date): boolean {
  const year = date.getFullYear();
  
  // Find second Sunday in March
  const marchFirst = new Date(year, 2, 1); // March is month 2 (0-indexed)
  const marchFirstDay = marchFirst.getDay();
  const secondSundayMarch = 8 + (7 - marchFirstDay) % 7;
  const dstStart = new Date(year, 2, secondSundayMarch, 2, 0, 0);
  
  // Find first Sunday in November
  const novFirst = new Date(year, 10, 1); // November is month 10
  const novFirstDay = novFirst.getDay();
  const firstSundayNov = 1 + (7 - novFirstDay) % 7;
  const dstEnd = new Date(year, 10, firstSundayNov, 2, 0, 0);
  
  return date >= dstStart && date < dstEnd;
}

/**
 * Converts a date string (YYYY-MM-DD) to midnight Pacific Time, returned as UTC
 * @param dateString - Date in YYYY-MM-DD format (e.g., "2025-10-14")
 * @param endOfDay - If true, returns 11:59:59 PM PT instead of midnight
 * @returns Date object in UTC representing the specified moment in Pacific Time
 * 
 * @example
 * // Super admin selects Oct 14, 2025
 * const utcDate = convertToPacificTime("2025-10-14");
 * // Returns: 2025-10-14T07:00:00.000Z (Oct 14, 00:00 PDT = Oct 14, 07:00 UTC)
 */
export function convertToPacificTime(dateString: string, endOfDay: boolean = false): Date {
  // Parse the date components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create a date object at noon UTC (to avoid any date boundary issues)
  const checkDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  
  // Determine if this date falls in PDT or PST
  const usePDT = isPDT(checkDate);
  const offset = usePDT ? '-07:00' : '-08:00';
  const timezone = usePDT ? 'PDT' : 'PST';
  
  // Create the time string (midnight or end of day)
  const timeString = endOfDay ? '23:59:59' : '00:00:00';
  
  // Combine date + time + offset to create a proper ISO string
  const isoString = `${dateString}T${timeString}${offset}`;
  const result = new Date(isoString);
  
  console.log(`🕐 Timezone Conversion: ${dateString} ${timeString} ${timezone} → ${result.toISOString()}`);
  
  return result;
}

// Backward compatibility - keep old function name but use Pacific Time
export function convertToEasternTime(dateString: string, endOfDay: boolean = false): Date {
  return convertToPacificTime(dateString, endOfDay);
}

/**
 * Gets the Pacific Time zone name (PDT or PST) for a given date
 */
export function getPacificTimezoneName(date: Date): 'PDT' | 'PST' {
  return isPDT(date) ? 'PDT' : 'PST';
}

/**
 * Format a UTC date as Pacific Time string
 * @param date - UTC Date object
 * @returns Formatted string in Pacific Time with timezone
 */
export function formatAsPacificTime(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

// Backward compatibility - keep old function name but use Pacific Time
export function formatAsEasternTime(date: Date): string {
  return formatAsPacificTime(date);
}
