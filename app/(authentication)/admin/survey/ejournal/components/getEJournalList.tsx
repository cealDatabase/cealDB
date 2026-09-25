import {
  getListEJournalCountsByYear,
  getListEJournalByID,
  getLanguageIdByListEJournalId,
  getSubscriberIdByListEJournalId,
  getLibraryById,
  getLanguageById,
  getLibYearByLibIdAndYear,
} from "@/data/fetchPrisma";
import { z } from "zod";
import { listEJournalSchema } from "../data/schema";
import db from "@/lib/db";
import { getSessionRoleIds } from "@/lib/auth";

/** Extend base schema so we keep per-year fields */
// ⬇️ extend: keep legacy `counts` but make it optional + default
const listEJournalRowSchema = listEJournalSchema.extend({
  counts: z.number().optional().default(0),
  journals: z.number().nullable().optional(),
  dbs: z.number().nullable().optional(),
});

const getEJournalListByYear = async (userSelectedYear: number, includeUnverified = false) => {
  // counts rows: expect listejournal, journals, dbs
  const counts = await getListEJournalCountsByYear(userSelectedYear);

  // Map eJournalId -> { journals, dbs }
  const idToCounts = new Map<number, { journals: number; dbs: number }>();
  counts?.forEach((c: any) => {
    if (c?.listejournal != null) {
      idToCounts.set(c.listejournal, {
        journals: Number.isFinite(c.journals) ? Number(c.journals) : 0,
        dbs: Number.isFinite(c.dbs) ? Number(c.dbs) : 0,
      });
    }
  });

  const ids = [...idToCounts.keys()];
  if (ids.length === 0) return [];

  const outputArray: any[] = [];

  await Promise.all(
    ids.map(async (ejId) => {
      const ej = await getListEJournalByID(ejId);
      if (!ej) return;

      // languages → labels
      const langIds = await getLanguageIdByListEJournalId(ejId);
      const languageArray =
        (
          await Promise.all(
            (langIds ?? []).map(async (id: number) => await getLanguageById(id))
          )
        )
          ?.map((lang) => lang?.short)
          .filter(Boolean) ?? [];

      // subscribers → names
      const subIds = await getSubscriberIdByListEJournalId(
        ejId,
        userSelectedYear
      );
      const subscriberLibraryNames = await Promise.all(
        (subIds ?? []).map(async (subscriberId) => {
          if (subscriberId != null) {
            const library = await getLibraryById(subscriberId);
            return library?.library_name
              ? `- ${library.library_name.trim()} `
              : null;
          }
          return null;
        })
      );
      const uniqueSubscriberLibraryNames = Array.from(
        new Set(subscriberLibraryNames.filter(Boolean))
      ).sort();

      const c = idToCounts.get(ejId);

      outputArray.push({
        id: ejId,
        title: ej.title,
        sub_series_number: ej.sub_series_number,

        // ⬇️ per-year fields
        journals: c?.journals ?? 0,
        dbs: c?.dbs ?? 0,

        // ⬅️ keep legacy field so existing Zod/table code is happy
        counts: c?.journals ?? 0,

        publisher: ej.publisher,
        description: ej.description,
        notes: ej.notes,
        updated_at: ej.updated_at.toDateString(),
        subtitle: ej.subtitle,
        series: ej.series,
        vendor: ej.vendor,
        cjk_title: ej.cjk_title,
        romanized_title: ej.romanized_title,
        data_source: ej.data_source,
        libraryyear: ej.libraryyear,
        is_global: ej.is_global,
        subscribers: uniqueSubscriberLibraryNames,
        language: languageArray,
      });
    })
  );

  // de-dupe by id (keeps your original intent, but type-safe)
  const groupedRecords = Array.from(
    new Map<number, (typeof outputArray)[number]>(
      outputArray.map((item) => [item.id as number, item])
    ).values()
  );

  const previousYear = userSelectedYear - 1;
  const previousEntries = await db.list_EJournal.findMany({
    where: { List_EJournal_Counts: { some: { year: previousYear } } },
    select: {
      id: true, is_global: true, libraryyear: true, title: true,
      sub_series_number: true, publisher: true, description: true, notes: true,
      subtitle: true, series: true, vendor: true, cjk_title: true,
      romanized_title: true, data_source: true,
      Library_Year: { select: { library: true } },
    },
  });
  const currentEntries = await db.list_EJournal.findMany({
    where: { id: { in: groupedRecords.map((row: any) => row.id) } },
    select: {
      id: true, is_global: true, title: true, sub_series_number: true,
      publisher: true, description: true, notes: true, subtitle: true,
      series: true, vendor: true, cjk_title: true, romanized_title: true,
      data_source: true, source_entry_id: true, shared_by_admin_edit: true,
      Library_Year: { select: { library: true } },
    },
  });
  const globalIds = new Set(previousEntries.filter((row) => row.is_global).map((row) => row.id));
  const localKey = (row: any, library: number | null | undefined) => JSON.stringify([
    library, row.title, row.sub_series_number, row.publisher, row.description,
    row.notes, row.subtitle, row.series, row.vendor, row.cjk_title,
    row.romanized_title, row.data_source,
  ]);
  const copyAuditRows = await db.auditLog.findMany({
    where: { table_name: "List_EJournal", action: "CREATE" },
    select: { record_id: true, old_values: true, timestamp: true },
  });
  const copiedFromGlobalIds = new Set(copyAuditRows
    .filter((row) => (row.old_values as { original_id?: unknown } | null)?.original_id != null)
    .map((row) => Number(row.record_id)));
  const currentYearCreatedIds = new Set(copyAuditRows
    .filter((row) => row.timestamp.getUTCFullYear() === userSelectedYear)
    .map((row) => Number(row.record_id)));
  const priorLocalOrigins = new Map(previousEntries
    .filter((row) => !row.is_global && row.Library_Year?.library)
    .map((row) => [
      localKey(row, row.Library_Year?.library),
      copiedFromGlobalIds.has(row.id) ? `${previousYear} Global (Admin)` : `${previousYear} Institution-created`,
    ]));
  const previousEntryOrigins = new Map(previousEntries.map((row) => [
    row.id,
    row.is_global || copiedFromGlobalIds.has(row.id)
      ? `${previousYear} Global (Admin)`
      : `${previousYear} Institution-created`,
  ]));
  const localOrigin = (row: any) =>
    copiedFromGlobalIds.has(row.id)
      ? `${previousYear} Global (Admin)`
      : row.source_entry_id != null
        ? previousEntryOrigins.get(row.source_entry_id) ?? null
        : priorLocalOrigins.get(localKey(row, row.Library_Year?.library)) ?? null;
  const origins = new Map(currentEntries.map((row) => [
    row.id,
    row.is_global && globalIds.has(row.id)
      ? `${previousYear} Global (Admin)`
      : !row.is_global
        ? localOrigin(row) ?? (currentYearCreatedIds.has(row.id) ? `${userSelectedYear} Institution-created` : null)
        : currentYearCreatedIds.has(row.id) ? `${userSelectedYear} Admin-created` : null,
  ]));
  const globalDerivedLocalIds = new Set(currentEntries
    .filter((row) => !row.is_global && localOrigin(row) === `${previousYear} Global (Admin)`)
    .map((row) => row.id));
  const sharedByAdminEditIds = new Set(currentEntries
    .filter((row) => row.shared_by_admin_edit)
    .map((row) => row.id));
  const institutionIds = currentEntries
    .map((row) => row.Library_Year?.library)
    .filter((id): id is number => id != null);
  const institutions = await db.library.findMany({
    where: { id: { in: institutionIds } },
    select: { id: true, library_name: true },
  });
  const institutionNames = new Map(institutions.map((institution) => [institution.id, institution.library_name]));
  const originInstitutions = new Map(currentEntries.map((row) => [
    row.id,
    !row.is_global && (
      localOrigin(row) === `${previousYear} Institution-created` ||
      origins.get(row.id) === `${userSelectedYear} Institution-created`
    )
      ? institutionNames.get(row.Library_Year?.library ?? -1) ?? null
      : null,
  ]));

  const records = groupedRecords
    .filter((row: any) => !globalDerivedLocalIds.has(row.id))
    .map((row: any) => ({
    ...row,
    import_origin: origins.get(row.id) ?? "Legacy / source unverified",
    origin_institution: originInstitutions.get(row.id) ?? null,
    shared_by_admin_edit: sharedByAdminEditIds.has(row.id),
  }));

  return includeUnverified
    ? records
    : records.filter((row: any) => row.import_origin !== "Legacy / source unverified");
};

export async function GetEJournalList(userSelectedYear: number) {
  const includeUnverified = (await getSessionRoleIds()).includes(1);
  const data = await getEJournalListByYear(userSelectedYear, includeUnverified);
  // Use the extended schema so journals/dbs are preserved
  return z.array(listEJournalRowSchema).parse(data || []);
}

// Extended schema with user selections
const listEJournalWithSelectionSchema = listEJournalRowSchema.extend({
  is_selected: z.boolean().optional(),
  custom_count: z.number().nullable().optional(),
});

export type listEJournalWithSelection = z.infer<typeof listEJournalWithSelectionSchema>;

/**
 * Get EJournal list with user selections for a specific library
 */
export async function GetEJournalListWithUserSelections(
  userSelectedYear: number,
  libraryId: number
) {
  // Get library_year record and extract id
  const libraryYearRecords = await getLibYearByLibIdAndYear(libraryId, userSelectedYear);
  const libraryYearId = libraryYearRecords && libraryYearRecords.length > 0 
    ? libraryYearRecords[0].id 
    : null;
  
  // Super Admin and Editor can review every institution's current local
  // additions. Other roles receive only their own current-year local rows.
  const roleIds = await getSessionRoleIds();
  const canReviewAllInstitutions = roleIds.includes(1) || roleIds.includes(3);
  const includeUnverified = roleIds.includes(1);
  const baseData = await getEJournalListByYear(userSelectedYear, includeUnverified);
  const localYearIds = baseData
    .map((item) => item.libraryyear)
    .filter((id): id is number => id != null);
  const localOwners = new Map((await db.library_Year.findMany({
    where: { id: { in: localYearIds } },
    select: { id: true, library: true },
  })).map((row) => [row.id, row.library]));
  const visibleBaseData = canReviewAllInstitutions
    ? baseData
    : baseData.filter((item) =>
        !item.import_origin?.endsWith("Institution-created") ||
        item.shared_by_admin_edit ||
        localOwners.get(item.libraryyear ?? -1) === libraryId
      );
  
  // Get user selections if libraryYear exists
  let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
  
  if (libraryYearId) {
    const selections = await db.libraryYear_ListEJournal.findMany({
      where: { libraryyear_id: libraryYearId },
      select: {
        listejournal_id: true,
        is_selected: true,
        custom_count: true,
      },
    });
    
    selections.forEach((sel) => {
      userSelections.set(sel.listejournal_id, {
        is_selected: sel.is_selected ?? false,
        custom_count: sel.custom_count,
      });
    });
  }
  
  // Merge user selections with base data
  const mergedData = visibleBaseData.map((item) => {
    const selection = userSelections.get(item.id);
    return {
      ...item,
      is_selected: selection?.is_selected ?? false,
      custom_count: selection?.custom_count ?? null,
    };
  });

  // Current-year institution-created entries are private to their owning
  // institution; all other shared catalogue rows remain selectable.
  return z.array(listEJournalWithSelectionSchema).parse(mergedData || []);
}
