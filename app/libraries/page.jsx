import Link from "next/link";
import { Suspense } from "react";
import TablePlaceholder from "@/components/RenderPlaceholder";
import { getAllLibraries } from "@/data/fetchPrisma";
import LibList from "@/components/LibList";

export const dynamic = "force-dynamic";

async function allLibraries() {
  const libraries = await getAllLibraries();
  return <LibList libraries={libraries} />;
}

export default function LibraiesHomePage() {
  return (
    <main>
      <h1>Library Information</h1>
      <Suspense fallback={<TablePlaceholder />}>{allLibraries()}</Suspense>
    </main>
  );
}
