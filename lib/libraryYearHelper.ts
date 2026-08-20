// lib/libraryYearHelper.ts
import { isSuperAdminDb } from '@/lib/auth';

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
