import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

// ---------------------------------------------------------------------------
// Ranking metrics
// Each entry may have either:
//   field  — a single DB field (value used directly)
//   fields — multiple DB fields + a compute(record) fn to derive the value
// ---------------------------------------------------------------------------

type PrismaModelKey =
  | "fiscal_Support"
  | "electronic"
  | "volume_Holdings"
  | "other_Holdings"
  | "personnel_Support"
  | "serials";

interface MetricBase {
  category: string;
  label: string;
  model: PrismaModelKey;
}
interface SingleFieldMetric extends MetricBase {
  field: string;
  fields?: never;
  compute?: never;
}
interface ComputedMetric extends MetricBase {
  field?: never;
  fields: string[];
  compute: (r: Record<string, unknown>) => number;
}
type Metric = SingleFieldMetric | ComputedMetric;

// Current-year holdings = previous_year + added_gross - withdrawn (per language)
function currentHoldings(
  lang: "chinese" | "japanese" | "korean" | "noncjk" | "subtotal",
) {
  return (r: Record<string, unknown>) =>
    numVal(r, `vhprevious_year_${lang}`) +
    numVal(r, `vhadded_gross_${lang}`) -
    numVal(r, `vhwithdrawn_${lang}`);
}

// Fiscal: compute language appropriation subtotal from 4 items, with manual override
function langAppropriations(lang: "chinese" | "japanese" | "korean" | "noncjk") {
  return (r: Record<string, unknown>) => {
    const manual = r[`fs${lang}_appropriations_subtotal_manual`];
    if (manual !== null && manual !== undefined) return numVal(r, `fs${lang}_appropriations_subtotal_manual`);
    const stored = r[`fs${lang}_appropriations_subtotal`];
    if (stored !== null && stored !== undefined) return numVal(r, `fs${lang}_appropriations_subtotal`);
    return numVal(r, `fs${lang}_appropriations_monographic`) +
      numVal(r, `fs${lang}_appropriations_serial`) +
      numVal(r, `fs${lang}_appropriations_other_material`) +
      numVal(r, `fs${lang}_appropriations_electronic`);
  };
}

// All individual fiscal fields needed for computed metrics
const FISCAL_INDIVIDUAL_FIELDS = [
  "fschinese_appropriations_monographic", "fschinese_appropriations_serial",
  "fschinese_appropriations_other_material", "fschinese_appropriations_electronic",
  "fschinese_appropriations_subtotal", "fschinese_appropriations_subtotal_manual",
  "fsjapanese_appropriations_monographic", "fsjapanese_appropriations_serial",
  "fsjapanese_appropriations_other_material", "fsjapanese_appropriations_electronic",
  "fsjapanese_appropriations_subtotal", "fsjapanese_appropriations_subtotal_manual",
  "fskorean_appropriations_monographic", "fskorean_appropriations_serial",
  "fskorean_appropriations_other_material", "fskorean_appropriations_electronic",
  "fskorean_appropriations_subtotal", "fskorean_appropriations_subtotal_manual",
  "fsnoncjk_appropriations_monographic", "fsnoncjk_appropriations_serial",
  "fsnoncjk_appropriations_other_material", "fsnoncjk_appropriations_electronic",
  "fsnoncjk_appropriations_subtotal", "fsnoncjk_appropriations_subtotal_manual",
  "fstotal_appropriations", "fstotal_appropriations_manual",
  "fsendowments_chinese", "fsendowments_japanese", "fsendowments_korean", "fsendowments_noncjk",
  "fsendowments_subtotal", "fsendowments_subtotal_manual",
  "fsgrants_chinese", "fsgrants_japanese", "fsgrants_korean", "fsgrants_noncjk",
  "fsgrants_subtotal", "fsgrants_subtotal_manual",
  "fseast_asian_program_support_chinese", "fseast_asian_program_support_japanese",
  "fseast_asian_program_support_korean", "fseast_asian_program_support_noncjk",
  "fseast_asian_program_support_subtotal", "fseast_asian_program_support_subtotal_manual",
  "fstotal_acquisition_budget",
];

const METRICS: Metric[] = [
  // Fiscal Support Rankings
  {
    category: "Fiscal Support Rankings",
    label: "Total Appropriations",
    model: "fiscal_Support",
    fields: FISCAL_INDIVIDUAL_FIELDS,
    compute: (r) => {
      const manual = r["fstotal_appropriations_manual"];
      if (manual !== null && manual !== undefined) return numVal(r, "fstotal_appropriations_manual");
      const stored = r["fstotal_appropriations"];
      if (stored !== null && stored !== undefined) return numVal(r, "fstotal_appropriations");
      return langAppropriations("chinese")(r) +
        langAppropriations("japanese")(r) +
        langAppropriations("korean")(r) +
        langAppropriations("noncjk")(r);
    },
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total CJK Appropriations",
    model: "fiscal_Support",
    fields: FISCAL_INDIVIDUAL_FIELDS,
    compute: (r) =>
      langAppropriations("chinese")(r) +
      langAppropriations("japanese")(r) +
      langAppropriations("korean")(r),
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total Endowments",
    model: "fiscal_Support",
    fields: FISCAL_INDIVIDUAL_FIELDS,
    compute: (r) => {
      const manual = r["fsendowments_subtotal_manual"];
      if (manual !== null && manual !== undefined) return numVal(r, "fsendowments_subtotal_manual");
      const stored = r["fsendowments_subtotal"];
      if (stored !== null && stored !== undefined) return numVal(r, "fsendowments_subtotal");
      return numVal(r, "fsendowments_chinese") +
        numVal(r, "fsendowments_japanese") +
        numVal(r, "fsendowments_korean") +
        numVal(r, "fsendowments_noncjk");
    },
  },
  {
    category: "Fiscal Support Rankings",
    label: "Chinese Grants",
    model: "fiscal_Support",
    field: "fsgrants_chinese",
  },
  {
    category: "Fiscal Support Rankings",
    label: "Japanese Grants",
    model: "fiscal_Support",
    field: "fsgrants_japanese",
  },
  {
    category: "Fiscal Support Rankings",
    label: "Korean Grants",
    model: "fiscal_Support",
    field: "fsgrants_korean",
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total Grants",
    model: "fiscal_Support",
    fields: FISCAL_INDIVIDUAL_FIELDS,
    compute: (r) => {
      const manual = r["fsgrants_subtotal_manual"];
      if (manual !== null && manual !== undefined) return numVal(r, "fsgrants_subtotal_manual");
      const stored = r["fsgrants_subtotal"];
      if (stored !== null && stored !== undefined) return numVal(r, "fsgrants_subtotal");
      return numVal(r, "fsgrants_chinese") +
        numVal(r, "fsgrants_japanese") +
        numVal(r, "fsgrants_korean") +
        numVal(r, "fsgrants_noncjk");
    },
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total East Asian Program Support",
    model: "fiscal_Support",
    fields: FISCAL_INDIVIDUAL_FIELDS,
    compute: (r) => {
      const manual = r["fseast_asian_program_support_subtotal_manual"];
      if (manual !== null && manual !== undefined) return numVal(r, "fseast_asian_program_support_subtotal_manual");
      const stored = r["fseast_asian_program_support_subtotal"];
      if (stored !== null && stored !== undefined) return numVal(r, "fseast_asian_program_support_subtotal");
      return numVal(r, "fseast_asian_program_support_chinese") +
        numVal(r, "fseast_asian_program_support_japanese") +
        numVal(r, "fseast_asian_program_support_korean") +
        numVal(r, "fseast_asian_program_support_noncjk");
    },
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total Fiscal Support",
    model: "fiscal_Support",
    field: "fstotal_acquisition_budget",
  },

  // Electronic Resources Rankings
  {
    category: "Electronic Resources Rankings",
    label: "Grand Total CD",
    model: "electronic",
    field: "egrand_total_cd_subtotal",
  },
  {
    category: "Electronic Resources Rankings",
    label: "Grand Total Electronic Expenditure",
    model: "electronic",
    field: "etotal_expenditure_grandtotal",
  },

  // Total Holdings Rankings
  {
    category: "Total Holdings Rankings",
    label: "Total Volume Holdings",
    model: "volume_Holdings",
    field: "vhgrandtotal",
  },
  {
    category: "Total Holdings Rankings",
    label: "Total Other Library Materials",
    model: "other_Holdings",
    field: "ohgrandtotal",
  },
  // Grand Total Holdings = Volume Holdings + Other Library Materials (cross-table)
  // Handled specially in the query logic below; placeholder uses vhgrandtotal
  {
    category: "Total Holdings Rankings",
    label: "Grand Total Holdings",
    model: "volume_Holdings",
    field: "vhgrandtotal",
  },

  // Total Physical Volume Holdings Rankings — computed: prev + added - withdrawn
  {
    category: "Total Physical Volume Holdings Rankings",
    label: "Total Chinese Holdings",
    model: "volume_Holdings",
    fields: [
      "vhprevious_year_chinese",
      "vhadded_gross_chinese",
      "vhwithdrawn_chinese",
    ],
    compute: currentHoldings("chinese"),
  },
  {
    category: "Total Physical Volume Holdings Rankings",
    label: "Total Japanese Holdings",
    model: "volume_Holdings",
    fields: [
      "vhprevious_year_japanese",
      "vhadded_gross_japanese",
      "vhwithdrawn_japanese",
    ],
    compute: currentHoldings("japanese"),
  },
  {
    category: "Total Physical Volume Holdings Rankings",
    label: "Total Korean Holdings",
    model: "volume_Holdings",
    fields: [
      "vhprevious_year_korean",
      "vhadded_gross_korean",
      "vhwithdrawn_korean",
    ],
    compute: currentHoldings("korean"),
  },
  {
    category: "Total Physical Volume Holdings Rankings",
    label: "Total Non-CJK Holdings",
    model: "volume_Holdings",
    fields: [
      "vhprevious_year_noncjk",
      "vhadded_gross_noncjk",
      "vhwithdrawn_noncjk",
    ],
    compute: currentHoldings("noncjk"),
  },
  {
    category: "Total Physical Volume Holdings Rankings",
    label: "Total Volume Holdings",
    model: "volume_Holdings",
    fields: [
      "vhprevious_year_subtotal",
      "vhadded_gross_subtotal",
      "vhwithdrawn_subtotal",
    ],
    compute: currentHoldings("subtotal"),
  },

  // Personnel Support Rankings
  {
    category: "Personnel Support Rankings",
    label: "Professional Chinese",
    model: "personnel_Support",
    field: "psfprofessional_chinese",
  },
  {
    category: "Personnel Support Rankings",
    label: "Professional Japanese",
    model: "personnel_Support",
    field: "psfprofessional_japanese",
  },
  {
    category: "Personnel Support Rankings",
    label: "Professional Korean",
    model: "personnel_Support",
    field: "psfprofessional_korean",
  },
  {
    category: "Personnel Support Rankings",
    label: "Professional East Asian",
    model: "personnel_Support",
    field: "psfprofessional_eastasian",
  },
  {
    category: "Personnel Support Rankings",
    label: "Total Professional Personnel Support",
    model: "personnel_Support",
    field: "psfprofessional_subtotal",
  },

  // Serial Subscriptions Rankings — print serials only (matches legacy system)
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Chinese Serials",
    model: "serials",
    field: "stotal_chinese",
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Japanese Serials",
    model: "serials",
    field: "stotal_japanese",
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Korean Serials",
    model: "serials",
    field: "stotal_korean",
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Non-CJK Serials",
    model: "serials",
    field: "stotal_noncjk",
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Serials",
    model: "serials",
    field: "sgrandtotal",
  },
];

// Helper: get numeric value from a prisma record (handles Decimal types)
function numVal(record: Record<string, unknown>, field: string): number {
  const v = record[field];
  if (v === null || v === undefined) return 0;
  if (typeof v === "object" && "toNumber" in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v) || 0;
}

/**
 * Special cross-table handler: Grand Total Holdings = Volume Holdings + Other Library Materials
 * Both come from different DB tables so we need to join them by library.
 */
async function computeGrandTotalHoldingsRanking(
  targetYear: number,
  myLibraryId: number,
  myLibraryName: string,
  availableYears: number[],
) {
  // Fetch volume holdings (vhgrandtotal) per library
  const vhRows = await db.volume_Holdings.findMany({
    where: { Library_Year: { year: targetYear } },
    select: { vhgrandtotal: true, Library_Year: { select: { library: true } } },
  });
  // Fetch other holdings (ohgrandtotal) per library
  const ohRows = await db.other_Holdings.findMany({
    where: { Library_Year: { year: targetYear } },
    select: { ohgrandtotal: true, Library_Year: { select: { library: true } } },
  });

  // Build maps: libraryId → value
  const vhMap: Record<number, number> = {};
  for (const r of vhRows) {
    const lib = r.Library_Year?.library;
    if (lib != null) vhMap[lib] = r.vhgrandtotal ?? 0;
  }
  const ohMap: Record<number, number> = {};
  for (const r of ohRows) {
    const lib = r.Library_Year?.library;
    if (lib != null) ohMap[lib] = r.ohgrandtotal ?? 0;
  }

  // All library IDs involved
  const allLibIds = [...new Set([...Object.keys(vhMap), ...Object.keys(ohMap)].map(Number))];
  const libraries = allLibIds.length > 0
    ? await db.library.findMany({
        where: { id: { in: allLibIds } },
        select: { id: true, library_name: true },
      })
    : [];
  const libMap: Record<number, string> = Object.fromEntries(
    libraries.map((l) => [l.id, l.library_name]),
  );

  // Compute combined value per library
  const items = allLibIds
    .map((libId) => ({
      libraryId: libId,
      libraryName: libMap[libId] || "Unknown",
      value: (vhMap[libId] ?? 0) + (ohMap[libId] ?? 0),
    }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  // Add ranks with tie handling
  const fullRanking: Array<{ libraryId: number; libraryName: string; value: number; rank: number }> = [];
  let currentRank = 1;
  for (let idx = 0; idx < items.length; idx++) {
    if (idx > 0 && items[idx].value < items[idx - 1].value) {
      currentRank = idx + 1;
    }
    fullRanking.push({ ...items[idx], rank: currentRank });
  }

  return NextResponse.json({
    fullRanking,
    metric: "Grand Total Holdings",
    category: "Total Holdings Rankings",
    availableYears,
    year: targetYear,
    libraryId: myLibraryId,
    libraryName: myLibraryName,
  });
}

/**
 * Compute Grand Total Holdings for a single library (for summary view).
 * Returns vhgrandtotal + ohgrandtotal, and rank among all libraries.
 */
async function computeGrandTotalHoldingsSummary(
  targetYear: number,
  myLibraryId: number,
) {
  const vhRows = await db.volume_Holdings.findMany({
    where: { Library_Year: { year: targetYear } },
    select: { vhgrandtotal: true, Library_Year: { select: { library: true } } },
  });
  const ohRows = await db.other_Holdings.findMany({
    where: { Library_Year: { year: targetYear } },
    select: { ohgrandtotal: true, Library_Year: { select: { library: true } } },
  });

  const vhMap: Record<number, number> = {};
  for (const r of vhRows) {
    const lib = r.Library_Year?.library;
    if (lib != null) vhMap[lib] = r.vhgrandtotal ?? 0;
  }
  const ohMap: Record<number, number> = {};
  for (const r of ohRows) {
    const lib = r.Library_Year?.library;
    if (lib != null) ohMap[lib] = r.ohgrandtotal ?? 0;
  }

  const allLibIds = [...new Set([...Object.keys(vhMap), ...Object.keys(ohMap)].map(Number))];
  const allValues = allLibIds.map((id) => (vhMap[id] ?? 0) + (ohMap[id] ?? 0)).filter((v) => v > 0);
  const myValue = (vhMap[myLibraryId] ?? 0) + (ohMap[myLibraryId] ?? 0);
  const rank = myValue > 0 ? allValues.filter((v) => v > myValue).length + 1 : 0;
  const total = allValues.length;

  return { myValue, rank, total };
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const rawEmail = cookieStore.get("uinf")?.value;
    const roleData = cookieStore.get("role")?.value;
    const libraryData = cookieStore.get("library")?.value;

    if (!rawEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let roleIds: string[] = [];
    try {
      roleIds = roleData ? JSON.parse(roleData) : [];
    } catch {
      roleIds = [];
    }
    const isSuperAdmin = roleIds.includes("1");

    // Determine which library to show rankings for
    let libraryId: number | null = null;
    const requestedLibrary = request.nextUrl.searchParams.get("libraryId");

    if (isSuperAdmin && requestedLibrary) {
      libraryId = parseInt(requestedLibrary);
    } else {
      // Non-super-admin: use their own library
      libraryId = libraryData ? parseInt(libraryData) : null;
    }

    if (!libraryId || isNaN(libraryId)) {
      return NextResponse.json(
        { error: "No library associated with this account" },
        { status: 400 },
      );
    }

    const sp = request.nextUrl.searchParams;
    const yearParam = sp.get("year");
    const year = yearParam ? parseInt(yearParam) : null;

    // Get all available years for this library
    const lyYears = await db.library_Year.findMany({
      where: { library: libraryId, year: { not: 1900 } },
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });
    const availableYears = lyYears.map((y: { year: number }) => y.year);
    const targetYear =
      year && availableYears.includes(year) ? year : availableYears[0];

    if (!targetYear) {
      return NextResponse.json({
        rankings: [],
        availableYears: [],
        year: null,
        libraryId,
      });
    }

    // Fetch the library name
    const library = await db.library.findUnique({
      where: { id: libraryId },
      select: { library_name: true },
    });
    const myLibraryName = library?.library_name ?? "Your Institution";

    // Check if a specific metric is requested for full ranking view
    const metricParam = sp.get("metric");
    const targetMetric = metricParam
      ? METRICS.find((m) => m.label === metricParam)
      : null;

    // If a specific metric is requested, return full ranking list
    if (targetMetric) {
      // Special cross-table handling for "Grand Total Holdings"
      if (targetMetric.label === "Grand Total Holdings") {
        return await computeGrandTotalHoldingsRanking(
          targetYear, libraryId, myLibraryName, availableYears,
        );
      }

      const selectFields = targetMetric.fields
        ? Object.fromEntries(targetMetric.fields.map((f) => [f, true]))
        : { [targetMetric.field as string]: true };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modelRepo = db[targetMetric.model] as any;

      // Fetch all rows with library info
      const allRows = await modelRepo.findMany({
        where: { Library_Year: { year: targetYear } },
        select: {
          ...selectFields,
          libraryyear: true,
          Library_Year: { select: { library: true } },
        },
      });

      // Get library names (filter out rows with null Library_Year or null library)
      const validRows = allRows.filter(
        (r: { Library_Year: { library: number | null } | null }) =>
          r.Library_Year != null && r.Library_Year.library != null,
      );
      const libraryIds = [
        ...new Set(
          validRows.map(
            (r: { Library_Year: { library: number } }) =>
              r.Library_Year.library,
          ),
        ),
      ] as number[];
      const libraries = libraryIds.length > 0
        ? await db.library.findMany({
            where: { id: { in: libraryIds } },
            select: { id: true, library_name: true },
          })
        : [];
      const libMap: Record<number, string> = Object.fromEntries(
        libraries.map((l) => [l.id, l.library_name]),
      );

      // Compute values and build full ranking
      const getValue = (r: Record<string, unknown>): number =>
        targetMetric.compute
          ? targetMetric.compute(r)
          : numVal(r, targetMetric.field as string);

      interface RankingItem {
        libraryId: number;
        libraryName: string;
        value: number;
      }

      const sortedItems: RankingItem[] = (validRows as Record<string, unknown>[])
        .map((r) => ({
          libraryId: (r.Library_Year as { library: number }).library,
          libraryName:
            libMap[(r.Library_Year as { library: number }).library] ||
            "Unknown",
          value: getValue(r),
        }))
        .filter((r: RankingItem) => r.value > 0)
        .sort((a: RankingItem, b: RankingItem) => b.value - a.value);

      // Add ranks with tie handling
      const fullRanking: Array<{
        libraryId: number;
        libraryName: string;
        value: number;
        rank: number;
      }> = [];
      let currentRank = 1;
      for (let idx = 0; idx < sortedItems.length; idx++) {
        const r = sortedItems[idx];
        if (idx > 0 && r.value < sortedItems[idx - 1].value) {
          currentRank = idx + 1;
        }
        fullRanking.push({ ...r, rank: currentRank });
      }

      return NextResponse.json({
        fullRanking,
        metric: targetMetric.label,
        category: targetMetric.category,
        availableYears,
        year: targetYear,
        libraryId,
        libraryName: myLibraryName,
      });
    }

    // Compute rankings for each metric (summary view)
    const rankings: {
      category: string;
      label: string;
      myValue: number;
      rank: number;
      total: number;
    }[] = [];

    for (const metric of METRICS) {
      // Special cross-table handling for "Grand Total Holdings"
      if (metric.label === "Grand Total Holdings") {
        const gth = await computeGrandTotalHoldingsSummary(targetYear, libraryId);
        rankings.push({
          category: metric.category,
          label: metric.label,
          myValue: gth.myValue,
          rank: gth.rank,
          total: gth.total,
        });
        continue;
      }

      // Build select object from either single field or computed fields list
      const selectFields = metric.fields
        ? Object.fromEntries(metric.fields.map((f) => [f, true]))
        : { [metric.field as string]: true };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modelRepo = db[metric.model] as any;

      // Fetch all rows for this model + year across ALL libraries
      const allRows: Record<string, unknown>[] = await modelRepo.findMany({
        where: { Library_Year: { year: targetYear } },
        select: { ...selectFields, libraryyear: true },
      });

      // Fetch my own row
      const myRows: Record<string, unknown>[] = await modelRepo.findMany({
        where: { Library_Year: { year: targetYear, library: libraryId } },
        select: selectFields,
      });

      // Compute values using either direct field or compute function
      const getValue = (r: Record<string, unknown>): number =>
        metric.compute ? metric.compute(r) : numVal(r, metric.field as string);

      const myValue = myRows.length > 0 ? getValue(myRows[0]) : 0;
      const allValues = allRows.map(getValue).filter((v) => v > 0);

      // Rank = number of institutions with value strictly greater than mine + 1
      const rank = myValue > 0 ? allValues.filter((v) => v > myValue).length + 1 : 0;
      const total = allValues.length;

      rankings.push({
        category: metric.category,
        label: metric.label,
        myValue,
        rank,
        total,
      });
    }

    return NextResponse.json({
      rankings,
      availableYears,
      year: targetYear,
      libraryId,
      libraryName: myLibraryName,
    });
  } catch (error) {
    console.error("Ranking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
