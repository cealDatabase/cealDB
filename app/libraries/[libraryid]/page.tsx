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

function generateYears(startYear: number, endYear: number) {
  let years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
}

let yearsArray = generateYears(1999, 2024);

export default function SingleLibraryInfoHomePage({
  params,
}: {
  params: { libraryid: string };
}) {
  return (
    <main>
      <Suspense>{LibrarySinglePage(Number(params.libraryid))}</Suspense>
      <div className="flex gap-4">
        {yearsArray.map((year) => (
          <Link key={year} href={`/libraries/${params.libraryid}/${year}`}>
            {year}
          </Link>
        ))}
      </div>
    </main>
  );
}
