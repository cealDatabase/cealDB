import { getLibraryById } from "@/data/fetchPrisma";
import { Suspense } from "react";
import LibSingle from "@/components/LibSingle";
import { SingleLibraryType } from "@/types/types";
import Link from "next/link";

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
      <div className="flex gap-4">
        <Link href={`/libraries/${params.libraryid}/1999`}>1999</Link>
        <Link href={`/libraries/${params.libraryid}/2003`}>2003</Link>
        <Link href={`/libraries/${params.libraryid}/2008`}>2008</Link>
        <Link href={`/libraries/${params.libraryid}/2010`}>2010</Link>
        <Link href={`/libraries/${params.libraryid}/2013`}>2013</Link>
        <Link href={`/libraries/${params.libraryid}/2016`}>2016</Link>
        <Link href={`/libraries/${params.libraryid}/2018`}>2018</Link>
      </div>
    </main>
  );
}
