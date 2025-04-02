import { getLanguageIdByListAvId, getListAVByID, getListAVCountsByYear } from "@/data/fetchPrisma";
import { z } from "zod"
import { listAVSchema } from "../data/schema"

const getAVListByYear = async (year: number) => {
    const listAVCountsByYear = await getListAVCountsByYear(year);
    const outputArray: any[] = [];
    const ListAVIdArray: number[] = [];

    listAVCountsByYear?.forEach((object) => {
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
            const languageArray = languageIDs?.map(id => ({ language_id: id })) || [];

            outputArray.push({
                id: listAVId,
                type: listAVItem.type?.toLowerCase().replace("/ ", "/"),
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
            });
        })
    );

    // Group records by ID after all processing is complete
    const groupedRecords = Array.from(
        outputArray.reduce((map, item) => {
            const existing = map.get(item.id);
            if (existing) {
                // Merge languages and remove duplicates
                const mergedLanguages = [...existing.language, ...item.language]
                    .filter((lang, index, self) =>
                        self.findIndex(l => l.language_id === lang.language_id) === index
                    );
                map.set(item.id, {
                    ...existing,
                    language: mergedLanguages
                });
            } else {
                map.set(item.id, item);
            }
            return map;
        }, new Map<number, typeof outputArray[0]>())
    ).map((entry) => {
        const [_, value] = entry as [number, typeof outputArray[0]];
        return value;
    });

    return groupedRecords;
}

export async function GetAVList(year: number) {
    const data = await getAVListByYear(year);
    return z.array(listAVSchema).parse(data || []);
}