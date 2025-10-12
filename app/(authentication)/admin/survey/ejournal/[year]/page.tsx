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
    libid?: number,
    userRoles?: string[] | null,
    initialSearch?: string,
    newRecordId?: number
) {
    const tasks = (await GetEJournalList(yearPassIn)).sort((a, b) => a.id - b.id);
    return (
        <EJournalDataTableClient
            data={tasks}
            year={yearPassIn}
            roleIdPassIn={roleIdPassIn}
            libid={libid}
            userRoles={userRoles}
            initialSearch={initialSearch}
            newRecordId={newRecordId}
        />
    );
}

export default async function EJournalListPage(
    props: {
        params: Promise<{ year: string }>;
        searchParams?: Promise<{ libid?: string; search?: string; newRecord?: string }>;
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
    
    // Get newRecord ID for pagination calculation
    const newRecordId = sp.newRecord ? Number(sp.newRecord) : undefined;

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
                <SurveyBreadcrumb surveyType="ejournal" year={params.year} />
                <div className="flex-1 flex-col px-8 py-4 md:flex">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-start">
                            E-Journal Databases - {params.year}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Please check the boxes for each entry your institution holds under each language category Chinese, Japanese, Korean, and Non-CJK.
                            Data in this list are linked to “My Forms.”
                            If your institution holds a customized collection or a subset of certain resources,
                            edit the relevant data after clicking &quot;Add to My Subscription&quot;.
                        </p>
                    </div>
                    <SelectYear yearCurrent={params.year} />
                    <Suspense fallback={<SkeletonTableCard />}>
                        {await EJournalSinglePage(Number(params.year), roleId, libid, userRoles, initialSearch, newRecordId)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}