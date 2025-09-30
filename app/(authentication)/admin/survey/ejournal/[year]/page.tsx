import { cookies } from "next/headers";
import { GetEJournalList } from "../components/getEJournalList";
import EJournalDataTableClient from "../components/ejDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

async function EJournalSinglePage(
  yearPassIn: number,
  roleIdPassIn: string | undefined,
  libid?: number
) {
    const tasks = (await GetEJournalList(yearPassIn)).sort((a, b) => a.id - b.id);
    return (
      <EJournalDataTableClient
        data={tasks}
        year={yearPassIn}
        roleIdPassIn={roleIdPassIn}
        libid={libid}
      />
    );
}

export default async function EJournalListPage(
    props: {
        params: Promise<{ year: string }>;
        searchParams?: Promise<{ libid?: string }>;
    }
) {
    const params = await props.params;
    const sp = (await props.searchParams) ?? {};
    
    const cookieStore = await cookies();
    const roleId = cookieStore.get("role")?.value;
    
    // Prefer libid from query (?libid=56); fall back to cookie if available
    const libidFromQuery = sp.libid ? Number(sp.libid) : undefined;
    const libidFromCookie = cookieStore.get("libid")?.value
        ? Number(cookieStore.get("libid")!.value)
        : undefined;
    
    const libid = libidFromQuery ?? libidFromCookie;
    
    console.log("roleId", roleId);

    return (
        <main>
            <Container className="bg-white pb-12 max-w-full">
                <SurveyBreadcrumb surveyType="ejournal" year={params.year} />
                <div className="flex-1 flex-col px-8 py-4 md:flex">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-start">
                            E-Journal Database by Subscription - {params.year}
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
                        {await EJournalSinglePage(Number(params.year), roleId, libid)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}