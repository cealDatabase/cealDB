import { cookies } from "next/headers";
import { GetEBookList, GetEBookListWithUserSelections } from "../components/getEBookList";
import EBookDataTableClient from "../components/ebDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";
import db from "@/lib/db";

async function EbookSinglePage(
    yearPassIn: number,
    roleIdPassIn: string | undefined,
    libid?: number,
    userRoles?: string[] | null,
    initialSearch?: string,
    newRecordId?: number
) {
    // Use GetEBookListWithUserSelections if libid is available, otherwise fallback to GetEBookList
    const tasks = libid
        ? (await GetEBookListWithUserSelections(yearPassIn, libid)).sort((a, b) => a.id - b.id)
        : (await GetEBookList(yearPassIn)).sort((a, b) => a.id - b.id);

    let isOpenForEditing = true;
    if (libid) {
        const ly = await db.library_Year.findFirst({
            where: { library: libid, year: yearPassIn },
            select: { is_open_for_editing: true },
        });
        isOpenForEditing = ly?.is_open_for_editing ?? false;
    }

    return (
        <EBookDataTableClient
            data={tasks}
            year={yearPassIn}
            roleIdPassIn={roleIdPassIn}
            libid={libid}
            userRoles={userRoles}
            initialSearch={initialSearch}
            newRecordId={newRecordId}
            isOpenForEditing={isOpenForEditing}
        />
    );
}

export default async function EbookListPage(
    props: {
        params: Promise<{ year: string }>;
        searchParams?: Promise<{ libid?: string; search?: string; newRecord?: string }>;
    }
) {
    const params = await props.params;
    const sp = (await props.searchParams) ?? {};

    const cookieStore = await cookies();
    const roleId = cookieStore.get("role")?.value;

    // Resolve effective libid for impersonation support.
    // Priority: observe_library cookie (super admin impersonating) > ?libid= query > home library cookie.
    const libidFromQuery = sp.libid ? Number(sp.libid) : undefined;
    const observeLibrary = cookieStore.get("observe_library")?.value;
    const libidFromObserve = observeLibrary && !isNaN(Number(observeLibrary))
        ? Number(observeLibrary)
        : undefined;
    const libidFromCookie = cookieStore.get("library")?.value
        ? Number(cookieStore.get("library")!.value)
        : undefined;

    const libid = libidFromObserve ?? libidFromQuery ?? libidFromCookie;
    
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
                <SurveyBreadcrumb surveyType="ebook" year={params.year} libid={libid} />
                <div className="flex-1 flex-col px-8 py-4 md:flex">
                    <InstitutionSwitcher currentYear={Number(params.year)} />
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            E-Book Databases - {params.year}
                        </h1>
                        <p className="text-muted-foreground">
                            Please check the boxes for each entry your institution holds under each language category Chinese, Japanese, Korean, and Non-CJK. 
                            Data in this list are linked to "My Forms."
                            If your institution holds a customized collection or a subset of certain resources,
                            edit the relevant data after clicking &quot;Add to My Access&quot;.
                        </p>
                    </div>
                    <SelectYear yearCurrent={params.year} />
                    <Suspense fallback={<SkeletonTableCard />}>
                        {await EbookSinglePage(Number(params.year), roleId, libid, userRoles, initialSearch, newRecordId)}
                    </Suspense>
                </div>
            </Container>
        </main>
    )
}