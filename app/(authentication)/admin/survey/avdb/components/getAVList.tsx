import { getAllAVLists, getAVListbyYear, getLanguageIdByListAvId } from "@/data/fetchPrisma";
import { z } from "zod"

import { listAVSchema } from "../data/schema"

export async function GetAVList(year: number) {
    // Fetch specific AV records yy year. NOT inlucding global. NOT separated by language:
    const getSpecificAVListByYear = async (year: number) => {
        const output = await getAVListbyYear(year);
        const outputArray = new Array();
        output?.map((object) => {
            object.List_AV.map((av) => {
                outputArray.concat(av)
            })
        });
        if (outputArray.length !== 0) {
            await Promise.all(
                outputArray.map(async (object) => {
                    const languageId = await getLanguageIdByListAvId(object.id);
                    object.language_id = languageId;
                })
            );
        }
        return Array.from(outputArray);
    }

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
                        updated_at: object.updated_at,
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
    // console.log("data length: " + data.length);
    data.map((object) => {  
        // console.log("language " + object.language.map((lang: { language_id: number; }) => lang.language_id));
    });

    if (!data) {
        return [];
    }

    const singleString = JSON.stringify(data);

    const tasks = JSON.parse(singleString)
    return z.array(listAVSchema).parse(tasks);
}