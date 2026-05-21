import { cookies } from "next/headers";
import { GetAVList, GetAVListWithUserSelections } from "../components/getAVList";
import AVDataTableClient from "../components/avDataTableClient";
import { Container } from "@/components/Container";
import SelectYear from "../components/selectYear";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { SurveyBreadcrumb } from "@/components/SurveyBreadcrumb";
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";
import { FallbackYearBanner } from "@/components/FallbackYearBanner";
import db from "@/lib/db";

// Force dynamic rendering - disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Helper to render the client table */
async function AVSinglePage(
  yearPassIn: number,
  roleIdPassIn: string | undefined,
  libid?: number,
  userRoles?: string[] | null,
  initialSearch?: string,
  newRecordId?: number
) {
  // Use GetAVListWithUserSelections if libid is available, otherwise fallback to GetAVList
  const tasks = libid 
    ? (await GetAVListWithUserSelections(yearPassIn, libid)).sort((a, b) => a.id - b.id)
    : (await GetAVList(yearPassIn)).sort((a, b) => a.id - b.id);

  // Fetch survey gate status for this library_year so we can disable
  // editing for non-super-admins when the survey is closed.
  let isOpenForEditing = true;
  if (libid) {
    const ly = await db.library_Year.findFirst({
      where: { library: libid, year: yearPassIn },
      select: { is_open_for_editing: true },
    });
    isOpenForEditing = ly?.is_open_for_editing ?? false;
  }

  return (
    <AVDataTableClient
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

export default async function AVListPage(props: {
  params: Promise<{ year: string }>;
  searchParams?: Promise<{ libid?: string; search?: string; newRecord?: string }>; // 👈 add newRecord parameter
}) {
  const params = await props.params;
  const sp = (await props.searchParams) ?? {};

  const cookieStore = await cookies();
  const roleId = cookieStore.get("role")?.value;

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

  return (
    <main>
      <Container className='bg-white pb-12 max-w-full'>
        <SurveyBreadcrumb surveyType="avdb" year={params.year} libid={libid} />
        <div className='flex-1 flex-col px-8 py-4 md:flex'>
          <InstitutionSwitcher currentYear={Number(params.year)} />
          <FallbackYearBanner year={Number(params.year)} className="mb-4" />
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Audio/Visual Databases - {params.year}
            </h1>
            <p className='text-muted-foreground'>
              Please check the boxes for each entry your institution holds under each language category Chinese, Japanese, Korean, and Non-CJK.
              Data in this list are linked to "My Forms."
              If your institution holds a customized collection or a subset of certain resources,
              edit the relevant data after clicking &quot;Add to My Access&quot;.
            </p>
          </div>
          <SelectYear yearCurrent={params.year} />
          <Suspense fallback={<SkeletonTableCard />}>
            {await AVSinglePage(Number(params.year), roleId, libid, userRoles, initialSearch, newRecordId)}
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
