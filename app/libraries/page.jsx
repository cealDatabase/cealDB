import Link from "next/link";
import { Suspense } from "react";
import TablePlaceholder from "@/components/table-placeholder";
import ExpandingArrow from "@/components/expanding-arrow";
import { getAllLibraries } from "@/data/fetchPrisma";
import { SingleLibraryType } from "@/types/types"; // Import the LibraryType type
import LibGrid from "./lib-grid";

// export const dynamic = "force-dynamic";

async function allLibraries() {
    const libraries = await getAllLibraries();
    return <LibGrid libraries={libraries} />;
}

export default function LibraiesHomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <Link
        href="https://www.eastasianlib.org/newsite/"
        className="group mt-20 sm:mt-0 rounded-full flex space-x-1 bg-white/30 shadow-sm ring-1 ring-gray-900/5 text-gray-600 text-sm font-medium px-10 py-2 hover:shadow-lg active:shadow-sm transition-all"
      >
        <p>CEAL Main Site</p>
        <ExpandingArrow />
      </Link>
      <h1 className="pt-4 pb-8 bg-gradient-to-r from-[#f9572a] to-[#ffc905] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
        CEAL Statistics Database
      </h1>
      <Suspense fallback={<TablePlaceholder />}>
        {allLibraries()}
        </Suspense>
    </main>
  );
}