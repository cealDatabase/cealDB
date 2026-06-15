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

// Combined print + e-serial total per language
function serialTotal(lang: "chinese" | "japanese" | "korean" | "noncjk") {
  return (r: Record<string, unknown>) =>
    numVal(r, `stotal_${lang}`) + numVal(r, `s_etotal_${lang}`);
}

const METRICS: Metric[] = [
  // Fiscal Support Rankings
  {
    category: "Fiscal Support Rankings",
    label: "Total Appropriations",
    model: "fiscal_Support",
    field: "fstotal_appropriations",
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total CJK Appropriations",
    model: "fiscal_Support",
    fields: [
      "fschinese_appropriations_subtotal",
      "fsjapanese_appropriations_subtotal",
      "fskorean_appropriations_subtotal",
    ],
    compute: (r) =>
      numVal(r, "fschinese_appropriations_subtotal") +
      numVal(r, "fsjapanese_appropriations_subtotal") +
      numVal(r, "fskorean_appropriations_subtotal"),
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total Endowments",
    model: "fiscal_Support",
    field: "fsendowments_subtotal",
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
    field: "fsgrants_subtotal",
  },
  {
    category: "Fiscal Support Rankings",
    label: "Total East Asian Program Support",
    model: "fiscal_Support",
    field: "fseast_asian_program_support_subtotal",
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
    field: "vhoverall_grand_total",
  },
  {
    category: "Total Holdings Rankings",
    label: "Total Other Library Materials",
    model: "other_Holdings",
    field: "ohgrandtotal",
  },
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
    label: "Total VolumeHoldings",
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

  // Serial Subscriptions Rankings — print + e-serial combined
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Chinese Serials",
    model: "serials",
    fields: ["stotal_chinese", "s_etotal_chinese"],
    compute: serialTotal("chinese"),
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Japanese Serials",
    model: "serials",
    fields: ["stotal_japanese", "s_etotal_japanese"],
    compute: serialTotal("japanese"),
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Korean Serials",
    model: "serials",
    fields: ["stotal_korean", "s_etotal_korean"],
    compute: serialTotal("korean"),
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Non-CJK Serials",
    model: "serials",
    fields: ["stotal_noncjk", "s_etotal_noncjk"],
    compute: serialTotal("noncjk"),
  },
  {
    category: "Serial Subscriptions Rankings",
    label: "Total Current Serials",
    model: "serials",
    fields: ["sgrandtotal", "s_egrandtotal"],
    compute: (r) => numVal(r, "sgrandtotal") + numVal(r, "s_egrandtotal"),
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

    // Compute rankings for each metric
    const rankings: {
      category: string;
      label: string;
      myValue: number;
      rank: number;
      total: number;
    }[] = [];

    for (const metric of METRICS) {
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
      const allValues = allRows.map(getValue);

      // Rank = number of institutions strictly greater than mine + 1
      const rank = allValues.filter((v) => v > myValue).length + 1;
      const total = allRows.length;

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
