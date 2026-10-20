// lib/myAccessInstitution.ts
//
// For the AV, E-Book and E-Journal pages: whether this user is asked which
// institution they mean before changing its My Access, and that
// institution's name for the question (lib/myAccessConfirm.ts).

import db from "@/lib/db";

/** Super Admin (1), E-Resource Editor (3) and Assistant Admin (4) work on many institutions. */
export async function myAccessInstitution(libid: number | undefined, roleIds: number[]) {
  const confirmAccessChanges = roleIds.some((role) => role === 1 || role === 3 || role === 4);
  const library = libid
    ? await db.library.findUnique({ where: { id: libid }, select: { library_name: true } })
    : null;
  return { confirmAccessChanges, libraryName: library?.library_name?.trim() || undefined };
}
