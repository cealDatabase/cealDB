import { getAVListIdByLanguageId, getAVListByAVId, getAllAVList } from "@/data/fetchPrisma"
import { z } from "zod"

import { listAVSchema } from "./data/schema"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Container } from "@/components/Container"
import { SingleListAVLanguageType } from "@/types/types"




// Simulate a database read for tasks.
async function getTasks() {

    // Separate by Language:

    // type shorten_List_AV_Type = {
    //     id: number;
    //     title: string;
    //     cjk_title: string;
    //     romanized_title: string;
    //     subtitle: string;
    //     type: string;
    //     publisher: string;
    //     description: string;
    //     notes: string;
    //     data_source: string;
    //     is_global: boolean;
    //     libraryyear: number;
    //     List_AV_Language: SingleListAVLanguageType;
    // }

    // const AVListCompo = async ({ languageId }: { languageId: number }) => {
    //     const avIdlist = await getAVListIdByLanguageId(languageId);
    //     if (!avIdlist) {
    //         return [];
    //     }
    //     const avLists = await Promise.all(avIdlist.map(async (object) => {
    //         const avlist = await getAVListByAVId(object.listav_id);
    //         return avlist as unknown as shorten_List_AV_Type[];
    //     }));
    //     return avLists.flat();
    // }

    // const data = await AVListCompo({ languageId: 1 });
    // if (!data) {
    //     return [];
    // }
    // End


    // Fetch all. NOT separated by language:
    const AVListCompo = async () => {
        const allAVRecords = await getAllAVList();
        return allAVRecords?.flat()
    }

    const data = await AVListCompo();
    if (!data) {
        return [];
    }
    // End


    // The following is the same for both cases:
    data.map((object) => {
        // console.log(object.List_AV_Language[0]);
    });

    const singleString = JSON.stringify(data);

    const tasks = JSON.parse(singleString)
    return z.array(listAVSchema).parse(tasks)
}

export default async function TaskPage() {
    const tasks = await getTasks()

    return (
        <main>
            <Container className="bg-white p-12">
                <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">2024 Audio/Visual Database by Subscription</h2>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes next to each subscription your library has, for
                            each language Chinese, Japanese, Korean, and Non-CJK. Data in this
                            list is linked to Form 4: Holdings of Other Materials and Form 9:
                            Electronic Resources. If you subscribe to a subset of one of these
                            collections, click "customize", and then enter the appropriate counts
                            in each of the fields.
                        </p>
                    </div>
                    <DataTable data={tasks} columns={columns} />
                </div>
            </Container>
        </main>
    )
}