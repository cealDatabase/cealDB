import { cookies } from "next/headers";
import { GetEBookList } from "../components/getEBookList";
import EBookDataTableClient from "../components/ebDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";

async function EbookSinglePage(
    yearPassIn: number,
    roleIdPassIn: string | undefined,
    libid?: number,
    userRoles?: string[] | null,
    initialSearch?: string
) {
    const tasks = (await GetEBookList(yearPassIn)).sort((a, b) => a.id - b.id);
    return (
        <EBookDataTableClient
            data={tasks}
            year={yearPassIn}
            roleIdPassIn={roleIdPassIn}
            libid={libid}
            userRoles={userRoles}
            initialSearch={initialSearch}
        />
    );
}

export default async function EbookListPage(
    props: {
        params: Promise<{ year: string }>;
        searchParams?: Promise<{ libid?: string; search?: string }>;
    }
) {
    const params = await props.params;
    const sp = (await props.searchParams) ?? {};

    const cookieStore = await cookies();
    const roleId = cookieStore.get("role")?.value;

    // Prefer libid from query (?libid=56); fall back to cookie if available
    const libidFromQuery = sp.libid ? Number(sp.libid) : undefined;
    const libidFromCookie = cookieStore.get("library")?.value
        ? Number(cookieStore.get("library")!.value)
        : undefined;

    const libid = libidFromQuery ?? libidFromCookie;
    
    // Get search parameter from URL (for highlighting newly created/edited records)
    const initialSearch = sp.search ? decodeURIComponent(sp.search) : undefined;

    // Parse user roles for permission checking
    let userRoles: string[] | null = null;
    if (roleId) {
        try {
            // Role cookie can be JSON array or single value
            userRoles = roleId.startsWith('[') ? JSON.parse(roleId) : [roleId];
        } catch (error) {
            console.error('Error parsing role cookie:', error);
        }
    }

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
                        {await EbookSinglePage(Number(params.year), roleId, libid, userRoles, initialSearch)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}