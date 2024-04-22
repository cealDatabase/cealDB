import { getLibraryById } from "@/data/fetchPrisma";
import TablePlaceholder from "@/components/RenderPlaceholder";
import { Suspense } from "react";
import LibSingle from "@/components/LibSingle";

export const dynamic = "force-dynamic";

async function LibrarySinglePage(passId: number) {
  const libraryIem = await getLibraryById(passId);
  return <LibSingle libraries={libraryIem} />;
}

export default function LibraiesHomePage({ params }: { params: { libraryid: string } }) {
  return (
      <Suspense fallback={<TablePlaceholder />}>
        {LibrarySinglePage(Number(params.libraryid))}
      </Suspense>
  );
}
