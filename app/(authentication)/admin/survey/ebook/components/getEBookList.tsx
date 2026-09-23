import {
  getListEBookCountsByYear,
  getListEBookByID,
  getLanguageIdByListEBookId,
  getSubscriberIdByListEBookId,
  getLibraryById,
  getLanguageById,
  getLibYearByLibIdAndYear,
} from "@/data/fetchPrisma";
import { z } from "zod";
import { listEBookSchema } from "../data/schema";
import db from "@/lib/db";
import { getSessionRoleIds } from "@/lib/auth";

/** ⬇️ allow volumes/chapters on each row (local-only, no schema migration) */
const listEBookRowSchema = listEBookSchema.extend({
  volumes: z.number().nullable().optional(),
  chapters: z.number().nullable().optional(),
});

const getEBookListByYear = async (userSelectedYear: number, includeUnverified = false) => {
  const listEBookCountsByYear =
    await getListEBookCountsByYear(userSelectedYear);

  const outputArray: any[] = [];
  const ListEBookIdArray: number[] = [];

  /** ⬇️ Use Map instead of parallel arrays to prevent misalignment */
  const countsMap = new Map<number, { titles: number; volumes: number | null; chapters: number | null }>();

  listEBookCountsByYear?.forEach((object) => {
    if (object.listebook !== null) {
      ListEBookIdArray.push(object.listebook);
      countsMap.set(object.listebook, {
        titles: object.titles ?? 0,
        volumes: object.volumes ?? 0,
        chapters: object.chapters ?? 0,
      });
    }
  });

  if (ListEBookIdArray.length === 0) return [];

  await Promise.all(
    ListEBookIdArray.map(async (listEBookId: number) => {
      const listEBookItem = await getListEBookByID(listEBookId);
      if (!listEBookItem) return;

      const languageIDs = await getLanguageIdByListEBookId(listEBookId);
      const languageArray =
        (
          await Promise.all(
            languageIDs?.map(async (id) => await getLanguageById(id)) || []
          )
        )?.map((lang) => lang?.short) || [];

      const subscriberIDs = await getSubscriberIdByListEBookId(
        listEBookId,
        userSelectedYear
      );

      const subscriberLibraryNames = await Promise.all(
        (subscriberIDs || []).map(async (subscriberId) => {
          if (subscriberId != null) {
            const library = await getLibraryById(subscriberId);
            return `- ${library?.library_name?.trim()} ` || null;
          }
          return null;
        })
      );

      // Deduplicate
      const uniqueSubscriberLibraryNames = Array.from(
        new Set(subscriberLibraryNames.filter(Boolean))
      ).sort();

      // Get counts from Map - guaranteed correct mapping
      const countsData = countsMap.get(listEBookId) ?? { titles: 0, volumes: 0, chapters: 0 };

      outputArray.push({
        id: listEBookId,
        title: listEBookItem.title,
        counts: countsData.titles,
        /** ⬇️ fields from counts table */
        volumes: countsData.volumes,
        chapters: countsData.chapters,

        sub_series_number: listEBookItem.sub_series_number,
        publisher: listEBookItem.publisher,
        description: listEBookItem.description,
        notes: listEBookItem.notes,
        updated_at: listEBookItem.updated_at.toDateString(),
        subtitle: listEBookItem.subtitle,
        cjk_title: listEBookItem.cjk_title,
        romanized_title: listEBookItem.romanized_title,
        data_source: listEBookItem.data_source,
        libraryyear: listEBookItem.libraryyear,
        is_global: listEBookItem.is_global,
        subscribers: uniqueSubscriberLibraryNames,
        language: languageArray,
      });
    })
  );

  // Group records by ID after all processing is complete
  const groupedRecords = Array.from(
    outputArray.reduce((map, item) => {
      if (!map.has(item.id)) map.set(item.id, item);
      return map;
    }, new Map<number, (typeof outputArray)[0]>())
  ).map((entry) => {
    const [_, value] = entry as [number, (typeof outputArray)[0]];
    return value;
  });

  const previousYear = userSelectedYear - 1;
  const previousEntries = await db.list_EBook.findMany({
    where: { List_EBook_Counts: { some: { year: previousYear } } },
    select: {
      id: true, is_global: true, libraryyear: true, title: true,
      sub_series_number: true, publisher: true, description: true, notes: true,
      subtitle: true, cjk_title: true, romanized_title: true, data_source: true,
      Library_Year: { select: { library: true } },
    },
  });
  const currentEntries = await db.list_EBook.findMany({
    where: { id: { in: groupedRecords.map((row: any) => row.id) } },
    select: {
      id: true, is_global: true, title: true, sub_series_number: true,
      publisher: true, description: true, notes: true, subtitle: true,
      cjk_title: true, romanized_title: true, data_source: true,
      Library_Year: { select: { library: true } },
    },
  });
  const globalIds = new Set(previousEntries.filter((row) => row.is_global).map((row) => row.id));
  const localKey = (row: any, library: number | null | undefined) => JSON.stringify([
    library, row.title, row.sub_series_number, row.publisher, row.description,
    row.notes, row.subtitle, row.cjk_title, row.romanized_title, row.data_source,
  ]);
  const copyAuditRows = await db.auditLog.findMany({
    where: { table_name: "List_EBook", action: "CREATE" },
    select: { record_id: true, old_values: true },
  });
  const copiedFromGlobalIds = new Set(copyAuditRows
    .filter((row) => (row.old_values as { original_id?: unknown } | null)?.original_id != null)
    .map((row) => Number(row.record_id)));
  const priorLocalOrigins = new Map(previousEntries
    .filter((row) => !row.is_global && row.Library_Year?.library)
    .map((row) => [
      localKey(row, row.Library_Year?.library),
      copiedFromGlobalIds.has(row.id) ? `${previousYear} Global (Admin)` : `${previousYear} Institution-created`,
    ]));
  const origins = new Map(currentEntries.map((row) => [
    row.id,
    row.is_global && globalIds.has(row.id)
      ? `${previousYear} Global (Admin)`
      : !row.is_global
        ? priorLocalOrigins.get(localKey(row, row.Library_Year?.library)) ?? null
        : null,
  ]));
  const globalDerivedLocalIds = new Set(currentEntries
    .filter((row) => !row.is_global && priorLocalOrigins.get(localKey(row, row.Library_Year?.library)) === `${previousYear} Global (Admin)`)
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
    !row.is_global && priorLocalOrigins.get(localKey(row, row.Library_Year?.library)) === `${previousYear} Institution-created`
      ? institutionNames.get(row.Library_Year?.library ?? -1) ?? null
      : null,
  ]));

  const records = groupedRecords
    .filter((row: any) => !globalDerivedLocalIds.has(row.id))
    .map((row: any) => ({
    ...row,
    import_origin: origins.get(row.id) ?? "Legacy / source unverified",
    origin_institution: originInstitutions.get(row.id) ?? null,
  }));

  return includeUnverified
    ? records
    : records.filter((row: any) => row.import_origin !== "Legacy / source unverified");
};

export async function GetEBookList(userSelectedYear: number) {
  const includeUnverified = (await getSessionRoleIds()).includes(1);
  const data = await getEBookListByYear(userSelectedYear, includeUnverified);
  /** ⬇️ parse with the extended schema so volumes/chapters are preserved */
  return z.array(listEBookRowSchema).parse(data || []);
}

// Extended schema with user selections
const listEBookWithSelectionSchema = listEBookRowSchema.extend({
  is_selected: z.boolean().optional(),
  custom_count: z.number().nullable().optional(),
});

export type listEBookWithSelection = z.infer<typeof listEBookWithSelectionSchema>;

/**
 * Get EBook list with user selections for a specific library
 */
export async function GetEBookListWithUserSelections(
  userSelectedYear: number,
  libraryId: number
) {
  // Get library_year record and extract id
  const libraryYearRecords = await getLibYearByLibIdAndYear(libraryId, userSelectedYear);
  const libraryYearId = libraryYearRecords && libraryYearRecords.length > 0 
    ? libraryYearRecords[0].id 
    : null;
  
  // Get base EBook list
  const includeUnverified = (await getSessionRoleIds()).includes(1);
  const baseData = await getEBookListByYear(userSelectedYear, includeUnverified);
  
  // Get user selections if libraryYear exists
  let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
  
  if (libraryYearId) {
    const selections = await db.libraryYear_ListEBook.findMany({
      where: { libraryyear_id: libraryYearId },
      select: {
        listebook_id: true,
        is_selected: true,
        custom_count: true,
      },
    });
    
    selections.forEach((sel) => {
      userSelections.set(sel.listebook_id, {
        is_selected: sel.is_selected ?? false,
        custom_count: sel.custom_count,
      });
    });
  }
  
  // Merge user selections with base data
  const mergedData = baseData.map((item) => {
    const selection = userSelections.get(item.id);
    return {
      ...item,
      is_selected: selection?.is_selected ?? false,
      custom_count: selection?.custom_count ?? null,
    };
  });

  // The catalogue is shared; only selection state is institution-specific.
  return z.array(listEBookWithSelectionSchema).parse(mergedData || []);
}
