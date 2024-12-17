import { getLibraryById } from "@/data/fetchPrisma";
import { Suspense } from "react";
import SkeletonCard from "@/components/SkeletonCard";
import LibSingle from "@/components/LibSingle";
import { SingleLibraryType } from "@/types/types";


export const dynamic = "force-dynamic";

async function LibrarySinglePage(passId: number) {
  const libraryItem = await getLibraryById(passId);
  return <LibSingle libraries={libraryItem as unknown as SingleLibraryType} />;
}

export default async function SingleLibraryInfoHomePage(
  props: {
    params: Promise<{ libraryid: string }>;
  }
) {
  const params = await props.params;
  return (
    <main>
      <Suspense fallback={<SkeletonCard />}>
        {LibrarySinglePage(Number(params.libraryid))}
      </Suspense>
    </main>
  );
}
