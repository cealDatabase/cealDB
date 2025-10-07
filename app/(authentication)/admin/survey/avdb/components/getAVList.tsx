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
  
  // Use a Map instead of parallel arrays to prevent misalignment
  const countsMap = new Map<number, number>();

  console.log(`🔢 Found ${listAVCountsByYear?.length || 0} count records for year ${userSelectedYear}`);

  listAVCountsByYear?.forEach((object, index) => {
    if (object.listav !== null) {
      ListAVIdArray.push(object.listav);
      const countValue = object.titles !== null ? object.titles : 0;
      countsMap.set(object.listav, countValue);
      
      // Log first 5 records to see the mapping
      if (index < 5) {
        console.log(`  [${index}] listav=${object.listav}, titles=${object.titles} -> Map stores: ${countValue}`);
      }
    }
  });

  console.log('\n📋 Map built with', countsMap.size, 'entries');

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

      // console.log("getAVList type:", listAVItem.type);

      // Get counts from Map - guaranteed correct mapping
      const countsValue = countsMap.get(listAVId) ?? 0;
      
      // Debug logging for first 3 records
      if (ListAVIdArray.indexOf(listAVId) < 3) {
        console.log(`📊 Building record for listAVId=${listAVId}:`, {
          listAVId,
          countsValue,
          title: listAVItem.title,
        });
      }

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