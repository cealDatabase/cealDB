// lib/auditChanges.ts
//
// What an edit changed, for the audit log. The catalogue Edit dialogs save
// every field at once, so logging the request would not say what was
// actually changed, and logging nothing (as before) left no way to see who
// changed a note or what it said before. These helpers log only the fields
// whose value differs, with their value before and after.

import db from "@/lib/db";

type Row = Record<string, unknown> | null | undefined;
export type Catalogue = "av" | "ebook" | "ejournal";

// The dialogs save an empty box as "" where the row had null; that is no
// change anyone can see, so the two count as the same here. The database's
// own change log (scripts/data-change-log.sql) still records it exactly.
const comparable = (value: unknown): unknown =>
  value instanceof Date ? value.toISOString() : value === undefined || value === "" ? null : value;

/**
 * The fields whose value differs between `before` and `after`, as
 * { old, new }. Timestamps a save always moves are left out.
 */
export function changedFields(
  before: Row,
  after: Row,
  ignore: string[] = ["updated_at", "updatedat", "updatedAt"],
): { old: Record<string, unknown>; new: Record<string, unknown> } {
  const old: Record<string, unknown> = {};
  const next: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const key of keys) {
    if (ignore.includes(key)) continue;
    const a = comparable(before?.[key]);
    const b = comparable(after?.[key]);
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      old[key] = a;
      next[key] = b;
    }
  }
  return { old, new: next };
}

/**
 * A catalogue entry as the Edit dialogs show it: its own fields, that
 * year's counts, and its languages (ids, sorted). Null if there is none.
 * Never throws: a failed read only leaves the log entry without values, it
 * does not fail the save it describes.
 */
export async function catalogueEntryForAudit(
  catalogue: Catalogue,
  id: number,
  year: number | null,
): Promise<Record<string, unknown> | null> {
  try {
    return await readCatalogueEntry(catalogue, id, year);
  } catch (error) {
    console.error("Could not read the entry for the audit log:", error);
    return null;
  }
}

async function readCatalogueEntry(
  catalogue: Catalogue,
  id: number,
  year: number | null,
): Promise<Record<string, unknown> | null> {
  const countsWhere = { where: { year: year ?? -1 }, take: 1 };
  if (catalogue === "av") {
    const row = await db.list_AV.findUnique({
      where: { id },
      include: { List_AV_Counts: countsWhere, List_AV_Language: { select: { language_id: true } } },
    });
    if (!row) return null;
    const { List_AV_Counts: counts, List_AV_Language: languages, ...fields } = row;
    return {
      ...fields,
      ...(year != null ? { titles: counts[0]?.titles ?? null } : {}),
      language: languages.map((l) => l.language_id).sort((a, b) => a - b),
    };
  }
  if (catalogue === "ebook") {
    const row = await db.list_EBook.findUnique({
      where: { id },
      include: { List_EBook_Counts: countsWhere, List_EBook_Language: { select: { language_id: true } } },
    });
    if (!row) return null;
    const { List_EBook_Counts: counts, List_EBook_Language: languages, ...fields } = row;
    return {
      ...fields,
      ...(year != null
        ? { titles: counts[0]?.titles ?? null, volumes: counts[0]?.volumes ?? null, chapters: counts[0]?.chapters ?? null }
        : {}),
      language: languages.map((l) => l.language_id).sort((a, b) => a - b),
    };
  }
  const row = await db.list_EJournal.findUnique({
    where: { id },
    include: { List_EJournal_Counts: countsWhere, List_EJournal_Language: { select: { language_id: true } } },
  });
  if (!row) return null;
  const { List_EJournal_Counts: counts, List_EJournal_Language: languages, ...fields } = row;
  return {
    ...fields,
    ...(year != null ? { journals: counts[0]?.journals ?? null, dbs: counts[0]?.dbs ?? null } : {}),
    language: languages.map((l) => l.language_id).sort((a, b) => a - b),
  };
}
