// app/(authentication)/admin/forms/[libid]/ebookedit/page.tsx
import { cookies } from "next/headers";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import EBookEditClient from "./EBookEditClient";
import { SubscriptionBreadcrumb } from "@/components/SubscriptionBreadcrumb";
import { getLibraryById } from "@/data/fetchPrisma";
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";
import { FallbackYearBanner } from "@/components/FallbackYearBanner";
import { getVisibleSurveyYear, canViewSurveyYearLists } from "@/lib/surveyVisibility";
import { resolveSubscriptionViewAccess } from "@/lib/memberSubscriptionAccess";

// Dynamic import for client component
const EBookSubscriptionManagementClient = dynamic(
  () => import('./EBookSubscriptionManagementClient'),
  { loading: () => <SkeletonTableCard /> }
);

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
                Your library ID cookie is missing or invalid. This is required to manage E-Book subscriptions.
              </p>
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="text-sm font-medium mb-2">Debug Information:</p>
                <p className="text-xs">URL libid: {libidStr}</p>
                <p className="text-xs">Cookie libid: {libidFromCookie || "Not found"}</p>
                <p className="text-xs">Available cookies: {allCookies.length > 0 ? allCookies.map(c => c.name).join(", ") : "None"}</p>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Quick Fixes:</p>
                <a 
                  href="/debug-cookies"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm mr-2"
                >
                  Set Cookies
                </a>
                <a 
                  href={`/admin/forms/56/ebookedit${sp.ids ? `?ids=${sp.ids}&year=${year}` : ''}`}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Try with Library 56
                </a>
              </div>
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
    console.log("🔍 DEBUG: No valid IDs detected, forcing VIEW mode");
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
    console.log("🔍 DEBUG: No IDs provided - showing all current E-Book subscriptions for library", libid);
    
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

    // Get current E-Book subscriptions selected by the user (is_selected=true
    // OR a custom_count override has been entered).
    const subscriptions = await db.libraryYear_ListEBook.findMany({
      where: {
        libraryyear_id: libraryYearRecord!.id,
        OR: [
          { is_selected: true },
          { custom_count: { not: null } },
        ],
      },
      select: {
        libraryyear_id: true,
        listebook_id: true,
        is_selected: true,
        custom_count: true,
        List_EBook: {
          include: {
            List_EBook_Counts: {
              where: { year },
              select: { titles: true, volumes: true, chapters: true }
            },
            List_EBook_Language: {
              select: { Language: { select: { short: true } } }
            }
          }
        } 
      },
    });

    // Every role sees the shared catalogue and entries created by the current
    // institution. The latter is determined by Library_Year, never by other
    // institutions' selection rows.
    const listedEBookIds = new Set(subscriptions.map((sub) => sub.listebook_id));
    const catalogueEBooks = await db.list_EBook.findMany({
          where: {
            OR: [
              { is_global: true },
              { is_global: false, libraryyear: libraryYearRecord!.id },
            ],
            List_EBook_Counts: { some: { year, ishidden: false } },
          },
          include: {
            List_EBook_Counts: {
              where: { year },
              select: { titles: true, volumes: true, chapters: true },
            },
            List_EBook_Language: {
              select: { Language: { select: { short: true } } },
            },
          },
        });
    const visibleSubscriptions = [
      ...subscriptions,
      ...catalogueEBooks
        .filter((ebook) => !listedEBookIds.has(ebook.id))
        .map((ebook) => ({
          libraryyear_id: libraryYearRecord!.id,
          listebook_id: ebook.id,
          is_selected: false,
          custom_count: null,
          List_EBook: ebook,
        })),
    ];
    // Keep global and institution-created rows distinct even if they share a
    // title. A member sees no source marker; privileged roles retain actions.
    const filteredSubscriptions = visibleSubscriptions;
    const filteredEBooks = filteredSubscriptions.map((sub) => sub.List_EBook);
    
    if (filteredEBooks.length === 0) {
      return (
        <main>
          <Container className='bg-white pb-12 max-w-full'>
            <div className='px-8 pt-4'>
              <SubscriptionBreadcrumb 
                surveyType="ebook" 
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
                    {libraryName} - E-Book Access Management
                  </h2>
                  <p className='text-lg text-gray-600'>
                    Year: {year}
                  </p>
                </div>
                <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                  <p className='text-sm font-medium text-yellow-800'>
                    No E-Book subscriptions found for this library and year. Go to the survey page to add subscriptions.
                  </p>
                </div>
                <div className="mt-4">
                  <a 
                    href={`/admin/survey/ebook/${year}`}
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
              surveyType="ebook" 
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
                {libraryName} - E-Book Access Management
              </h1>
              <p className='text-lg text-gray-600'>
                Year: {year} • {filteredEBooks.length} access
              </p>
            </div>

            <Suspense fallback={<SkeletonTableCard />}> 
              <EBookSubscriptionManagementClient 
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
  
  const rows = await db.list_EBook.findMany({
    where: { id: { in: ids } }
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title ?? "",
    subtitle: r.subtitle ?? "",
    cjk_title: r.cjk_title ?? "",
    romanized_title: r.romanized_title ?? "",
    description: r.description ?? "",
    notes: r.notes ?? "",
    sub_series_number: r.sub_series_number ?? "",
    publisher: r.publisher ?? "",
    data_source: r.data_source ?? "",
    is_global: !!r.is_global,
    updated_at: r.updated_at.toISOString(),
  }));

  return (
    <main>
      <Container className='bg-white pb-12 max-w-full'>
        <div className='px-8 pt-4'>
          <SubscriptionBreadcrumb 
            surveyType="ebook" 
            year={year} 
            libraryName={libraryName}
            mode="add"
          />
        </div>
        <div className='flex-1 flex-col px-8 pb-4 md:flex'>
          <div className='mb-6 space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Add E-Book Subscriptions - {libraryName}
            </h1>
            <p className='text-lg text-gray-600'>
              Year: {year} • Adding {data.length} new access
            </p>
          </div>
          <EBookEditClient 
            rows={data}
            libid={libid}
            year={year}
          />
        </div>
      </Container>
    </main>
  );
}
