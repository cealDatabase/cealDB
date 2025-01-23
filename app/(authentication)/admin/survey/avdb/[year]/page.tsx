import { GetAVList } from "../components/getAVList";
import { columns } from "../components/columns"
import { DataTable } from "../components/data-table"
import { Container } from "@/components/Container"
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonCard from "@/components/SkeletonCard";

async function AVSinglePage(yearPassIn: number) {
    const tasks = (await GetAVList(yearPassIn)).sort((a, b) => a.id - b.id);
    return <DataTable data={tasks} columns={columns} />;
}

export default async function AVListPage(
    props: {
        params: Promise<{ year: string }>;
    }
) {
    const params = await props.params;

    return (
        <main>
            <Container className="bg-white p-12">

                <div className="flex-1 flex-col p-8 md:flex">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">{params.year} Audio/Visual Database by Subscription</h2>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes next to each subscription your library has, for
                            each language Chinese, Japanese, Korean, and Non-CJK. Data in this
                            list is linked to Form 4: Holdings of Other Materials and Form 9:
                            Electronic Resources. If you subscribe to a subset of one of these
                            collections, click "customize", and then enter the appropriate counts
                            in each of the fields.
                        </p>
                    </div>
                    <SelectYear yearCurrent={params.year} />
                    <Suspense fallback={<SkeletonCard />}>
                        {AVSinglePage(Number(params.year))}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}