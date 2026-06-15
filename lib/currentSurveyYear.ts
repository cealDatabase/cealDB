/**
 * Single source of truth for "the current survey year".
 *
 * The ONLY authoritative source is the SurveySession table, which the super
 * admin explicitly creates with an academicYear + openingDate + closingDate.
 *
 * Rules (evaluated in order):
 *   1. If today is between a session's openingDate and closingDate → we are
 *      actively collecting → return that session's academicYear.
 *   2. If today is AFTER the most recent session's closingDate AND no newer
 *      session has been created → the user is viewing the just-closed year's
 *      data → still return that session's academicYear.
 *   3. If today is BEFORE a session's openingDate (scheduled but not yet open)
 *      AND there is an older session that has already closed → return the older
 *      (closed) session's academicYear (users view existing data until the new
 *      one opens). If there's only the future session, return its academicYear.
 *   4. No sessions at all → fall back to calendar year.
 *
 * This means the displayed year ONLY changes when:
 *   - A new session's openingDate arrives, OR
 *   - The super admin explicitly creates a new SurveySession.
 *
 * Both functions are safe to call on the server. They never throw — on DB error
 * they fall back to calendar-based reasoning.
 */

import db from '@/lib/db';

/**
 * The "active" survey year — i.e. the year whose data the system is currently
 * displaying/collecting. Based entirely on SurveySession records.
 */
export async function getActiveSurveyYear(): Promise<number> {
  try {
    const now = new Date();

    // Get all sessions ordered by academicYear descending
    const sessions = await db.surveySession.findMany({
      orderBy: { academicYear: 'desc' },
      select: { academicYear: true, openingDate: true, closingDate: true },
    });

    if (!sessions || sessions.length === 0) {
      return new Date().getFullYear();
    }

    // Rule 1: Is there a session currently open (now is between open & close)?
    const openSession = sessions.find(
      (s) => now >= new Date(s.openingDate) && now <= new Date(s.closingDate)
    );
    if (openSession) return openSession.academicYear;

    // Rule 2 & 3: Find the most recent session whose openingDate has already
    // passed (i.e. it has either been open or already closed).
    const pastOrCurrentSessions = sessions.filter(
      (s) => now >= new Date(s.openingDate)
    );

    if (pastOrCurrentSessions.length > 0) {
      // The most recent one that has already started (may be closed now)
      return pastOrCurrentSessions[0].academicYear;
    }

    // Rule 3b: All sessions are in the future. If there's exactly one upcoming
    // session, return that (it's been set up but not open yet — show that year).
    // If there are multiple future sessions, still return the nearest one.
    const futureSessions = sessions.filter(
      (s) => now < new Date(s.openingDate)
    );
    if (futureSessions.length > 0) {
      // Nearest future session (last in the desc-sorted list of future ones)
      return futureSessions[futureSessions.length - 1].academicYear;
    }

    // Shouldn't reach here, but fallback
    return sessions[0].academicYear;
  } catch {
    // fall through on any DB error
  }
  return new Date().getFullYear();
}

/**
 * The default year to preselect on the reports page. Reports list completed
 * survey cycles, so this is one year prior to the active survey year.
 * If the active year's session is already closed, the active year IS the
 * most recently completed cycle — but we still subtract 1 because the reporting
 * page shows finalized/published data which lags by one cycle.
 */
export async function getReportingDefaultYear(): Promise<number> {
  try {
    const now = new Date();
    const sessions = await db.surveySession.findMany({
      orderBy: { academicYear: 'desc' },
      select: { academicYear: true, openingDate: true, closingDate: true },
    });

    if (!sessions || sessions.length === 0) {
      return new Date().getFullYear() - 1;
    }

    // Find sessions that are fully closed (closingDate < now)
    const closedSessions = sessions.filter(
      (s) => now > new Date(s.closingDate)
    );

    if (closedSessions.length > 0) {
      // Most recently closed session = the year whose data is finalized
      return closedSessions[0].academicYear;
    }

    // No closed sessions yet — fall back to active - 1
    const active = await getActiveSurveyYear();
    return active - 1;
  } catch {
    return new Date().getFullYear() - 1;
  }
}

/**
 * Synchronous fallback for client components / non-async contexts.
 * Returns the calendar year. Prefer the async helpers above when you can await
 * them, since they reflect the actual scheduled session.
 */
export function getActiveSurveyYearSync(): number {
  return new Date().getFullYear();
}
