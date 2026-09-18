/**
 * Who may look at a survey year, and when.
 *
 * The problem this solves: once a super admin schedules next year's
 * collection, `Library_Year` rows and a `SurveySession` exist for that year
 * before anybody is supposed to be filling it in. Member-facing pages resolve
 * "the current year" through `getActiveSurveyYear()`, which happily returns
 * that scheduled year — so a member institution could open next year's
 * database lists, and next year's participation table, weeks before the forms
 * opened.
 *
 * Privileged roles DO need that early view: they review the shared database
 * lists while the dates are still being set. So the gate is on members only.
 *
 * Nothing here hardcodes a year. Every decision is read from the
 * `SurveySession` row the super admin creates through the toolkit.
 */

import db from '@/lib/db';
import { getSessionRoleIds } from '@/lib/auth';
import { getActiveSurveyYear } from '@/lib/currentSurveyYear';

// Roles that may look at a year before its collection window opens:
// 1 = Super Admin, 3 = E-Resource Editor, 4 = Assistant Admin.
// 2 = Member Institution is deliberately absent.
const PREVIEW_ROLES = [1, 3, 4];

/**
 * - `legacy`  no SurveySession row at all. Years collected before this table
 *             existed look like this, so they must stay fully visible.
 * - `pending` scheduled, window has not started. Hidden from members.
 * - `open`    currently collecting.
 * - `closed`  window has finished.
 */
export type SurveyYearState = 'legacy' | 'pending' | 'open' | 'closed';

type SessionRow = {
  academicYear: number;
  isOpen: boolean;
  openingDate: Date;
  closingDate: Date;
};

function stateOf(session: SessionRow | null, now: Date): SurveyYearState {
  if (!session) return 'legacy';

  // `isOpen` is the live status, not the schedule: the cron job flips it on
  // the scheduled dates, and the super admin's "open or close right now"
  // override writes it directly. It therefore has to win over the dates,
  // otherwise a deliberate early opening would still read as `pending` and
  // members would be locked out of a year the chair had just opened for them.
  if (session.isOpen) return 'open';

  if (now < new Date(session.openingDate)) return 'pending';
  if (now > new Date(session.closingDate)) return 'closed';

  // Inside the window but not flagged open — the cron has not caught up yet.
  return 'open';
}

/** The state of one survey year. */
export async function getSurveyYearState(year: number): Promise<SurveyYearState> {
  const session = await db.surveySession.findUnique({
    where: { academicYear: year },
    select: { academicYear: true, isOpen: true, openingDate: true, closingDate: true },
  });
  return stateOf(session, new Date());
}

/** True when the caller holds a role that may preview an unopened year. */
export async function callerMayPreviewUnopenedYear(): Promise<boolean> {
  const roleIds = await getSessionRoleIds();
  return roleIds.some((id) => PREVIEW_ROLES.includes(id));
}

/**
 * May the caller see this year's shared database lists (audio/visual, e-book,
 * e-journal)? Everything except an unopened year is visible to everybody.
 */
export async function canViewSurveyYearLists(year: number): Promise<boolean> {
  if ((await getSurveyYearState(year)) !== 'pending') return true;
  return callerMayPreviewUnopenedYear();
}

/**
 * May the caller see this year's participation status? Mid-collection the
 * table is all crosses and says nothing except who has not got round to it
 * yet, so members see a year only once it has closed. Privileged roles need
 * it during collection — chasing submissions is what the tab is for.
 */
export async function canViewParticipationYear(year: number): Promise<boolean> {
  const state = await getSurveyYearState(year);
  if (state === 'legacy' || state === 'closed') return true;
  return callerMayPreviewUnopenedYear();
}

/**
 * Narrow a list of years to the ones whose participation status the caller may
 * see. One query for every year, rather than one per year.
 */
export async function filterParticipationYears(years: number[]): Promise<number[]> {
  if (years.length === 0) return years;
  if (await callerMayPreviewUnopenedYear()) return years;

  const sessions = await db.surveySession.findMany({
    where: { academicYear: { in: years } },
    select: { academicYear: true, isOpen: true, openingDate: true, closingDate: true },
  });
  const byYear = new Map(sessions.map((s) => [s.academicYear, s]));

  const now = new Date();
  return years.filter((y) => {
    const state = stateOf(byYear.get(y) ?? null, now);
    return state === 'legacy' || state === 'closed';
  });
}

/**
 * The year a member-facing page should land on: the active survey year when
 * the caller is allowed to see it, otherwise the most recent year that has
 * actually opened.
 */
export async function getVisibleSurveyYear(): Promise<number> {
  const active = await getActiveSurveyYear();
  if (await canViewSurveyYearLists(active)) return active;

  // Most recent earlier year whose window has started. Falls back to the year
  // before the active one, which covers legacy years with no session row.
  const now = new Date();
  const opened = await db.surveySession.findFirst({
    where: {
      academicYear: { lt: active },
      OR: [{ isOpen: true }, { openingDate: { lte: now } }],
    },
    orderBy: { academicYear: 'desc' },
    select: { academicYear: true },
  });
  return opened?.academicYear ?? active - 1;
}
