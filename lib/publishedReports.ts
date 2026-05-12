/**
 * Helpers for the published-statistics PDF list (model `PublishedReport`).
 *
 * Centralizes the decade-grouping logic so the public Statistics page,
 * the admin editor preview, and any future export all use the same rules.
 */

export interface PublishedReportRow {
  id: number;
  academicYear: number;
  title: string;
  url: string | null;
  journal: string | null;
  appendix: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export interface DecadeGroup {
  /** Sort key, descending (e.g. 2020 comes before 2010). */
  decadeStart: number;
  /** "2020 to Current (4 years)" or "2010-2019 (10 years)". */
  label: string;
  /** Accordion id, stable across renders. */
  value: string;
  /** Years inside this decade, descending. e.g. ["2023-2024", "2022-2023", ...]. */
  yearLabels: string[];
  /** Rows grouped by year label, in display order. */
  rowsByYear: Record<string, PublishedReportRow[]>;
}

/** Convert an academic start year (2023) → label "2023-2024". */
export function formatYearLabel(academicYear: number): string {
  return `${academicYear}-${academicYear + 1}`;
}

/** Which decade bucket does an academic start year belong to? */
function decadeStartOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Group reports into decades, newest decade first. Each decade label is
 * derived from the data, so adding a 2026-2027 row on Jan 1 automatically
 * lands it in "2020 to Current" until 2030, then "2020-2029".
 */
export function groupByDecade(rows: PublishedReportRow[]): DecadeGroup[] {
  const calendarYear = new Date().getFullYear();
  const currentDecade = decadeStartOf(calendarYear);

  // Map: decadeStart -> Map<yearLabel, row[]>
  const decadeMap = new Map<number, Map<string, PublishedReportRow[]>>();

  for (const row of rows) {
    const decade = decadeStartOf(row.academicYear);
    const yearLabel = formatYearLabel(row.academicYear);

    if (!decadeMap.has(decade)) {
      decadeMap.set(decade, new Map());
    }
    const yearMap = decadeMap.get(decade)!;
    if (!yearMap.has(yearLabel)) {
      yearMap.set(yearLabel, []);
    }
    yearMap.get(yearLabel)!.push(row);
  }

  // Stable sort each year's rows by displayOrder, then id.
  for (const yearMap of decadeMap.values()) {
    for (const yearRows of yearMap.values()) {
      yearRows.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
    }
  }

  const decades: DecadeGroup[] = [];
  for (const [decadeStart, yearMap] of decadeMap) {
    // Year labels within the decade, newest first.
    const yearLabels = Array.from(yearMap.keys()).sort((a, b) => b.localeCompare(a));
    const yearCount = yearLabels.length;
    const rowsByYear: Record<string, PublishedReportRow[]> = {};
    for (const label of yearLabels) rowsByYear[label] = yearMap.get(label)!;

    const isCurrent = decadeStart === currentDecade;
    const label = isCurrent
      ? `${decadeStart} to Current (${yearCount} ${yearCount === 1 ? 'year' : 'years'})`
      : `${decadeStart}-${decadeStart + 9} (${yearCount} ${yearCount === 1 ? 'year' : 'years'})`;

    decades.push({
      decadeStart,
      label,
      value: isCurrent ? `${decadeStart}-current` : `${decadeStart}-${decadeStart + 9}`,
      yearLabels,
      rowsByYear,
    });
  }

  // Newest decade first.
  decades.sort((a, b) => b.decadeStart - a.decadeStart);
  return decades;
}
