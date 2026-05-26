import { Container } from "@/components/Container";
import Link from "next/link";
import { AlertTriangle, ExternalLink, BookOpen, FileText } from "lucide-react";

type HistoricalReport = {
  year: string;
  link?: string;
  note?: string;
};

// Post-1998: Link to database current view or external sources
const POST_1998_REPORTS: HistoricalReport[] = [
  { year: "2024-2025", link: "" },
  { year: "2023-2024", link: "" },
  { year: "2022-2023", link: "https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2856&context=jeal" },
  { year: "2021-2022", link: "https://scholarsarchive.byu.edu/cgi/viewcontent.cgi?article=2835&context=jeal" },
  { year: "2020-2021", link: "" },
  { year: "2019-2020", link: "" },
  { year: "2018-2019", link: "http://hdl.handle.net/1808/30603" },
  { year: "2017-2018", link: "http://hdl.handle.net/1808/29620" },
  { year: "2016-2017", link: "https://kuscholarworks.ku.edu/handle/1808/26456" },
  { year: "2015-2016", link: "http://hdl.handle.net/1808/22713" },
  { year: "2014-2015", link: "http://hdl.handle.net/1808/20316" },
  { year: "2013-2014", link: "" },
  { year: "2012-2013", link: "" },
  { year: "2011-2012", link: "" },
  { year: "2010-2011", link: "" },
  { year: "2009-2010", link: "" },
  { year: "2008-2009", link: "" },
  { year: "2007-2008", link: "" },
  { year: "2006-2007", link: "" },
  { year: "2005-2006", link: "" },
  { year: "2004-2005", link: "" },
  { year: "2003-2004", link: "" },
  { year: "2002-2003", link: "" },
  { year: "2001-2002", link: "" },
  { year: "2000-2001", link: "" },
  { year: "1999-2000", link: "" },
  { year: "1998-1999", note: "Revised", link: "" },
];

// Pre-1998: Historical archive — different methodology
const PRE_1998_REPORTS: HistoricalReport[] = [
  { year: "1997-1998", link: "/docs/historical/ceal-stats-1997-1998.pdf" },
  { year: "1996-1997", link: "/docs/historical/ceal-stats-1996-1997.pdf" },
  { year: "1995-1996", link: "/docs/historical/ceal-stats-1995-1996.pdf" },
  { year: "1994-1995", link: "/docs/historical/ceal-stats-1994-1995.pdf" },
  { year: "1993-1994", link: "/docs/historical/ceal-stats-1993-1994.pdf" },
  { year: "1992-1993", link: "/docs/historical/ceal-stats-1992-1993.pdf" },
  { year: "1991-1992", link: "/docs/historical/ceal-stats-1991-1992.pdf" },
  { year: "1990-1991", link: "https://ceal.ku.edu/download/1991" },
  { year: "1989-1990", link: "https://ceal.ku.edu/download/1990" },
  { year: "1988-1989", link: "https://ceal.ku.edu/download/1989" },
  { year: "1987-1988", link: "https://ceal.ku.edu/download/1988" },
  { year: "1979-1980", link: "/docs/historical/ceal-stats-1979-1980.pdf" },
  { year: "1975", link: "/docs/historical/ceal-stats-1975.pdf" },
  { year: "1973", link: "/docs/historical/ceal-stats-1973.pdf" },
  { year: "1970 and Pre-1970", link: "https://ceal.ku.edu/download/1970" },
  { year: "1969-1975", note: "Multi-year compilation", link: "" },
  { year: "1968", link: "/docs/historical/ceal-stats-1968.pdf" },
  { year: "1967", link: "/docs/historical/ceal-stats-1967.pdf" },
  { year: "1965", link: "/docs/historical/ceal-stats-1965.pdf" },
  { year: "1964", link: "/docs/historical/ceal-stats-1964.pdf" },
  { year: "1957", note: "Includes data from 1869", link: "/docs/historical/ceal-stats-1957.pdf" },
  { year: "1930-1975", note: "Growth of 15 Major E. Asian Collections", link: "/docs/historical/ceal-stats-1930-1975.pdf" },
];

function ReportGrid({ reports }: { reports: HistoricalReport[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {reports.map((r) => (
        <div key={r.year} className="text-sm">
          {r.link ? (
            <Link
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              {r.year}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
          ) : (
            <span className="text-gray-700">{r.year}</span>
          )}
          {r.note && <div className="text-xs text-gray-500 mt-0.5">{r.note}</div>}
        </div>
      ))}
    </div>
  );
}

export default function YearStatPDF() {
  return (
    <main className="min-h-screen bg-white">
      <Container className="py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 pb-2">
            CEAL Statistics PDFs
          </h1>
          <p className="text-xl text-gray-600">Published Reports (1957–Present)</p>
        </div>

        {/* Methodology warning about 1998 cutoff */}
        <div
          role="note"
          className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 mb-10"
        >
          <AlertTriangle
            className="w-5 h-5 text-amber-700 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="text-sm text-amber-900 leading-6">
            <p className="font-semibold">
              Data methodology changed in 1998–1999.
            </p>
            <p className="mt-1">
              Pre-1998 data uses a different schema and cannot be combined with
              post-1998 statistics in the same analysis. The 1998–1999 report was
              the first under the revised methodology. Both eras are listed below
              for reference, but treat them as separate data series.
            </p>
          </div>
        </div>

        {/* Post-1998 Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              1998–Present (Current Methodology)
            </h2>
          </div>
          <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-6">
            <ReportGrid reports={POST_1998_REPORTS} />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Recent years link to the live database. Older years link to archived PDFs.
            External links open in a new tab.
          </p>
        </section>

        {/* Divider with visual separation */}
        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm text-gray-500 font-medium">Historical Archive</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Pre-1998 Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              1957–1997 (Pre-Revision Archive)
            </h2>
          </div>
          <div className="rounded-lg bg-gray-50/70 ring-1 ring-gray-200 p-6">
            <ReportGrid reports={PRE_1998_REPORTS} />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            All pre-1998 reports are preserved as PDFs in their original format.
            Data definitions and collection methods differ from the current system.
          </p>
        </section>

        {/* Footer link */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <Link href="/statistics/pdf" className="text-rose-700 hover:underline text-sm">
            ← Back to Published Statistics
          </Link>
        </div>
      </Container>
    </main>
  );
}
