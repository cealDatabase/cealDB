import { Suspense } from "react";
import { getAllLibraries } from "@/data/fetchPrisma";
import { Skeleton } from "@/components/ui/skeleton";
import LibList from "@/components/LibList";
import { SingleLibraryType } from "@/types/types";

async function allLibraries() {
  const libraries = await getAllLibraries();
  return <LibList libraries={libraries as unknown as SingleLibraryType }/>;
}

function SkeletonCard() {
  return (
    <div className="flex flex-row space-x-3 mt-8">
      <Skeleton className="h-[50px] w-[250px] rounded-xl" />
      <Skeleton className="h-[50px] w-[100px] rounded-xl" />
    </div>
  );
}

export default function LibraiesHomePage() {
  return (
    <main>
      <h1>Library Information</h1>
      <p>This page contains library information of CEAL participants.</p>
      <Suspense fallback={<SkeletonCard />}>{allLibraries()}</Suspense>
    </main>
  );
}
