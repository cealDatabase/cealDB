import { getLibraryById } from "@/data/fetchPrisma";
import { Suspense } from "react";
import LibSingle from "@/components/LibSingle";
import { SingleLibraryType } from "@/types/types";

export const dynamic = "force-dynamic";

async function LibrarySinglePage(passId: number) {
  const libraryItem = await getLibraryById(passId);
  return <LibSingle libraries={libraryItem as unknown as SingleLibraryType} />;
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
