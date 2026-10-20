// lib/myAccessInstitution.ts
//
// For the AV, E-Book and E-Journal pages: whether this user is asked which
// institution they mean before changing its My Access, and that
// institution's name for the question (lib/myAccessConfirm.ts). And for the
// create forms, which institutions an admin may create an entry of its own
// for.

import { cookies } from "next/headers";
import db from "@/lib/db";
import { getSessionRoleIds } from "@/lib/auth";

/** Super Admin (1), E-Resource Editor (3) and Assistant Admin (4) work on many institutions. */
export async function myAccessInstitution(libid: number | undefined, roleIds: number[]) {
  const confirmAccessChanges = roleIds.some((role) => role === 1 || role === 3 || role === 4);
  const library = libid
    ? await db.library.findUnique({ where: { id: libid }, select: { library_name: true } })
    : null;
  return { confirmAccessChanges, libraryName: library?.library_name?.trim() || undefined };
}

export type EntryInstitution = { id: number; name: string };

/**
 * An entry that is not shared belongs to one institution, named by whoever
 * creates it. For Super Admin and E-Resource Editor, who create entries for
 * any institution: the institutions taking part in that year, and the one
 * they are looking at (chosen in the institution switcher, else their own),
 * which the form offers first. Others get no list: members create entries
 * for their own institution only.
 */
export async function entryInstitutions(year: number) {
  const roleIds = await getSessionRoleIds();
  if (!roleIds.includes(1) && !roleIds.includes(3)) {
    return { institutions: [] as EntryInstitution[], viewedInstitutionId: undefined };
  }
  const libraryYears = await db.library_Year.findMany({
    where: { year },
    select: { Library: { select: { id: true, library_name: true } } },
    orderBy: { Library: { library_name: "asc" } },
  });
  const institutions: EntryInstitution[] = libraryYears.flatMap((ly) =>
    ly.Library ? [{ id: ly.Library.id, name: ly.Library.library_name.trim() }] : []
  );
  const cookieStore = await cookies();
  const viewed = Number(cookieStore.get("observe_library")?.value ?? cookieStore.get("library")?.value);
  return {
    institutions,
    viewedInstitutionId: institutions.some((institution) => institution.id === viewed) ? viewed : undefined,
  };
}
