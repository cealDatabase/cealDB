import { getLanguageIdByListEBookId, getListEBookByID, getListEBookCountsByYear } from "@/data/fetchPrisma";
import { z } from "zod"
import { listEBookSchema } from "../data/schema"

const getEBookListByYear = async (year: number) => {
    const listEBookCountsByYear = await getListEBookCountsByYear(year);
    const outputArray: any[] = [];
    const ListEBookIdArray: number[] = [];

    listEBookCountsByYear?.forEach((object) => {
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
            const languageArray = languageIDs?.map(id => ({ language_id: id })) || [];

            outputArray.push({
                id: listEBookId,
                title: listEBookItem.title,
                sub_series_number: listEBookItem.sub_series_number,
                publisher: listEBookItem.publisher,
                description: listEBookItem.description,
                notes: listEBookItem.notes,
                updated_at: listEBookItem.updated_at,
                subtitle: listEBookItem.subtitle,
                cjk_title: listEBookItem.cjk_title,
                romanized_title: listEBookItem.romanized_title,
                data_source: listEBookItem.data_source,
                libraryyear: listEBookItem.libraryyear,
                is_global: listEBookItem.is_global,
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

export async function GetEBookList(year: number) {
    const data = await getEBookListByYear(year);
    return z.array(listEBookSchema).parse(data || []);
}