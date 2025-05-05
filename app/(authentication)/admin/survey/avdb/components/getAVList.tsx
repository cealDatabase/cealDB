import {
  getListAVCountsByYear,
  getListAVByID,
  getLanguageIdByListAvId,
  getSubscriberIdByListAvId,
  getLibraryById,
  getLanguageById
} from "@/data/fetchPrisma";
import { z } from "zod"
import { listAVSchema } from "../data/schema"

const getAVListByYear = async (userSelectedYear: number) => {
  const listAVCountsByYear = await getListAVCountsByYear(userSelectedYear);
  const outputArray: any[] = [];
  const ListAVIdArray: number[] = [];
  const listAVCountNumberArray: number[] = [];

  listAVCountsByYear?.forEach((object) => {
    if (object.titles !== null) {
      listAVCountNumberArray.push(object.titles);
    } else {
      listAVCountNumberArray.push(0);
    }
    if (object.listav !== null) {
      ListAVIdArray.push(object.listav);
    }
  });

  if (ListAVIdArray.length === 0) return [];

  await Promise.all(
    ListAVIdArray.map(async (listAVId: number) => {
      const listAVItem = await getListAVByID(listAVId);
      if (!listAVItem) return;

      const languageIDs = await getLanguageIdByListAvId(listAVId);
      const languageArray = (await Promise.all(languageIDs?.map(async (id) => await getLanguageById(id)) || []))?.map((lang) => lang?.short) || [];

      const subscriberIDs = await getSubscriberIdByListAvId(listAVId, userSelectedYear);

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
        id: listAVId,
        type: listAVItem.type?.toLowerCase().replace("/ ", "/"),
        counts: listAVCountNumberArray[ListAVIdArray.indexOf(listAVId)],
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

  // Running all the output in website console
  // outputArray.forEach((item) => {
  //   console.log("id: ", item.id);
  //   console.log("language: ", item.language);
  // });

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

export async function GetAVList(userSelectedYear: number) {
  const data = await getAVListByYear(userSelectedYear);
  return z.array(listAVSchema).parse(data || []);
}