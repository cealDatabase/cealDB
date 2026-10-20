// lib/editedCopies.ts
//
// Editing a shared entry in Manage Access (AV, E-Book, E-Journal) leaves the
// shared entry as it is: the edit route saves the institution's version as a
// new entry of its own and records the entry it was copied from in the audit
// log (CREATE, old_values.original_id). The institution keeps its My Access
// row for the shared entry, which is what the catalogue lists show ticked;
// Manage Access shows the institution's version in its place.
//
// Manage Access used to show only rows ticked directly. The copy's own row
// never is, so an edit looked as if it had not been saved.

import db from "@/lib/db";

export type Catalogue = "av" | "ebook" | "ejournal";

const AUDIT_TABLE: Record<Catalogue, string> = {
  av: "List_AV",
  ebook: "List_EBook",
  ejournal: "List_EJournal",
};

/**
 * This institution-year's own entries that were made by editing another
 * entry, each mapped to the entry it was copied from.
 */
export async function editedCopies(catalogue: Catalogue, libraryYearId: number): Promise<Map<number, number>> {
  return (await editedCopiesByLibraryYear(catalogue, [libraryYearId])).get(libraryYearId)!;
}

/** The same for many institution-years at once, keyed by Library_Year id. */
export async function editedCopiesByLibraryYear(
  catalogue: Catalogue,
  libraryYearIds: number[],
): Promise<Map<number, Map<number, number>>> {
  const result = new Map(libraryYearIds.map((id) => [id, new Map<number, number>()]));
  if (libraryYearIds.length === 0) return result;

  const where = { libraryyear: { in: libraryYearIds }, is_global: false };
  const select = { id: true, libraryyear: true };
  const own = catalogue === "av"
    ? await db.list_AV.findMany({ where, select })
    : catalogue === "ebook"
      ? await db.list_EBook.findMany({ where, select })
      : await db.list_EJournal.findMany({ where, select });
  if (own.length === 0) return result;

  const created = await db.auditLog.findMany({
    where: {
      table_name: AUDIT_TABLE[catalogue],
      action: "CREATE",
      record_id: { in: own.map((row) => String(row.id)) },
    },
    select: { record_id: true, old_values: true },
  });
  const owner = new Map(own.map((row) => [row.id, row.libraryyear]));
  for (const row of created) {
    const copyId = Number(row.record_id);
    const originalId = Number((row.old_values as { original_id?: unknown } | null)?.original_id);
    const libraryYearId = owner.get(copyId);
    if (libraryYearId != null && Number.isInteger(originalId) && originalId > 0) {
      result.get(libraryYearId)?.set(copyId, originalId);
    }
  }
  return result;
}

/** The copies made of these entries by edits, at every institution. */
export async function copiesMadeOf(catalogue: Catalogue, ids: number[]): Promise<number[]> {
  if (ids.length === 0) return [];
  const wanted = new Set(ids);
  const created = await db.auditLog.findMany({
    where: { table_name: AUDIT_TABLE[catalogue], action: "CREATE" },
    select: { record_id: true, old_values: true },
  });
  return created
    .filter((row) => wanted.has(Number((row.old_values as { original_id?: unknown } | null)?.original_id)))
    .map((row) => Number(row.record_id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

/**
 * These entries plus the ones tied to them by an edit: the entry each was
 * copied from, and every copy made of that entry. Taking an entry out of My
 * Access takes out the institution's versions of it too, so none is left
 * behind to be counted in My Forms.
 */
export function withEditedCopies(ids: number[], copies: Map<number, number>): number[] {
  const originals = new Set(ids.map((id) => copies.get(id) ?? id));
  const related = new Set([...ids, ...originals]);
  for (const [copyId, originalId] of copies) {
    if (originals.has(originalId)) related.add(copyId);
  }
  return [...related];
}

type AccessRow = { is_selected: boolean | null; custom_count: number | null };

/**
 * The My Access rows Manage Access lists for a year.
 *
 * Only entries still in that year's list: an entry deleted from the list is
 * no longer held that year. Each is listed when ticked or given a count of
 * its own. An entry the institution edited is listed once, as its newest
 * version, for as long as the entry it replaces is held.
 */
export function heldAccessRows<T extends AccessRow>(
  rows: T[],
  entryId: (row: T) => number,
  inYearList: (row: T) => boolean,
  copies: Map<number, number>,
): T[] {
  const listed = rows.filter(inYearList);
  const byId = new Map(listed.map((row) => [entryId(row), row]));
  const isHeld = (row: AccessRow | undefined) => !!row && (!!row.is_selected || row.custom_count != null);

  // If an entry was edited more than once, each edit made a copy; the newest wins.
  const newestCopy = new Map<number, number>();
  for (const [copyId, originalId] of copies) {
    if (byId.has(copyId) && copyId > (newestCopy.get(originalId) ?? 0)) newestCopy.set(originalId, copyId);
  }

  const held: T[] = [];
  for (const row of listed) {
    const id = entryId(row);
    if (newestCopy.has(id)) continue; // shown as the institution's version instead
    const originalId = copies.get(id);
    if (originalId === undefined) {
      if (isHeld(row)) held.push(row);
      continue;
    }
    if (newestCopy.get(originalId) !== id) continue; // an older version
    const original = byId.get(originalId);
    if (isHeld(row) || isHeld(original)) {
      held.push({ ...row, is_selected: !!row.is_selected || !!original?.is_selected });
    }
  }
  return held;
}
