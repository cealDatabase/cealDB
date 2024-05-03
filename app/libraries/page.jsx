import { Suspense } from "react";
import { getAllLibraries } from "@/data/fetchPrisma";
import LibList from "@/components/LibList";

// export const dynamic = "force-dynamic";

async function allLibraries() {
  const libraries = await getAllLibraries();
  return <LibList libraries={libraries}/>;
}

export default function LibraiesHomePage() {
  return (
    <main>
      <h1>Library Information</h1>
      <p>This page contains library information of CEAL participants.</p>
      <Suspense>{allLibraries()}</Suspense>
    </main>
  );
}
