// app/(authentication)/admin/forms/[libid]/avdbedit/page.tsx
import { cookies } from "next/headers";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import AvdbEditClient from "./AvdbEditClient";
import { Container } from "@/components/Container";
import AVDataTableClient from "@/app/(authentication)/admin/survey/avdb/components/avDataTableClient";
import { GetAVList } from "@/app/(authentication)/admin/survey/avdb/components/getAVList";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { SubscriptionBreadcrumb } from "@/components/SubscriptionBreadcrumb";
import { getLibraryById } from "@/data/fetchPrisma";
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";
import { FallbackYearBanner } from "@/components/FallbackYearBanner";
import { getVisibleSurveyYear, canViewSurveyYearLists } from "@/lib/surveyVisibility";
import { resolveSubscriptionViewAccess } from "@/lib/memberSubscriptionAccess";

// Dynamic import for client component
const SubscriptionManagementClient = dynamic(() => import('./SubscriptionManagementClient'), {
  loading: () => <SkeletonTableCard />,
});

type PageProps = {
  // 👇 in Next 15 these are async
  params: Promise<{ libid: string }>;
  searchParams: Promise<{ ids?: string; year?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  // ✅ await both before accessing properties
  const { libid: libidStr } = await params;
  const sp = await searchParams;

  const cookieStore = await cookies();
  
  // Parse year: prefer URL param, otherwise use the centralized SurveySession year
  // Members must not reach a year whose collection window has not opened yet:
  // scheduling next year creates its Library_Year rows and SurveySession up
  // front, so the lists exist well before anyone should be filling them in.
  // Super admins and editors do review them early, so the gate is on members.
  let year = sp.year ? Number(sp.year) : await getVisibleSurveyYear();
  
  // Parse libid from URL params, but also check cookies for member users
  let libid: number;
  
  // Debug all cookies first
  const allCookies = cookieStore.getAll();
  
  // Get effective library ID: observe_library if exists (viewing another library), otherwise library (home library)
  const observeLibrary = cookieStore.get("observe_library")?.value;
  const homeLibrary = cookieStore.get("library")?.value;
  const libidFromCookie = observeLibrary || homeLibrary;
  const roleFromCookie = cookieStore.get("role")?.value;
  
  // If libidStr is "member" or not a valid number, get libid from cookies
  if (libidStr === "member" || isNaN(Number(libidStr))) {
    if (libidFromCookie && !isNaN(Number(libidFromCookie))) {
      libid = Number(libidFromCookie);
    } else {
      console.error("No valid libid found in cookies. Available cookies:", allCookies);
      return (
        <main>
          <Container className='bg-white p-12 max-w-full'>
            <div className='flex-1 flex-col p-8 md:flex'>
              <h1 className='text-2xl font-bold tracking-tight text-red-600'>
                Library ID Missing
              </h1>
              <p className='text-muted-foreground text-sm mt-2'>
                Please sign in first. This is required to manage subscriptions.
              </p>
            </div>
          </Container>
        </main>
      );
    }
  } else {
    libid = Number(libidStr);
  }
  
  // Fix: Handle empty string and undefined properly
  const idsParam = sp.ids;
  let ids: number[] = [];
  
  if (idsParam && idsParam.trim() !== "") {
    ids = idsParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  }
  
  // TEMPORARY: Force VIEW mode to troubleshoot the issue
  // Override ids to be empty to force subscription management view
  if (!sp.ids || sp.ids.trim() === "") {
    ids = []; // Ensure empty array for VIEW mode
  }

  // Final validation
  if (!libid || isNaN(libid)) {
    console.error("Invalid libid after processing:", libid);
    return (
      <main>
        <Container className='bg-white p-12 max-w-full'>
          <div className='flex-1 flex-col p-8 md:flex'>
            <h1 className='text-2xl font-bold tracking-tight text-red-600'>
              Invalid Library ID
            </h1>
            <p className='text-muted-foreground text-sm mt-2'>
              The library ID could not be determined. Please check your access permissions.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  // The URL and the role/library cookies are only navigation hints. Resolve
  // the actual institution and year from the signed session before reading
  // any subscription data.
  const access = await resolveSubscriptionViewAccess(
    libid,
    sp.year ? Number(sp.year) : undefined,
  );
  if (!access) notFound();
  libid = access.libraryId;
  year = access.year;
  if (!(await canViewSurveyYearLists(year))) notFound();
  if (access.isMemberRestricted) ids = [];

  // Fetch library information for display
  const library = await getLibraryById(libid);
  const libraryName = library?.library_name || `Library ${libid}`;

  // If no ids are provided, show all current subscriptions for this library with delete functionality
  if (ids.length === 0) {
    
    // Find or create Library_Year record
    let libraryYearRecord = await db.library_Year.findFirst({
      where: { library: libid, year: year }
    });
    
    if (!libraryYearRecord) {
      libraryYearRecord = await db.library_Year.create({
        data: {
          library: libid,
          year: year,
          updated_at: new Date(),
          is_open_for_editing: true,
          is_active: true,
        },
      });
    }

    // Get all current subscriptions for this library and year with counts.
    // Junction table provides per-library state (is_selected, custom_count);
    // List_AV_Counts provides the global title count fallback.
    // Filter to only show items the user actually selected in the survey
    // (is_selected=true OR has a custom_count).
    const subscriptions = await db.libraryYear_ListAV.findMany({
      where: {
        libraryyear_id: libraryYearRecord!.id,
        OR: [
          { is_selected: true },
          { custom_count: { not: null } },
        ],
      },
      select: {
        libraryyear_id: true,
        listav_id: true,
        is_selected: true,
        custom_count: true,
        List_AV: {
          include: {
            List_AV_Counts: {
              where: { year },
              select: { titles: true }
            },
            List_AV_Language: {
              select: { Language: { select: { short: true } } }
            }
          }
        } 
      },
    });

    // Every role sees the shared catalogue and entries created by the current
    // institution. The latter is determined by Library_Year, never by other
    // institutions' selection rows.
    const listedAVIds = new Set(subscriptions.map((sub) => sub.listav_id));
    const catalogueAVs = await db.list_AV.findMany({
          where: {
            OR: [
              { is_global: true },
              { is_global: false, libraryyear: libraryYearRecord!.id },
            ],
            List_AV_Counts: { some: { year, ishidden: false } },
          },
          include: {
            List_AV_Counts: { where: { year }, select: { titles: true } },
            List_AV_Language: {
              select: { Language: { select: { short: true } } },
            },
          },
        });
    const visibleSubscriptions = [
      ...subscriptions,
      ...catalogueAVs
        .filter((av) => !listedAVIds.has(av.id))
        .map((av) => ({
          libraryyear_id: libraryYearRecord!.id,
          listav_id: av.id,
          is_selected: false,
          custom_count: null,
          List_AV: av,
        })),
    ];
    // Keep global and institution-created rows distinct even if they share a
    // title. A member sees no source marker; privileged roles retain actions.
    const filteredSubscriptions = visibleSubscriptions;
    const filteredAVs = filteredSubscriptions.map((sub) => sub.List_AV);
    
    if (filteredAVs.length === 0) {
      return (
        <main>
          <Container className='bg-white pb-12 max-w-full'>
            <div className='px-8 pt-4'>
              <SubscriptionBreadcrumb 
                surveyType="avdb" 
                year={year} 
                libraryName={libraryName}
                mode="view"
              />
            </div>
            <div className='flex-1 flex-col px-8 pb-4 md:flex'>
              <InstitutionSwitcher currentYear={year} />
              <FallbackYearBanner year={year} className="mb-4" />
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h2 className='text-3xl font-bold tracking-tight'>
                    {libraryName} - AV Access Management
                  </h2>
                  <p className='text-lg text-gray-600'>
                    Year: {year}
                  </p>
                </div>
                <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                  <p className='text-sm font-medium text-yellow-800'>
                    No AV subscriptions found for this library and year. Go to the survey page to add subscriptions.
                  </p>
                </div>
                <div className="mt-4">
                  <a 
                    href={`/admin/survey/avdb/${year}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Survey Page to Add Subscriptions
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </main>
      );
    }

    
    return (
      <main>
        <Container className='bg-white pb-12 max-w-full'>
          <div className='px-8 pt-4'>
            <SubscriptionBreadcrumb 
              surveyType="avdb" 
              year={year} 
              libraryName={libraryName}
              mode="view"
            />
          </div>
          <div className='flex-1 flex-col px-8 pb-4 md:flex'>
            <InstitutionSwitcher currentYear={year} />
            <FallbackYearBanner year={year} className="mb-4" />
            <div className='mb-6 space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {libraryName} - AV Access Management
              </h1>
              <p className='text-lg text-gray-600'>
                Year: {year} • {filteredAVs.length} access
              </p>
            </div>

            <Suspense fallback={<SkeletonTableCard />}> 
              <SubscriptionManagementClient 
                subscriptions={filteredSubscriptions}
                libid={libid}
                year={year}
                mode="view"
                libraryName={libraryName}
                roleId={roleFromCookie}
                readOnly={access.isMemberRestricted}
              />
            </Suspense>
          </div>
        </Container>
      </main>
    );
  }

  // When IDs are provided, show the subscription editor for adding new subscriptions
  
  const rows = await db.list_AV.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      subtitle: true,
      cjk_title: true,
      romanized_title: true,
      description: true,
      notes: true,
      publisher: true,
      data_source: true,
      type: true,
      is_global: true,
      updated_at: true,
      List_AV_Counts: { where: { year }, select: { titles: true }, take: 1 },
      List_AV_Language: { select: { Language: { select: { short: true } } } },
    },
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title ?? "",
    subtitle: r.subtitle ?? "",
    cjk_title: r.cjk_title ?? "",
    romanized_title: r.romanized_title ?? "",
    description: r.description ?? "",
    notes: r.notes ?? "",
    publisher: r.publisher ?? "",
    data_source: r.data_source ?? "",
    type: r.type ?? "",
    counts: r.List_AV_Counts[0]?.titles ?? 0,
    language: r.List_AV_Language.map((x) => x.Language?.short).filter(
      Boolean
    ) as string[],
    is_global: !!r.is_global,
    subscribers: [], // satisfy listAV shape used by columns
    updated_at: r.updated_at.toISOString(),
  }));

  return (
    <main>
      <Container className='bg-white pb-12 max-w-full'>
        <div className='px-8 pt-4'>
          <SubscriptionBreadcrumb 
            surveyType="avdb" 
            year={year} 
            libraryName={libraryName}
            mode="add"
          />
        </div>
        <div className='flex-1 flex-col px-8 pb-4 md:flex'>
          <div className='mb-6 space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Add AV Subscriptions - {libraryName}
            </h1>
            <p className='text-lg text-gray-600'>
              Year: {year} • Adding {data.length} new access
            </p>
          </div>
          <AvdbEditClient rows={data} libid={libid} year={year} />
        </div>
      </Container>
    </main>
  );
}
