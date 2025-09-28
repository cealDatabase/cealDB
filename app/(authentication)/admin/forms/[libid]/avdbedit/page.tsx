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
  
  // Parse libid from URL params, but also check cookies for member users
  let libid: number;
  
  // If libidStr is "member" or not a valid number, get libid from cookies
  if (libidStr === "member" || isNaN(Number(libidStr))) {
    const libidFromCookie = cookieStore.get("libid")?.value;
    if (libidFromCookie) {
      libid = Number(libidFromCookie);
    } else {
      libid = NaN; // Will trigger notFound
    }
  } else {
    libid = Number(libidStr);
  }

  const year = sp.year ? Number(sp.year) : 2025;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));

  // Debug logging to see what we're getting
  console.log("Debug avdbedit page:", {
    libidStr,
    libid,
    year,
    ids,
    searchParams: sp
  });

  // If no ids are provided, render the list view similar to survey page, with role-based visibility
  if (ids.length === 0) {
    const roleId = cookieStore.get("role")?.value;

    // Super admin: show full list for the year
    if (roleId && roleId.trim() !== "2") {
      const tasks = (await GetAVList(year)).sort((a: any, b: any) => a.id - b.id);
      return (
        <main>
          <Container className='bg-white p-12 max-w-full'>
            <div className='flex-1 flex-col p-8 md:flex'>
              <div className='space-y-2'>
                <h2 className='text-2xl font-bold tracking-tight'>
                  Audio/Visual Database by Subscription - {year}
                </h2>
                <p className='text-muted-foreground text-sm'>
                  Please check the boxes next to each subscription your library has.
                </p>
              </div>

              <Suspense fallback={<SkeletonTableCard />}> 
                <AVDataTableClient data={tasks} year={year} roleIdPassIn={roleId} libid={libid} />
              </Suspense>
            </div>
          </Container>
        </main>
      );
    }

    // Member users: only show subscribed items for this library and year
    const subscribed = await db.libraryYear_ListAV.findMany({
      where: {
        Library_Year: {
          year: year,
          library: libid,
        },
      },
      include: { List_AV: true },
    });

    const subscribedIds = subscribed.map((s) => s.listav_id);

    if (subscribedIds.length === 0) {
      return (
        <main>
          <Container className='bg-white p-12 max-w-full'>
            <div className='flex-1 flex-col p-8 md:flex'>
              <h2 className='text-2xl font-bold tracking-tight'>My AV Subscriptions - {year}</h2>
              <p className='text-muted-foreground text-sm'>No subscriptions found for your library.</p>
            </div>
          </Container>
        </main>
      );
    }

    const rows = await db.list_AV.findMany({
      where: { id: { in: subscribedIds } },
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
      language: r.List_AV_Language.map((x) => x.Language?.short).filter(Boolean) as string[],
      is_global: !!r.is_global,
      subscribers: [],
      updated_at: r.updated_at.toISOString(),
    }));

    return (
      <main>
        <Container className='bg-white p-12 max-w-full'>
          <div className='flex-1 flex-col p-8 md:flex'>
            <div className='space-y-2'>
              <h2 className='text-2xl font-bold tracking-tight'>My AV Subscriptions - {year}</h2>
              <p className='text-muted-foreground text-sm'>Your library's subscriptions for the selected year.</p>
            </div>

            <Suspense fallback={<SkeletonTableCard />}> 
              <AVDataTableClient data={data} year={year} roleIdPassIn={"2"} libid={libid} />
            </Suspense>
          </div>
        </Container>
      </main>
    );
  }

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

  return <AvdbEditClient libid={libid} year={year} rows={data} />;
}
