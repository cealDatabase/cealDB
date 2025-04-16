import {
  getListEJournalCountsByYear,
  getListEJournalByID,
  getLanguageIdByListEJournalId,
  getSubscriberIdByListEJournalId,
  getLibraryById,
  getLanguageById
} from "@/data/fetchPrisma";
import { z } from "zod"
import { listEJournalSchema } from "../data/schema"

const getEJournalListByYear = async (year: number) => {
  const listEJournalCountsByYear = await getListEJournalCountsByYear(year);
  const outputArray: any[] = [];
  const ListEJournalIdArray: number[] = [];
  const listEJournalCountNumberArray: number[] = [];

  listEJournalCountsByYear?.forEach((object) => {
    if (object.journals !== null) {
      listEJournalCountNumberArray.push(object.journals);
    } else {
      listEJournalCountNumberArray.push(0);
    }
    if (object.listejournal !== null) {
      ListEJournalIdArray.push(object.listejournal);
    }
  });

  if (ListEJournalIdArray.length === 0) return [];

  await Promise.all(
    ListEJournalIdArray.map(async (listEJournalId: number) => {
      const listEJournalItem = await getListEJournalByID(listEJournalId);
      if (!listEJournalItem) return;

      const languageIDs = await getLanguageIdByListEJournalId(listEJournalId);
      const languageArray = (await Promise.all(languageIDs?.map(async (id) => await getLanguageById(id)) || []))?.map((lang) => lang?.short) || [];

      const subscriberIDs = await getSubscriberIdByListEJournalId(listEJournalId);

      const subscriberLibraryNames = await Promise.all((subscriberIDs || []).map(async (subscriberId) => {
        if (subscriberId != null) {
          const library = await getLibraryById(subscriberId);
          return `- ${library?.library_name?.trim()} ` || null;
        }
        return null;
      }))

      // Deduplicate
      const uniqueSubscriberLibraryNames = Array.from(
        new Set(subscriberLibraryNames.filter(Boolean))
      ).sort();

      outputArray.push({
        id: listEJournalId,
        title: listEJournalItem.title,
        counts: listEJournalCountNumberArray[ListEJournalIdArray.indexOf(listEJournalId)],
        sub_series_number: listEJournalItem.sub_series_number,
        publisher: listEJournalItem.publisher,
        description: listEJournalItem.description,
        notes: listEJournalItem.notes,
        updated_at: listEJournalItem.updated_at.toDateString(),
        subtitle: listEJournalItem.subtitle,
        series: listEJournalItem.series,
        vendor: listEJournalItem.vendor,
        cjk_title: listEJournalItem.cjk_title,
        romanized_title: listEJournalItem.romanized_title,
        data_source: listEJournalItem.data_source,
        libraryyear: listEJournalItem.libraryyear,
        is_global: listEJournalItem.is_global,
        subscribers: uniqueSubscriberLibraryNames,
        language: languageArray,
      });
    })
  );

  // Running all the output in website console
  // outputArray.map((item) => console.log(item.language));

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

  return groupedRecords;
}

export async function GetEJournalList(year: number) {
  const data = await getEJournalListByYear(year);
  return z.array(listEJournalSchema).parse(data || []);
}