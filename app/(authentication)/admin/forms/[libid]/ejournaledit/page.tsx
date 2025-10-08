// app/(authentication)/admin/forms/[libid]/ejournaledit/page.tsx
import { cookies } from "next/headers";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import EJournalEditClient from "./EJournalEditClient";
import { SubscriptionBreadcrumb } from "@/components/SubscriptionBreadcrumb";
import { getLibraryById } from "@/data/fetchPrisma";

// Define the component props interface for typing (matching actual database schema)
interface EJournalSubscriptionManagementClientProps {
  subscriptions: Array<{
    libraryyear_id: number;
    listejournal_id: number;
    List_EJournal: {
      id: number;
      title: string | null;
      sub_series_number: string | null;
      publisher: string | null;
      description: string | null;
      notes: string | null;
      updated_at: Date;
      subtitle: string | null;
      series: string | null;
      vendor: string | null;
      cjk_title: string | null;
      romanized_title: string | null;
      data_source: string | null;
      is_global: boolean | null;
      libraryyear: number | null;
      List_EJournal_Counts?: Array<{ journals: number | null; dbs: number | null }>;
    };
  }>;
  libid: number;
  year: number;
  mode: "view" | "add";
  libraryName: string;
  roleId?: string;
}

// Use dynamic import with proper typing for client component
const EJournalSubscriptionManagementClient = dynamic(
  () => import('./EJournalSubscriptionManagementClient'),
  { 
    loading: () => <SkeletonTableCard />
  }
) as React.ComponentType<EJournalSubscriptionManagementClientProps>;

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
  console.log("All cookies:", allCookies);
  
  // The cookie is named "library" not "libid"
  const libidFromCookie = cookieStore.get("library")?.value;
  const roleFromCookie = cookieStore.get("role")?.value;
  
  console.log("Cookie values:", {
    libidFromCookie,
    roleFromCookie,
    libidStr
  });
  
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
                Your library ID cookie is missing or invalid. This is required to manage E-Journal subscriptions.
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
                  href={`/admin/forms/56/ejournaledit${sp.ids ? `?ids=${sp.ids}&year=${year}` : ''}`}
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
  
  // Enhanced debugging for URL parsing
  console.log("🔍 DEBUG: Raw searchParams:", sp);
  console.log("🔍 DEBUG: sp.ids value:", sp.ids);
  console.log("🔍 DEBUG: sp.ids type:", typeof sp.ids);
  
  // Fix: Handle empty string and undefined properly
  const idsParam = sp.ids;
  let ids: number[] = [];
  
  if (idsParam && idsParam.trim() !== "") {
    ids = idsParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
  }

  // Debug logging to see what we're getting
  console.log("🔍 DEBUG: Starting ejournaledit page load");
  console.log("Debug ejournaledit page:", {
    libidStr,
    libid,
    year,
    idsParam,
    ids,
    searchParams: sp
  });

  console.log("🔍 DEBUG: ids.length =", ids.length, ", ids =", ids);
  console.log("🔍 DEBUG: Will enter", ids.length === 0 ? "VIEW mode (show current subscriptions)" : "ADD mode (subscription editor)");
  
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
    console.log("🔍 DEBUG: No IDs provided - showing all current E-Journal subscriptions for library", libid);
    
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

    // Get all current E-Journal subscriptions for this library and year with counts
    const subscriptions = await db.libraryYear_ListEJournal.findMany({
      where: { libraryyear_id: libraryYearRecord!.id },
      include: { 
        List_EJournal: {
          include: {
            List_EJournal_Counts: {
              where: { year },
              select: { journals: true, dbs: true }
            },
            List_EJournal_Language: {
              select: { Language: { select: { short: true } } }
            }
          }
        } 
      },
    });

    const subscribedEJournals = subscriptions.map((s) => s.List_EJournal);
    
    if (subscribedEJournals.length === 0) {
      return (
        <main>
          <Container className='bg-white pb-12 max-w-full'>
            <div className='px-8 pt-4'>
              <SubscriptionBreadcrumb 
                surveyType="ejournal" 
                year={year} 
                libraryName={libraryName}
                mode="view"
              />
            </div>
            <div className='flex-1 flex-col px-8 pb-4 md:flex'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h2 className='text-3xl font-bold tracking-tight'>
                    {libraryName} - E-Journal Subscription Management
                  </h2>
                  <p className='text-lg text-gray-600'>
                    Year: {year}
                  </p>
                </div>
                <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
                  <p className='text-sm font-medium text-yellow-800'>
                    No E-Journal subscriptions found for this library and year. Go to the survey page to add subscriptions.
                  </p>
                </div>
                <div className="mt-4">
                  <a 
                    href={`/admin/survey/ejournal/${year}`}
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
              surveyType="ejournal" 
              year={year} 
              libraryName={libraryName}
              mode="view"
            />
          </div>
          <div className='flex-1 flex-col px-8 pb-4 md:flex'>
            <div className='mb-6 space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {libraryName} - E-Journal Subscription Management
              </h1>
              <p className='text-lg text-gray-600'>
                Year: {year} • {subscribedEJournals.length} subscription{subscribedEJournals.length === 1 ? '' : 's'}
              </p>
            </div>

            <Suspense fallback={<SkeletonTableCard />}> 
              <EJournalSubscriptionManagementClient 
                subscriptions={subscriptions}
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
  console.log("🔍 DEBUG: IDs provided - showing E-Journal subscription editor for", ids.length, "records");
  
  const rows = await db.list_EJournal.findMany({
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
    publisher: r.publisher ?? "",
    data_source: r.data_source ?? "",
    series: r.series ?? "",
    vendor: r.vendor ?? "",
    sub_series_number: r.sub_series_number ?? "",
    is_global: !!r.is_global,
    updated_at: r.updated_at.toISOString(),
  }));

  return (
    <main>
      <Container className='bg-white pb-12 max-w-full'>
        <div className='px-8 pt-4'>
          <SubscriptionBreadcrumb 
            surveyType="ejournal" 
            year={year} 
            libraryName={libraryName}
            mode="add"
          />
        </div>
        <div className='flex-1 flex-col px-8 pb-4 md:flex'>
          <div className='mb-6 space-y-2'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Add E-Journal Subscriptions - {libraryName}
            </h1>
            <p className='text-lg text-gray-600'>
              Subscribe to selected E-Journal records for {year}. This will add them to Library {libid}'s collection.
            </p>
          </div>
          <EJournalEditClient 
            rows={data}
            libid={libid}
            year={year}
          />
        </div>
      </Container>
    </main>
  );
}
