import {
  getListAVCountsByYear,
  getListAVByID,
  getLanguageIdByListAvId,
  getSubscriberIdByListAvId,
  getLibraryById,
  getLanguageById,
  getLibYearByLibIdAndYear,
} from "@/data/fetchPrisma";
import { z } from "zod"
import { listAVSchema } from "../data/schema"
import db from "@/lib/db";
import { getSessionRoleIds } from "@/lib/auth";

const getAVListByYear = async (userSelectedYear: number, includeUnverified = false) => {
  const listAVCountsByYear = await getListAVCountsByYear(userSelectedYear);
  const outputArray: any[] = [];
  const ListAVIdArray: number[] = [];
  
  // Use a Map instead of parallel arrays to prevent misalignment
  const countsMap = new Map<number, number>();

  listAVCountsByYear?.forEach((object, index) => {
    if (object.listav !== null) {
      ListAVIdArray.push(object.listav);
      const countValue = object.titles !== null ? object.titles : 0;
      countsMap.set(object.listav, countValue);
    }
  });

  if (ListAVIdArray.length === 0) return [];

  await Promise.all(
    ListAVIdArray.map(async (listAVId: number) => {
      const listAVItem = await getListAVByID(listAVId);
      if (!listAVItem) return;

      const languageIDs = await getLanguageIdByListAvId(listAVId);
      const languageArray =
        (
          await Promise.all(
            languageIDs?.map(async (id) => await getLanguageById(id)) || []
          )
        )?.map((lang) => lang?.short) || [];

      const subscriberIDs = await getSubscriberIdByListAvId(
        listAVId,
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
      const countsValue = countsMap.get(listAVId) ?? 0;

      outputArray.push({
        id: listAVId,
        type: listAVItem.type?.toLowerCase().replace("/ ", "/"),
        counts: countsValue,
        title: listAVItem.title,
        cjk_title: listAVItem.cjk_title,
        romanized_title: listAVItem.romanized_title,
        subtitle: listAVItem.subtitle,
        publisher: listAVItem.publisher,
        description: listAVItem.description,
        notes: listAVItem.notes,
        data_source: listAVItem.data_source,
        updated_at: listAVItem.updated_at,
        is_global: listAVItem.is_global,
        libraryyear: listAVItem.libraryyear,
        language: languageArray,
        subscribers: uniqueSubscriberLibraryNames,
      });
    })
  );

  // Group records by ID after all processing is complete
  const groupedRecords = Array.from(
    outputArray.reduce((map, item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
      return map;
    }, new Map<number, (typeof outputArray)[0]>())
  ).map((entry) => {
    const [_, value] = entry as [number, (typeof outputArray)[0]];
    return value;
  });

  // Mark only entries that can be traced to the immediately preceding year.
  // Global entries keep the same List_AV id; local entries are copied to a
  // new id, so they are matched by owning institution plus catalogue fields.
  const previousYear = userSelectedYear - 1;
  const previousEntries = await db.list_AV.findMany({
    where: { List_AV_Counts: { some: { year: previousYear } } },
    select: {
      id: true, is_global: true, libraryyear: true, type: true, title: true,
      cjk_title: true, romanized_title: true, subtitle: true, publisher: true,
      description: true, notes: true, data_source: true,
      Library_Year: { select: { library: true } },
    },
  });
  const currentEntries = await db.list_AV.findMany({
    where: { id: { in: groupedRecords.map((row: any) => row.id) } },
    select: {
      id: true, is_global: true, type: true, title: true, cjk_title: true,
      romanized_title: true, subtitle: true, publisher: true, description: true,
      notes: true, data_source: true, source_entry_id: true, shared_by_admin_edit: true,
      Library_Year: { select: { library: true } },
    },
  });
  const globalIds = new Set(previousEntries.filter((row) => row.is_global).map((row) => row.id));
  const localKey = (row: any, library: number | null | undefined) => JSON.stringify([
    library, row.type, row.title, row.cjk_title, row.romanized_title, row.subtitle,
    row.publisher, row.description, row.notes, row.data_source,
  ]);
  const copyAuditRows = await db.auditLog.findMany({
    where: { table_name: "List_AV", action: "CREATE" },
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
}

export async function GetAVList(userSelectedYear: number) {
  const includeUnverified = (await getSessionRoleIds()).includes(1);
  const data = await getAVListByYear(userSelectedYear, includeUnverified);
  return z.array(listAVSchema).parse(data || []);
}

// Extended schema with user selections
const listAVWithSelectionSchema = listAVSchema.extend({
  is_selected: z.boolean().optional(),
  custom_count: z.number().nullable().optional(),
});

export type listAVWithSelection = z.infer<typeof listAVWithSelectionSchema>;

/**
 * Get AV list with user selections for a specific library
 */
export async function GetAVListWithUserSelections(
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
  const baseData = await getAVListByYear(userSelectedYear, includeUnverified);
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
    const selections = await db.libraryYear_ListAV.findMany({
      where: { libraryyear_id: libraryYearId },
      select: {
        listav_id: true,
        is_selected: true,
        custom_count: true,
      },
    });
    
    selections.forEach((sel) => {
      userSelections.set(sel.listav_id, {
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
  return z.array(listAVWithSelectionSchema).parse(mergedData || []);
}
