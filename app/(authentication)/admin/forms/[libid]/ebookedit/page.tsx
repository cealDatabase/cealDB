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
  
  // Parse year early so we can use it in error messages
  const year = sp.year ? Number(sp.year) : 2025;
  
  // Parse libid from URL params, but also check cookies for member users
  let libid: number;
  
  // Debug all cookies first
  const allCookies = cookieStore.getAll();
  
  // The cookie is named "library" not "libid"
  const libidFromCookie = cookieStore.get("library")?.value;
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
              <h2 className='text-2xl font-bold tracking-tight text-red-600'>
                Library ID Missing
              </h2>
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
            <h2 className='text-2xl font-bold tracking-tight text-red-600'>
              Invalid Library ID
            </h2>
            <p className='text-muted-foreground text-sm mt-2'>
              The library ID could not be determined. Please check your access permissions.
            </p>
          </div>
        </Container>
      </main>
    );
  }

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

    // Get all current E-Book subscriptions for this library and year with counts
    // At this point libraryYearRecord is guaranteed to exist (either found or created)
    const subscriptions = await db.libraryYear_ListEBook.findMany({
      where: { libraryyear_id: libraryYearRecord!.id },
      include: { 
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

    const subscribedEBooks = subscriptions.map((s) => s.List_EBook);
    
    // Filter out global records when library-specific versions exist
    // Group by unique identifier (title + publisher) to find duplicates
    const recordsByIdentifier = new Map<string, typeof subscribedEBooks[0][]>();
    
    subscribedEBooks.forEach((ebook) => {
      const identifier = `${ebook.title?.toLowerCase() || ''}_${ebook.publisher?.toLowerCase() || ''}`;
      if (!recordsByIdentifier.has(identifier)) {
        recordsByIdentifier.set(identifier, []);
      }
      recordsByIdentifier.get(identifier)!.push(ebook);
    });
    
    // For each group, prefer library-specific over global
    const filteredEBooks = Array.from(recordsByIdentifier.values()).map((group) => {
      // If there's a library-specific record (is_global = false), use that
      const librarySpecific = group.find(ebook => !ebook.is_global);
      return librarySpecific || group[0]; // fallback to first if all are global
    });
    
    // Filter original subscriptions to match filtered EBooks
    const filteredEBookIds = new Set(filteredEBooks.map(ebook => ebook.id));
    const filteredSubscriptions = subscriptions.filter(sub => 
      filteredEBookIds.has(sub.List_EBook.id)
    );
    
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
            <div className='mb-6 space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {libraryName} - E-Book Access Management
              </h1>
              <p className='text-lg text-gray-600'>
                Year: {year} • {filteredEBooks.length} subscription{filteredEBooks.length === 1 ? '' : 's'}
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
              />
            </Suspense>
          </div>
        </Container>
      </main>
    );
  }

  // When IDs are provided, show the subscription editor for adding new subscriptions
  console.log("🔍 DEBUG: IDs provided - showing E-Book subscription editor for", ids.length, "records");
  
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
              Year: {year} • Adding {data.length} new subscription{data.length === 1 ? '' : 's'}
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
