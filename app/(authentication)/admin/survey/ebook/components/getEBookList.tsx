import {
    getListEBookCountsByYear,
    getListEBookByID,
    getLanguageIdByListEBookId,
    getSubscriberIdByListEBookId,
    getLibraryById,
    getLanguageById
} from "@/data/fetchPrisma";
import { z } from "zod"
import { listEBookSchema } from "../data/schema"

const getEBookListByYear = async (year: number) => {
    const listEBookCountsByYear = await getListEBookCountsByYear(year);
    const outputArray: any[] = [];
    const ListEBookIdArray: number[] = [];
    const listEBookCountNumberArray: number[] = [];

    listEBookCountsByYear?.forEach((object) => {
        if (object.titles !== null) {
            listEBookCountNumberArray.push(object.titles);
        } else {
            listEBookCountNumberArray.push(0);
        }
        if (object.listebook !== null) {
            ListEBookIdArray.push(object.listebook);
        }
    });

    if (ListEBookIdArray.length === 0) return [];

    await Promise.all(
        ListEBookIdArray.map(async (listEBookId: number) => {
            const listEBookItem = await getListEBookByID(listEBookId);
            if (!listEBookItem) return;

            const languageIDs = await getLanguageIdByListEBookId(listEBookId);
            const languageArray = (await Promise.all(languageIDs?.map(async (id) => await getLanguageById(id)) || []))?.map((lang) => lang?.short) || [];

            const subscriberIDs = await getSubscriberIdByListEBookId(listEBookId);

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
                id: listEBookId,
                title: listEBookItem.title,
                counts: listEBookCountNumberArray[ListEBookIdArray.indexOf(listEBookId)],
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

export async function GetEBookList(year: number) {
    const data = await getEBookListByYear(year);
    return z.array(listEBookSchema).parse(data || []);
}