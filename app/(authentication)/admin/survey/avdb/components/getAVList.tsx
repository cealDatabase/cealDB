import { getAllAVLists, getAVListbyYear, getLanguageIdByListAvId, getListAVByID } from "@/data/fetchPrisma";
import { z } from "zod"
import { listAVSchema } from "../data/schema"

// Fetch specific AV records yy year. NOT inlucding global. NOT separated by language:
const getSpecificAVListByYear = async (year: number) => {
    const AVListByYear = await getAVListbyYear(year);
    const outputArray: any[] = [];
    const LibraryYearIdArray: number[] = [];
    AVListByYear?.map((object) => {
        LibraryYearIdArray.push(object.id);
    });

    if (LibraryYearIdArray.length !== 0) {
        await Promise.all(
            LibraryYearIdArray.map(async (libraryYearId: number) => {
                const listAVSingle = await getListAVByID(libraryYearId)
                const objectArray: object[] = [{ language_id: 0 }];
                if (listAVSingle) {
                    const newObject = {
                        id: listAVSingle.id,
                        title: listAVSingle.title,
                        cjk_title: listAVSingle.cjk_title,
                        romanized_title: listAVSingle.romanized_title,
                        subtitle: listAVSingle.subtitle,
                        type: listAVSingle.type?.toLowerCase().replace("/ ", "/"),
                        publisher: listAVSingle.publisher,
                        description: listAVSingle.description,
                        notes: listAVSingle.notes,
                        data_source: listAVSingle.data_source,
                        is_global: listAVSingle.is_global,
                        libraryyear: listAVSingle.libraryyear,
                        language: objectArray,
                    }
                    let languageID = await getLanguageIdByListAvId(listAVSingle.id)
                    languageID?.map(languageIDSingle => {
                        objectArray.push({ language_id: languageIDSingle })
                    })
                    outputArray.push(newObject)
                }
            })
        );
    }

    console.log(outputArray.at(-1));
    return Array.from(outputArray);
}

export async function GetAVList(year: number) {
    const AVListCompo = async () => {
        const special = await getSpecificAVListByYear(year);
        // Get all global AV records:
        const getGlobalAVRecords = await getAllAVLists();
        if (getGlobalAVRecords) {
            return special.concat(
                getGlobalAVRecords
                    .filter((object) => object.is_global)
                    .map((object) => ({
                        id: object.id,
                        type: object.type?.toLowerCase().replace("/ ", "/"),
                        title: object.title,
                        cjk_title: object.cjk_title,
                        romanized_title: object.romanized_title,
                        subtitle: object.subtitle,
                        publisher: object.publisher,
                        description: object.description,
                        notes: object.notes,
                        data_source: object.data_source,
                        is_global: object.is_global,
                        libraryyear: object.libraryyear,
                        language: object.List_AV_Language.map((lang) => ({
                            language_id: lang.language_id
                        }))
                    }))
            );
        }

        return []
    }

    const data = await AVListCompo();

    if (!data) {
        return [];
    }

    const singleString = JSON.stringify(data);

    const tasks = JSON.parse(singleString)
    // console.log(tasks)
    return z.array(listAVSchema).parse(tasks);
}