import { Container } from "@/components/Container";
import Link from "next/link";
import db from "@/lib/db";
import { groupByDecade, type PublishedReportRow } from "@/lib/publishedReports";
import PublishedPDFsAccordion from "./PublishedPDFsAccordion";

// Always render with fresh data — super admin edits should appear immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchPublishedReports(): Promise<PublishedReportRow[]> {
  const prisma = db as any;
  try {
    const rows = await prisma.publishedReport.findMany({
      where: { isPublished: true, url: { not: null } },
      orderBy: [{ academicYear: "desc" }, { displayOrder: "asc" }, { id: "asc" }],
    });
    return rows as PublishedReportRow[];
  } catch (err) {
    console.error("[statistics/pdf] Failed to load PublishedReport rows:", err);
    return [];
  }
}

export default async function PublishedPDFs() {
  const rows = await fetchPublishedReports();
  const decades = groupByDecade(rows);

  return (
    <main>
      <h1>Published Statistics (PDFs)</h1>
      <Container>
        <section>
          <div className="sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="sm:pr-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                Special Thanks
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                The Committee wishes to thank Dr. Tsuen-Hsuin Tsien 錢存訓 for
                his generous support and permission to use his publications in
                pdf.
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                This series report annual statistical data on collections,
                expenditures, staffing, and user services of East Asian
                collections in North America libraries.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-gray-600">
                  Review by year
                </h4>
                <div className="h-px flex-auto bg-gray-400" />
              </div>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <Link href="/statistics/pdf/year-pdf-version" className="text-rose-700 hover:underline">
                    CEAL Statistics PDFs (1957-2019/2020)
                  </Link>
                </li>
              </ul>
            </div>
            <div className="p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-100 p-10 ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center">
                <div className="mx-auto max-w-xs flex flex-col gap-y-7">
                  <p className="text-base font-semibold text-gray-600">
                    Printed copies are published every year in the February
                    issue of Journal of East Asian Libraries (JEAL).
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-gray-800 leading-7">
                    Journal of East Asian Libraries
                  </p>
                  <Link
                    href="https://scholarsarchive.byu.edu/jeal/"
                    className="block w-full rounded-md bg-rose-700/80 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                  >
                    Get access
                  </Link>
                  <p className="text-sm leading-5 text-gray-600">
                    The archival issues can be accessed at the{" "}
                    <Link href="https://scholarsarchive.byu.edu/journals.html">
                      Scholarly Periodicals Center
                    </Link>{" "}
                    hosted by the Brigham Young University.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col">
          <PublishedPDFsAccordion decades={decades} />
        </section>
      </Container>
    </main>
  );
}
