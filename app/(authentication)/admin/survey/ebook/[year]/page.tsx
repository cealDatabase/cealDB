import { GetEBookList } from "../components/getEBookList";
import { columns } from "../components/columns"
import { DataTable } from "../components/data-table"
import { Container } from "@/components/Container"
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";

async function EbookSinglePage(yearPassIn: number) {
    const tasks = (await GetEBookList(yearPassIn)).sort((a, b) => a.id - b.id);
    return <DataTable data={tasks} columns={columns} />;
}

export default async function EbookListPage(
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
                        <h2 className="text-2xl font-bold tracking-tight">E-Book Database by Subscription - {params.year}</h2>
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
                    <Suspense fallback={<SkeletonTableCard />}>
                        {EbookSinglePage(Number(params.year))}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}