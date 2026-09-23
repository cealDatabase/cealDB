import db from '@/lib/db';
import { canAccessLibrary, getSessionRoleIds, getSessionUserId } from '@/lib/auth';
import { getVisibleSurveyYear } from '@/lib/surveyVisibility';

// These roles may review subscriptions across institutions and choose a year.
const CROSS_INSTITUTION_ROLES = [1, 3, 4];

export type SubscriptionViewAccess = {
  libraryId: number;
  year: number;
  isMemberRestricted: boolean;
};

/**
 * The year shown to the caller in the subscription-list navigation.
 *
 * “Previous year” in the member requirement means the prior calendar year,
 * not the prior SurveySession year. A survey session may remain on (for
 * example) 2025 after the calendar has entered 2026, and subtracting from it
 * would incorrectly show members 2024 data.
 */
export async function getSubscriptionListYear(): Promise<number> {
  const roleIds = await getSessionRoleIds();
  if (roleIds.some((roleId) => CROSS_INSTITUTION_ROLES.includes(roleId))) {
    return getVisibleSurveyYear();
  }
  return new Date().getFullYear() - 1;
}

/**
 * Resolve the institution and survey year for a subscription-list page from
 * the signed session, never from a role or library cookie.
 *
 * A member institution may see only a library assigned to that user and is
 * intentionally pinned to the prior survey year. Privileged roles retain the
 * cross-institution, year-selectable review workflow.
 */
export async function resolveSubscriptionViewAccess(
  requestedLibraryId: number | undefined,
  requestedYear: number | undefined,
): Promise<SubscriptionViewAccess | null> {
  const [userId, roleIds] = await Promise.all([
    getSessionUserId(),
    getSessionRoleIds(),
  ]);

  if (!userId || roleIds.length === 0) return null;

  const assignedLibraries = await db.user_Library.findMany({
    where: { user_id: userId },
    select: { library_id: true },
    orderBy: { library_id: 'asc' },
  });
  const assignedLibraryIds = assignedLibraries.map((row) => row.library_id);
  const isPrivileged = roleIds.some((roleId) =>
    CROSS_INSTITUTION_ROLES.includes(roleId),
  );

  // A /member URL resolves to the caller's first assigned library. A numeric
  // URL is still verified below, so changing it cannot expose another member's
  // subscriptions.
  const libraryId = requestedLibraryId ?? assignedLibraryIds[0];
  if (!libraryId) return null;

  if (!(await canAccessLibrary(libraryId))) return null;
  if (!isPrivileged && !assignedLibraryIds.includes(libraryId)) return null;

  if (!isPrivileged) {
    return {
      libraryId,
      year: await getSubscriptionListYear(),
      isMemberRestricted: true,
    };
  }

  return {
    libraryId,
    year: requestedYear ?? (await getVisibleSurveyYear()),
    isMemberRestricted: false,
  };
}
