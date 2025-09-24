import { cookies } from "next/headers";
import { GetEBookList } from "../components/getEBookList";
import EBookDataTableClient from "../components/ebDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

async function EbookSinglePage(yearPassIn: number, roleIdPassIn: string | undefined) {
    const tasks = (await GetEBookList(yearPassIn)).sort((a, b) => a.id - b.id);
    return <EBookDataTableClient data={tasks} year={yearPassIn} roleIdPassIn={roleIdPassIn} />;
}

export default async function EbookListPage(
    props: {
        params: Promise<{ year: string }>;
    }
) {
    const params = await props.params;
    const cookieStore = await cookies();
    const roleId = cookieStore.get("role")?.value;
    console.log("roleId", roleId);

    return (
        <main>
            <Container className="bg-white pb-12 max-w-full">
                <SurveyBreadcrumb surveyType="ebook" year={params.year} />
                <div className="flex-1 flex-col px-8 py-4 md:flex">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-start">
                            E-Book Database by Subscription - {params.year}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes next to each subscription your library has, for
                            each language Chinese, Japanese, Korean, and Non-CJK. Data in this
                            list is linked to Form 4: Holdings of Other Materials and Form 9:
                            Electronic Resources. If you subscribe to a subset of one of these
                            collections, click &quot;customize&quot;, and then enter the appropriate counts
                            in each of the fields.
                        </p>
                    </div>
                    <SelectYear yearCurrent={params.year} />
                    <Suspense fallback={<SkeletonTableCard />}>
                        {await EbookSinglePage(Number(params.year), roleId)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}