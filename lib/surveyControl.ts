// lib/surveyControl.ts (server-only)
//
// Manual open / close of a survey year by a super admin.
//
// The daily job (api/cron/check-form-schedules) decides what to do from the
// year's SurveySession, not from the Library_Year rows: it opens when
// openingDate has passed and the session is not open or notified, sends the
// one-week reminder while it is open, and closes when closingDate has passed
// and it is still open. Manual actions used to change only the Library_Year
// rows, which left the job working from a stale picture:
//
//  - after a manual close, members still got the "one week left" reminder,
//    and super admins the "forms closed" notice, for forms already closed;
//    and if the opening had not been recorded, the job opened them again;
//  - after a manual reopen past the closing date, the next run closed the
//    forms again within hours, without any warning;
//  - a manual reopen re-armed the one-week reminder unconditionally, so a
//    reopen in the last week sent the reminder to every member twice.
//
// Both actions now update the SurveySession too, so the job agrees with
// what the super admin did.

import db from '@/lib/db';
import { closingInstant, formatClosingDate, CLOSING_TIME_LABEL } from '@/lib/surveyTime';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function closeSurveyYear(year: number) {
  const libraries = await db.library_Year.updateMany({
    where: { year },
    data: { is_open_for_editing: false, updated_at: new Date() },
  });

  const session = await db.surveySession.findUnique({ where: { academicYear: year } });
  if (session) {
    const openingHasPassed = session.openingDate.getTime() <= Date.now();
    await db.surveySession.update({
      where: { id: session.id },
      data: {
        isOpen: false,
        // Once the opening date has passed, record the opening as done, or
        // the job would see an unopened year and open it again. A close
        // before the opening date leaves the scheduled opening in place.
        ...(openingHasPassed ? { notifiedOnOpen: true } : {}),
      },
    });
  }

  return { librariesClosed: libraries.count, hasSchedule: !!session };
}

export type ReopenResult =
  | { ok: true; librariesOpened: number; closesAt: Date | null; closesAtLabel: string | null }
  | { ok: false; status: number; error: string; needsClosingDate?: boolean; closingDate?: string };

/**
 * Open every library for `year`. When the year's closing date has already
 * passed, a new one is required: the job closes any open year whose closing
 * date has passed, so without it the forms would be closed again at its
 * next run.
 */
export async function reopenSurveyYear(year: number, newClosingDateKey?: string | null): Promise<ReopenResult> {
  const session = await db.surveySession.findUnique({ where: { academicYear: year } });
  const now = Date.now();

  let closingDate = session?.closingDate ?? null;
  let closingChanged = false;
  if (newClosingDateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newClosingDateKey)) {
      return { ok: false, status: 400, error: 'The new closing date must be a date (YYYY-MM-DD).' };
    }
    const candidate = closingInstant(newClosingDateKey);
    if (candidate.getTime() <= now) {
      return { ok: false, status: 400, error: 'The new closing date must be in the future.' };
    }
    closingDate = candidate;
    closingChanged = !session || candidate.getTime() !== session.closingDate.getTime();
  } else if (session && session.closingDate.getTime() <= now) {
    return {
      ok: false,
      status: 409,
      needsClosingDate: true,
      closingDate: session.closingDate.toISOString(),
      error: `The closing date for ${year} (${formatClosingDate(session.closingDate)}) has already passed, so the next scheduled run would close the forms again. Choose a new closing date to reopen them.`,
    };
  }

  const libraries = await db.library_Year.updateMany({
    where: { year },
    data: {
      is_open_for_editing: true,
      updated_at: new Date(),
      ...(closingChanged && closingDate ? { closing_date: closingDate } : {}),
    },
  });

  if (session) {
    await db.surveySession.update({
      where: { id: session.id },
      data: {
        isOpen: true,
        // A manual open is the opening; the job must not open it again.
        notifiedOnOpen: true,
        // Close again on the closing date, with the admin notice.
        notifiedOnClose: false,
        ...(closingChanged && closingDate
          ? {
              closingDate,
              // Remind again only if there is still a week to go.
              ...(closingDate.getTime() - now > WEEK_MS ? { notifiedClosingReminder: false } : {}),
            }
          : {}),
      },
    });
  }

  // Marked done so the session queue does not show it as still to come.
  await db.scheduledEvent.updateMany({
    where: { year, event_type: 'FORM_OPENING', status: 'pending' },
    data: { status: 'completed', completed_at: new Date(), notes: 'Manually opened via admin panel' },
  });

  return {
    ok: true,
    librariesOpened: libraries.count,
    closesAt: session ? closingDate : null,
    closesAtLabel: session && closingDate ? `${formatClosingDate(closingDate)} at ${CLOSING_TIME_LABEL}` : null,
  };
}
