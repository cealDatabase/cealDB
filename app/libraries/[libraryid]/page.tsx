import { getLibraryById } from "@/data/fetchPrisma";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import LibSingle from "@/components/LibSingle";
import { SingleLibraryType } from "@/types/types";

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-8 mt-12 w-2/4">
      <Skeleton className="w-full h-[7rem] rounded-xl" />
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <Skeleton className="w-full h-[6rem] rounded-xl" />
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <div className="flex flex-row space-x-8">
        <Skeleton className="w-1/4 h-[5rem] rounded-xl" />
        <Skeleton className="w-3/4 h-[5rem] rounded-xl" />
      </div>
      <Skeleton className="w-full h-[7rem] rounded-xl" />
    </div>
  );
}

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
