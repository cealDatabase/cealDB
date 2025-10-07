import {
  getListEBookCountsByYear,
  getListEBookByID,
  getLanguageIdByListEBookId,
  getSubscriberIdByListEBookId,
  getLibraryById,
  getLanguageById,
} from "@/data/fetchPrisma";
import { z } from "zod";
import { listEBookSchema } from "../data/schema";

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
