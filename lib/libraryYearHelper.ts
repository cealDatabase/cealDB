// lib/libraryYearHelper.ts
import db from '@/lib/db';
import { isSuperAdminDb } from '@/lib/auth';
import { getSurveyYearState } from '@/lib/surveyVisibility';

/**
 * Check if the current user is a super admin (role 1).
 *
 * Verified against the database via the signed `session` JWT. This previously
 * read the `role` cookie, which is unsigned and therefore forgeable — any
 * caller could claim role '1'. Around 20 create/import routes rely on this.
 */
export async function isSuperAdmin(): Promise<boolean> {
  return isSuperAdminDb();
}

/**
 * Find the Library_Year row for a library and year, creating it if missing.
 *
 * A created row starts open only while that survey year is collecting, so a
 * write aimed at an unopened, closed or legacy year cannot open it as a side
 * effect (rows used to be created with is_open_for_editing: true).
 */
export async function findOrCreateLibraryYear(libraryId: number, year: number) {
  const existing = await db.library_Year.findFirst({ where: { library: libraryId, year } });
  if (existing) return existing;

  return db.library_Year.create({
    data: {
      library: libraryId,
      year,
      updated_at: new Date(),
      is_open_for_editing: (await getSurveyYearState(year)) === 'open',
      is_active: true,
    },
  });
}

/**
 * Institution data for a library-year may change only while that row is open
 * for editing; Super Admin may always change it.
 */
export async function canWriteLibraryYear(libraryYear: { is_open_for_editing: boolean | null }): Promise<boolean> {
  return !!libraryYear.is_open_for_editing || isSuperAdmin();
}
