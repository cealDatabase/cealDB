import { Container } from "@/components/Container";
import Link from "next/link";
import { AlertTriangle, BookOpen, Archive, FileText, ExternalLink } from "lucide-react";

// Pre-1998 historical archive page.
//
// Why this page exists:
//   CEAL collected and published East Asian library statistics for decades
//   before the current cealstats.org database was launched in 1999. The data
//   structure, field definitions, and collection methodology changed
//   significantly with the 1998-1999 "Revised" report. As a result, pre-1998
//   data cannot be combined with post-1998 data in the same query — the
//   fields don't line up and the meaning of comparable-sounding fields has
//   shifted.
//
// This page exposes pre-1998 reports in a clearly separated, read-only
// archive view so users can still consult the historical record without
// accidentally mixing it into modern analytics.

// Pre-1998 published PDFs, organized roughly by decade.
// Year ranges below 1998-1999 are the ones the original (now-defunct)
// ceal.ku.edu site exposed under "Review by year". Some links there are
// dead; we document the existence of the data and link only where we have
// a working URL. To restore a link, edit the `link` field below.

type LegacyReport = {
  year: string;
  link?: string;          // Optional — leave blank if the URL is not currently known.
  note?: string;          // Optional — e.g. "Revised", "includes data from 1869".
};

const PRE_1998: LegacyReport[] = [
  // 1990s, pre-1998 cutoff - all downloaded to /public/docs/historical/
  { year: "1997-1998", link: "/docs/historical/ceal-stats-1997-1998.pdf" },
  { year: "1996-1997", link: "/docs/historical/ceal-stats-1996-1997.pdf" },
  { year: "1995-1996", link: "/docs/historical/ceal-stats-1995-1996.pdf" },
  { year: "1994-1995", link: "/docs/historical/ceal-stats-1994-1995.pdf" },
  { year: "1993-1994", link: "/docs/historical/ceal-stats-1993-1994.pdf" },
  { year: "1992-1993", link: "/docs/historical/ceal-stats-1992-1993.pdf" },
  { year: "1991-1992", link: "/docs/historical/ceal-stats-1991-1992.pdf" },
  { year: "1990-1991", link: "/docs/historical/ceal-stats-1990-1991.pdf" },
];

const NINETEEN_EIGHTIES: LegacyReport[] = [
  { year: "1989", link: "/docs/historical/ceal-stats-1989.pdf" },
  { year: "1988", link: "/docs/historical/ceal-stats-1988.pdf" },
  { year: "1987" }, // Not yet downloaded
  { year: "1979-1980", link: "/docs/historical/ceal-stats-1979-1980.pdf" },
];

const NINETEEN_SEVENTIES: LegacyReport[] = [
  { year: "1975", link: "/docs/historical/ceal-stats-1975.pdf" },
  { year: "1973", link: "/docs/historical/ceal-stats-1973.pdf" },
  { year: "1969-1975", note: "Multi-year compilation", link: "/docs/historical/ceal-stats-1930-1975.pdf" },
];

const PRE_1970: LegacyReport[] = [
  { year: "1970 and Pre-1970" },
  { year: "1968", link: "/docs/historical/ceal-stats-1968.pdf" },
  { year: "1967", link: "/docs/historical/ceal-stats-1967.pdf" },
  { year: "1965", link: "/docs/historical/ceal-stats-1965.pdf" },
  { year: "1964", link: "/docs/historical/ceal-stats-1964.pdf" },
  { year: "1957", note: "Includes data from 1869", link: "/docs/historical/ceal-stats-1957.pdf" },
  { year: "1930-1975", note: "Growth of 15 Major E. Asian Collections", link: "/docs/historical/ceal-stats-1930-1975.pdf" },
];

// Special reference: ARL Data Files 1992-98 — pre-1998 data was sourced
// in part from the Association of Research Libraries data files rather
// than direct CEAL submissions.
const ARL_REFERENCE = {
  title: "Libraries in the ARL Data Files, 1992-98",
  link: "http://www.lib.virginia.edu/socsci/arl/1998/institution98.shtml",
  note: "Original appendix URL — may no longer resolve.",
};

function DecadeBlock({
  label,
  reports,
}: {
  label: string;
  reports: LegacyReport[];
}) {
  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
      <dt className="text-gray-500 font-medium">{label}</dt>
      <dd className="mt-1 leading-6 sm:col-span-2 sm:mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
              {r.note && (
                <div className="text-xs text-gray-500 mt-0.5">{r.note}</div>
              )}
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}

export default function Pre1998ArchivePage() {
  return (
    <main className="min-h-screen bg-white">
      <Container className="py-10 max-w-5xl mx-auto">

        {/* Page header — kept intentionally minimal, no logo/icon hero. */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Data before 1998
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Historical archive — separated from current statistics because the
            data structure and collection methodology changed in the 1998-1999
            reporting cycle.
          </p>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Methodology warning */}
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
              Do not combine pre-1998 data with post-1998 statistics in the
              same query.
            </p>
            <p className="mt-1">
              In 1998-1999 CEAL revised its questionnaire, expanded the list of
              tracked forms (e.g. adding electronic resources), and refined the
              language breakdown (Chinese / Japanese / Korean / Non-CJK). Many
              field names look similar across the boundary but represent
              different underlying definitions. Pre-1998 figures are preserved
              here for reference only.
            </p>
          </div>
        </div>

        {/* What's in this archive */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              What is in this archive
            </h2>
          </div>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>
              Published CEAL statistical PDFs from <strong>1957 through 1997-1998</strong>.
            </li>
            <li>
              Selected pre-CEAL and growth studies, including
              T.&nbsp;H.&nbsp;Tsien&apos;s foundational compilation of 15 major
              East Asian collections.
            </li>
            <li>
              External references such as the ARL Data Files (1992-1998), which
              CEAL used as a partial data source before adopting its own direct
              questionnaire workflow.
            </li>
          </ul>
        </section>

        {/* Archive — decade blocks */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Archive className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              Published reports by period
            </h2>
          </div>

          <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200">
            <dl className="divide-y divide-gray-200">
              <DecadeBlock label="1990 - 1997 (pre-revision)" reports={PRE_1998} />
              <DecadeBlock label="1979 - 1989" reports={NINETEEN_EIGHTIES} />
              <DecadeBlock label="1969 - 1975" reports={NINETEEN_SEVENTIES} />
              <DecadeBlock label="1968 and before" reports={PRE_1970} />
            </dl>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            PDFs downloaded from the legacy ceal.ku.edu site. Click any link to
            view the historical report. A few entries (1987, 1970) are still
            being retrieved from the old host.
          </p>
        </section>

        {/* External references */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              External references
            </h2>
          </div>
          <div className="rounded-lg ring-1 ring-gray-200 p-4 bg-white">
            <Link
              href={ARL_REFERENCE.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              {ARL_REFERENCE.title}
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <p className="text-xs text-gray-500 mt-1">{ARL_REFERENCE.note}</p>
          </div>
        </section>

        {/* Why separate — the long answer */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Why pre-1998 data is on its own page
          </h2>
          <div className="text-sm text-gray-700 space-y-3 leading-7">
            <p>
              CEAL began publishing statistical data in 1957, with annual
              reports appearing in the Journal of East Asian Libraries (JEAL).
              In the 1998-1999 cycle, the methodology was revised: the
              questionnaire was restructured, new categories were introduced
              (notably electronic resources), and the language breakdown was
              standardized.
            </p>
            <p>
              The cealstats.org online database — the one you are currently
              using — was launched in 1999, with earlier reports digitized and
              added in 2007. Although those older reports are available, they
              represent a different schema. Joining them with current data
              would silently misrepresent trends.
            </p>
            <p>
              If you need long-range historical context (e.g. for advocacy or
              for an institutional history), cite pre-1998 figures from this
              archive directly, and present post-1998 figures from the current
              statistics views as a separate series.
            </p>
          </div>
        </section>

        {/* Footer back link */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/statistics/pdf" className="text-rose-700 hover:underline">
            ← Back to Published Statistics (current)
          </Link>
          <Link href="/help" className="text-gray-600 hover:underline">
            Need help interpreting the data? Visit Help.
          </Link>
        </div>
      </Container>
    </main>
  );
}
