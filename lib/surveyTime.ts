/**
 * When the annual survey opens and closes, as instants.
 *
 * The rule: forms open at 12:00 AM **Eastern** on the opening date and close
 * at 11:59 PM **Pacific** on the closing date. Opening on Eastern time lets
 * east-coast libraries start the moment the survey opens instead of waiting
 * three hours for Pacific midnight; closing on Pacific time gives west-coast
 * libraries the whole of the last day.
 *
 * Both zones observe daylight saving, and a collection runs from mid-October
 * (EDT, UTC-4) to mid-December (PST, UTC-8), so the UTC offset is never a
 * constant. Everything here resolves the offset for the actual date.
 *
 * This is the single place that turns a calendar date (YYYY-MM-DD) into an
 * opening or closing instant, and back. Do not hand-roll `Date.UTC(..., 8, 0)`
 * style conversions elsewhere: they were copied into seven files and drifted.
 *
 * Pure and dependency-free, so it is safe in server code and client components.
 */

export const OPENING_TIME_ZONE = 'America/New_York';
export const CLOSING_TIME_ZONE = 'America/Los_Angeles';

/** For copy next to an opening date, e.g. "October 15, 2026 at 12:00 AM Eastern Time". */
export const OPENING_TIME_LABEL = '12:00 AM Eastern Time';
/** For copy next to a closing date, e.g. "December 15, 2026 at 11:59 PM Pacific Time". */
export const CLOSING_TIME_LABEL = '11:59 PM Pacific Time';

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})/;

function parseDateKey(dateKey: string): [number, number, number] {
  const match = DATE_KEY.exec(dateKey.trim());
  if (!match) {
    throw new Error(`Expected a date as YYYY-MM-DD, got "${dateKey}"`);
  }
  const [, y, m, d] = match;
  return [Number(y), Number(m), Number(d)];
}

/** Wall-clock fields of `instant` as seen in `timeZone`. */
function wallClock(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Milliseconds `timeZone` is ahead of UTC at `instant` (EDT → -4h). */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const w = wallClock(new Date(instant), timeZone);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - instant;
}

/** The instant at which the clocks in `timeZone` read the given wall time. */
function zonedWallTimeToInstant(
  y: number, m: number, d: number, hour: number, minute: number, timeZone: string,
): Date {
  const wall = Date.UTC(y, m - 1, d, hour, minute, 0);
  // Second pass corrects the guess when it falls across a DST change. US
  // changes happen at 2 AM, so 12:00 AM and 11:59 PM are never skipped or
  // repeated and two passes always settle.
  const firstGuess = wall - zoneOffsetMs(wall, timeZone);
  return new Date(wall - zoneOffsetMs(firstGuess, timeZone));
}

function dateKeyIn(instant: Date, timeZone: string): string {
  const w = wallClock(instant, timeZone);
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;
}

/** 12:00 AM Eastern on `dateKey` (YYYY-MM-DD). */
export function openingInstant(dateKey: string): Date {
  const [y, m, d] = parseDateKey(dateKey);
  return zonedWallTimeToInstant(y, m, d, 0, 0, OPENING_TIME_ZONE);
}

/** 11:59 PM Pacific on `dateKey` (YYYY-MM-DD). */
export function closingInstant(dateKey: string): Date {
  const [y, m, d] = parseDateKey(dateKey);
  return zonedWallTimeToInstant(y, m, d, 23, 59, CLOSING_TIME_ZONE);
}

/**
 * The opening date (YYYY-MM-DD) an opening instant belongs to, read on the
 * Eastern calendar. Also right for rows stored before this module existed,
 * which opened at 08:00 UTC: that is still the same Eastern date.
 */
export function openingDateKey(instant: Date | string): string {
  return dateKeyIn(new Date(instant), OPENING_TIME_ZONE);
}

/**
 * The closing date (YYYY-MM-DD) a closing instant belongs to, read on the
 * Pacific calendar. Never read it off the UTC calendar: 11:59 PM Pacific is
 * already the next day in UTC.
 */
export function closingDateKey(instant: Date | string): string {
  return dateKeyIn(new Date(instant), CLOSING_TIME_ZONE);
}

const LONG_DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

/** "October 15, 2026" — the opening date on the Eastern calendar. */
export function formatOpeningDate(
  instant: Date | string,
  options: Intl.DateTimeFormatOptions = LONG_DATE,
): string {
  return new Date(instant).toLocaleDateString('en-US', { ...options, timeZone: OPENING_TIME_ZONE });
}

/** "December 15, 2026" — the closing date on the Pacific calendar. */
export function formatClosingDate(
  instant: Date | string,
  options: Intl.DateTimeFormatOptions = LONG_DATE,
): string {
  return new Date(instant).toLocaleDateString('en-US', { ...options, timeZone: CLOSING_TIME_ZONE });
}

/**
 * "October 15, 2026" for a bare YYYY-MM-DD, e.g. a date input's value.
 * `new Date("2026-10-15")` is UTC midnight, which is the previous evening in
 * the Americas, so formatting it in any US zone shows the wrong day.
 */
export function formatDateKey(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE,
): string {
  const [y, m, d] = parseDateKey(dateKey);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}
