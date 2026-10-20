// lib/heldAccess.ts
//
// What an institution holds in a year's My Access, for AV, E-Book and
// E-Journal. Manage Access lists these rows and the My Forms imports count
// them, both from here, so what an institution sees in Manage Access is what
// goes into its forms.
//
// A row is held when ticked or given a count of its own, for an entry still
// in that year's list; an edited entry counts once, as the institution's
// newest version (lib/editedCopies.ts). Entries with the same identifying
// fields count once, the institution's own version before a shared one.
//
// The imports used to count every My Access row, ticked or not, and told
// entries apart by title alone: unticked rows were counted, an entry edited
// twice was counted twice, and editing one of several same-titled modules
// dropped the others.

import db from "@/lib/db";
import { editedCopies, heldAccessRows } from "@/lib/editedCopies";

type AccessRow = { is_selected: boolean | null; custom_count: number | null };

/**
 * One row per entry. Entries whose identifying fields match are listed once,
 * the institution's own version before a shared one; a tick or a count of
 * its own on a twin carries over to the row kept.
 */
function onePerEntry<R extends AccessRow, E extends { is_global: boolean | null }>(
  rows: R[],
  entry: (row: R) => E,
  identifier: (entry: E) => string,
): R[] {
  const groups = new Map<string, R[]>();
  for (const row of rows) {
    const key = identifier(entry(row));
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return Array.from(groups.values()).map((group) => {
    const kept = { ...(group.find((row) => !entry(row).is_global) ?? group[0]) };
    for (const twin of group) {
      if (kept.custom_count == null && twin.custom_count != null) kept.custom_count = twin.custom_count;
      if (!kept.is_selected && twin.is_selected) kept.is_selected = twin.is_selected;
    }
    return kept;
  });
}

const lower = (value: string | null) => value?.toLowerCase() || "";

export async function heldAVAccess(libraryYearId: number, year: number) {
  const rows = await db.libraryYear_ListAV.findMany({
    where: { libraryyear_id: libraryYearId },
    select: {
      libraryyear_id: true,
      listav_id: true,
      is_selected: true,
      custom_count: true,
      List_AV: {
        include: {
          List_AV_Counts: { where: { year } },
          List_AV_Language: { include: { Language: true } },
        },
      },
    },
  });
  const held = heldAccessRows(
    rows,
    (row) => row.listav_id,
    (row) => row.List_AV.List_AV_Counts.length > 0,
    await editedCopies("av", libraryYearId),
  );
  return onePerEntry(held, (row) => row.List_AV, (av) => `${lower(av.title)}_${lower(av.type)}_${lower(av.subtitle)}`);
}

export async function heldEBookAccess(libraryYearId: number, year: number) {
  const rows = await db.libraryYear_ListEBook.findMany({
    where: { libraryyear_id: libraryYearId },
    select: {
      libraryyear_id: true,
      listebook_id: true,
      is_selected: true,
      custom_count: true,
      List_EBook: {
        include: {
          List_EBook_Counts: { where: { year } },
          List_EBook_Language: { include: { Language: true } },
        },
      },
    },
  });
  const held = heldAccessRows(
    rows,
    (row) => row.listebook_id,
    (row) => row.List_EBook.List_EBook_Counts.length > 0,
    await editedCopies("ebook", libraryYearId),
  );
  return onePerEntry(
    held,
    (row) => row.List_EBook,
    (ebook) => `${lower(ebook.title)}_${lower(ebook.publisher)}_${lower(ebook.subtitle)}`,
  );
}

export async function heldEJournalAccess(libraryYearId: number, year: number) {
  const rows = await db.libraryYear_ListEJournal.findMany({
    where: { libraryyear_id: libraryYearId },
    select: {
      libraryyear_id: true,
      listejournal_id: true,
      is_selected: true,
      custom_count: true,
      List_EJournal: {
        include: {
          List_EJournal_Counts: { where: { year } },
          List_EJournal_Language: { include: { Language: true } },
        },
      },
    },
  });
  const held = heldAccessRows(
    rows,
    (row) => row.listejournal_id,
    (row) => row.List_EJournal.List_EJournal_Counts.length > 0,
    await editedCopies("ejournal", libraryYearId),
  );
  return onePerEntry(
    held,
    (row) => row.List_EJournal,
    (ejournal) =>
      `${lower(ejournal.title)}_${lower(ejournal.publisher)}_${lower(ejournal.subtitle)}_${lower(ejournal.series)}`,
  );
}
