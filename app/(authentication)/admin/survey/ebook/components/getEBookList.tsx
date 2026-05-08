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

/** ⬇️ allow volumes/chapters on each row (local-only, no schema migration) */
const listEBookRowSchema = listEBookSchema.extend({
  volumes: z.number().nullable().optional(),
  chapters: z.number().nullable().optional(),
});

const getEBookListByYear = async (userSelectedYear: number) => {
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

  return groupedRecords;
};

export async function GetEBookList(userSelectedYear: number) {
  const data = await getEBookListByYear(userSelectedYear);
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
  const baseData = await getEBookListByYear(userSelectedYear);
  
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

  // Dedup global-vs-library-specific twins for this user's library so the
  // user only sees one row per resource. Carry over selection state from
  // any deduped twin to avoid losing prior input.
  let displayData = mergedData;
  if (libraryYearId) {
    const groupKey = (it: any) =>
      `${(it.title ?? "").toLowerCase()}_${(it.publisher ?? "").toLowerCase()}_${(it.subtitle ?? "").toLowerCase()}`;
    const groups = new Map<string, typeof mergedData>();
    for (const item of mergedData) {
      const k = groupKey(item);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(item);
    }
    const kept: typeof mergedData = [];
    for (const group of groups.values()) {
      if (group.length === 1) {
        kept.push(group[0]);
        continue;
      }
      const mine = group.find(
        (g: any) => g.libraryyear === libraryYearId && g.is_global === false
      );
      if (mine) {
        const twinWithState = group.find(
          (g: any) => g !== mine && (g.is_selected || g.custom_count != null)
        );
        if (twinWithState) {
          (mine as any).is_selected = (mine as any).is_selected || (twinWithState as any).is_selected;
          if ((mine as any).custom_count == null) {
            (mine as any).custom_count = (twinWithState as any).custom_count;
          }
        }
        kept.push(mine);
      } else {
        kept.push(...group);
      }
    }
    displayData = kept;
  }

  return z.array(listEBookWithSelectionSchema).parse(displayData || []);
}
