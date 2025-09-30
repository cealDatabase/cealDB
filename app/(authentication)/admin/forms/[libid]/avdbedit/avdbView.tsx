'use server';

import { cookies } from 'next/headers';
import { notFound as nextNotFound } from 'next/navigation';
import { GetAVList } from "@/app/(authentication)/admin/survey/avdb/components/getAVList";
import AVDataTableClient from "@/app/(authentication)/admin/survey/avdb/components/avDataTableClient";
import { Container } from "@/components/Container";
import { Suspense } from "react";
import SkeletonTableCard from "@/components/SkeletonTableCard";
import { getLibraryYearId, getSubscribedAVs } from "@/lib/av-utils";

interface PageProps {
  params: { libid: string };
  searchParams?: { year?: string };
}

export default async function AvdbViewPage({ params, searchParams }: PageProps) {
  const cookieStore = await cookies();
  const roleId = cookieStore.get("role")?.value;
  const isSuperAdmin = roleId === "1";

  // Get library ID from params or cookie
  let libid: number;
  if (params.libid === "member" || isNaN(Number(params.libid))) {
    const libidFromCookie = cookieStore.get("library")?.value;
    if (!libidFromCookie) return nextNotFound();
    libid = Number(libidFromCookie);
  } else {
    libid = Number(params.libid);
  }

  // Get year from search params or use current year
  const year = searchParams?.year ? Number(searchParams.year) : new Date().getFullYear();

  // Fetch data based on user role
  let avData: any[] = [];
  if (isSuperAdmin) {
    // Super admin sees all AV items
    avData = (await GetAVList(year)).sort((a, b) => a.id - b.id);
  } else {
    // Regular users only see their subscribed items
    avData = await getSubscribedAVs(libid, year);
  }

  return (
    <main>
      <Container className="bg-white p-12 max-w-full">
        <div className="flex-1 flex-col p-8 md:flex">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isSuperAdmin 
                ? "Manage AV Subscriptions" 
                : "My AV Subscriptions"} - {year}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSuperAdmin
                ? "View and manage all AV subscriptions. You can add or remove subscriptions for any library."
                : "View your library's AV subscriptions. Contact an administrator to modify your subscriptions."}
            </p>
          </div>

          <Suspense fallback={<SkeletonTableCard />}>
            <AVDataTableClient
              data={avData}
              year={year}
              roleIdPassIn={roleId}
              libid={libid}
            />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}

function notFound(): never {
  throw new Error("Not found");
}
