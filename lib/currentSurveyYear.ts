/**
 * Single source of truth for "the current survey year".
 *
 * Across the app there are three different conventions:
 *   - Forms page:           `new Date().getFullYear()` (current calendar year)
 *   - Reports page:         `new Date().getFullYear() - 1` (last year, because
 *                                                          reports are always
 *                                                          for completed cycles)
 *   - Form create APIs:     current calendar year, with super-admin fallback to
 *                           the most recent Library_Year
 *
 * This helper centralizes the rule. Callers ask for either:
 *   - getActiveSurveyYear()      — the year currently being collected (matches
 *                                  the most recent SurveySession; falls back to
 *                                  the calendar year)
 *   - getReportingDefaultYear()  — the default year to show on the reports page
 *                                  (one year prior to the active survey year,
 *                                  because that data has been finalized)
 *
 * Both functions are safe to call on the server. They never throw — on DB error
 * they fall back to calendar-based reasoning.
 */

import db from '@/lib/db';

/**
 * The "active" survey year — i.e. the year whose data the system is currently
 * configured to collect. Pulls from the most recent SurveySession (which is
 * what the broadcast/scheduling UI keys off of) and falls back to the calendar
 * year if no session exists yet.
 */
export async function getActiveSurveyYear(): Promise<number> {
  try {
    const session = await db.surveySession.findFirst({
      orderBy: { academicYear: 'desc' },
      select: { academicYear: true },
    });
    if (session?.academicYear) return session.academicYear;
  } catch {
    // fall through
  }
  return new Date().getFullYear();
}

/**
 * The default year to preselect on the reports page. Reports list completed
 * survey cycles, so this is one year prior to the active survey year. If the
 * active survey year is already closed, callers may still choose to show the
 * just-completed year — that decision lives in the UI.
 */
export async function getReportingDefaultYear(): Promise<number> {
  const active = await getActiveSurveyYear();
  return active - 1;
}

/**
 * Synchronous fallback for client components / non-async contexts. Returns the
 * calendar year. Prefer the async helpers above when you can await them, since
 * they reflect the actual scheduled session.
 */
export function getActiveSurveyYearSync(): number {
  return new Date().getFullYear();
}
