import { getLibraryById } from "@/data/fetchPrisma";
import TablePlaceholder from "@/components/table-placeholder";
import { Suspense } from "react";
import LibSingle from "@/components/lib-single";

export const dynamic = "force-dynamic";

async function LibrarySinglePage(passId: number) {
  const libraryIem = await getLibraryById(passId);
  return <LibSingle libraries={libraryIem} />;
}

export default function LibraiesHomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        Single Library Page
      </h1>
      <Suspense fallback={<TablePlaceholder />}>
        {LibrarySinglePage(1)}
      </Suspense>
    </main>
  );
}
