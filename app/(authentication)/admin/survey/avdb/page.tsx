import { cookies } from "next/headers";
import { getAllAVLists, getAVListbyYear } from "@/data/fetchPrisma";
import { z } from "zod"

import { listAVSchema } from "./data/schema"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Container } from "@/components/Container"
import { Suspense } from "react";
import SkeletonCard from "@/components/SkeletonCard";

async function getAVList(year: number) {
    // Fetch specific AV records yy year. NOT inlucding global. NOT separated by language:
    const getSpecificAVListByYear = async (year: number) => {
        const output = await getAVListbyYear(year);
        const outputSet = new Set();
        output?.map((object) => {
            object.List_AV.map((av) => {
                outputSet.add(av)
            }
            );
        });
        return Array.from(outputSet);
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
                        // List_AV_Language: object.List_AV_Language.map((lang) => ({
                        //     listav_id: lang.listav_id,
                        //     language_id: lang.language_id
                        // }))
                    }))
            );
        }

        return []
    }

    const data = await AVListCompo();
    console.log("data length: " + data.length);
    if (!data) {
        return [];
    }

    const singleString = JSON.stringify(data);

    const tasks = JSON.parse(singleString)
    return z.array(listAVSchema).parse(tasks);
}

export default async function AVListPage() {
    const selectYear = 2021;
    // const getLibIdFromCookie = cookies().get("library")?.value;
    const tasks = (await getAVList(selectYear)).sort((a, b) => a.id - b.id);


    return (
        <main>
            <Container className="bg-white p-12">
                <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">{selectYear} Audio/Visual Database by Subscription</h2>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes next to each subscription your library has, for
                            each language Chinese, Japanese, Korean, and Non-CJK. Data in this
                            list is linked to Form 4: Holdings of Other Materials and Form 9:
                            Electronic Resources. If you subscribe to a subset of one of these
                            collections, click "customize", and then enter the appropriate counts
                            in each of the fields.
                        </p>
                    </div>
                    <Suspense fallback={<SkeletonCard />}>
                        <DataTable data={tasks} columns={columns} />
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}