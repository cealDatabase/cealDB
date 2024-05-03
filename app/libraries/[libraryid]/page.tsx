import { getLibraryById } from "@/data/fetchPrisma";
import { Suspense } from "react";
import LibSingle from "@/components/LibSingle";

export const dynamic = "force-dynamic";

async function LibrarySinglePage(passId: number) {
  const libraryItem = await getLibraryById(passId);
  return <LibSingle libraries={libraryItem} />;
}

export default function SingleLibraryInfoHomePage({
  params,
}: {
  params: { libraryid: string };
}) {
  return (
    <main>
      <Suspense>{LibrarySinglePage(Number(params.libraryid))}</Suspense>
    </main>
  );
}
