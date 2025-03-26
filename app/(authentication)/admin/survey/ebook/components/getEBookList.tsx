import { getLibYearIDbyYear, getListEBookByLibYearId, getListEBookByID, getLanguageIdByListEBookId } from "@/data/fetchPrisma";
import { z } from "zod"
import { listEbookSchema } from "../data/schema"

const getSpecificEBookByYear = async (year: number) => {
    const libYearIDsByYear = await getLibYearIDbyYear(year);
    const outputArray: any[] = [];
    const LibraryYearIdArray: number[] = [];

    libYearIDsByYear?.forEach((object) => {
        LibraryYearIdArray.push(object.id);
    });

    if (LibraryYearIdArray.length === 0) return [];

    await Promise.all(
        LibraryYearIdArray.map(async (libraryYearId: number) => {
            const listEBookArrayByLibraryYearId = await getListEBookByLibYearId(libraryYearId);
            const listEbookIds = listEBookArrayByLibraryYearId?.map(item => item.listebook_id) || [];

            await Promise.all(listEbookIds.map(async (listEBookId: number) => {
                const listItem = await getListEBookByID(listEBookId);
                if (!listItem) return;

                const languageIDs = await getLanguageIdByListEBookId(listEBookId);
                const languageArray = languageIDs?.map(id => ({ language_id: id })) || [];

                outputArray.push({
                    id: listEBookId,
                    title: listItem.title,
                    sub_series_number: listItem.sub_series_number,
                    publisher: listItem.publisher,
                    description: listItem.description,
                    notes: listItem.notes,
                    updated_at: listItem.updated_at,
                    subtitle: listItem.subtitle,
                    cjk_title: listItem.cjk_title,
                    romanized_title: listItem.romanized_title,
                    data_source: listItem.data_source,
                    libraryyear: listItem.libraryyear,
                    is_global: listItem.is_global,
                    language: languageArray,
                });
            }));
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
    const data = await getSpecificEBookByYear(year);
    return z.array(listEbookSchema).parse(data || []);
}