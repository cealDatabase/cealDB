import { cookies } from "next/headers";
import { getLibYearByLibIdAndYear, getAVListByLibraryYear, getAllAVLists, getLibraryById } from "@/data/fetchPrisma"
import { z } from "zod"

import { listAVSchema } from "./data/schema"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Container } from "@/components/Container"

async function getAVList(libId: number, year: number) {

    // Fetch all. By Library Year ID. NOT separated by language:
    const getLibYear = async (libId: number, year: number) => {
        const output = await getLibYearByLibIdAndYear(libId, year);
        return output ? (output[0]?.id as number) : undefined;
    }

    const AVListCompo = async () => {
        const libYearId = await getLibYear(libId, year);
        if (!libYearId) {
            return [];
        }
        const getAVRecordsByLibYearId = await getAVListByLibraryYear(libYearId);
        const getGlobalAVRecords = await getAllAVLists();
        if (getGlobalAVRecords) {
            getGlobalAVRecords.map((object) => {
                if (object.is_global)
                    getAVRecordsByLibYearId?.push(object);
            });
        }

        return getAVRecordsByLibYearId?.flat()
    }

    const data = await AVListCompo();
    if (!data) {
        return [];
    }

    // data.map((object) => {
    //     object.List_AV_Language.map((language) => {
    //         console.log(language);
    //     })
    // });

    const singleString = JSON.stringify(data);

    const tasks = JSON.parse(singleString)
    return z.array(listAVSchema).parse(tasks)
}

export default async function AVListPage() {
    const getLibIdFromCookie = cookies().get("library")?.value;
    const tasks = await getAVList(Number(getLibIdFromCookie), 2016)
    const libName = await getLibraryById(Number(getLibIdFromCookie));

    return (
        <main>
            <Container className="bg-white p-12">
                <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                    <div className="space-y-2">
                        <h2>{libName?.library_name}</h2>
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