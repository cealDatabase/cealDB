import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const prisma = db;

/**
 * GET /api/statistics/tableview
 * Returns all rows from one of the 10 statistical forms for the given year and
 * optional institution filter. Every field of the selected model is returned so
 * the results page can render the complete table.
 *
 * Query params:
 *   table       – one of the 10 table keys
 *   year        – reporting year (integer)
 *   institutions – optional comma-separated library IDs
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const tableKey = sp.get("table");
    const yearParam = sp.get("year");
    const institutionsParam = sp.get("institutions");

    if (!tableKey || !yearParam) {
      return NextResponse.json(
        { error: "Missing required params: table, year" },
        { status: 400 },
      );
    }

    const years = yearParam
      .split(",")
      .map((y) => parseInt(y))
      .filter((y) => !isNaN(y));
    if (years.length === 0) {
      return NextResponse.json(
        { error: "Invalid year param" },
        { status: 400 },
      );
    }
    const libraryIds = institutionsParam
      ? institutionsParam.split(",").map((id) => parseInt(id))
      : null;

    const config = TABLE_CONFIG[tableKey];
    if (!config) {
      return NextResponse.json({ error: "Unknown table key" }, { status: 400 });
    }

    // Find all Library_Year records for the year(s) (+ optional library filter)
    const libraryYears = await prisma.library_Year.findMany({
      where: {
        year: { in: years },
        ...(libraryIds ? { library: { in: libraryIds } } : {}),
      },
      include: {
        Library: { select: { id: true, library_name: true } },
      },
      orderBy: { Library: { library_name: "asc" } },
    });

    if (libraryYears.length === 0) {
      return NextResponse.json({
        data: [],
        columns: config.columns,
        tableLabel: config.label,
      });
    }

    const lyIds = libraryYears.map((ly) => ly.id);

    // Fetch all rows from the selected form table
    // @ts-expect-error – dynamic prisma model access
    const rows: Record<string, unknown>[] = await prisma[
      config.prismaModel
    ].findMany({
      where: { libraryyear: { in: lyIds } },
    });

    // Build maps: libraryyear id → library name / year
    const lyNameMap = new Map<number, string>();
    const lyYearMap = new Map<number, number>();
    libraryYears.forEach((ly) => {
      if (ly.Library) lyNameMap.set(ly.id, ly.Library.library_name);
      lyYearMap.set(ly.id, ly.year);
    });

    // Attach year + library_name to each row, sort by year desc then name
    const enriched = rows
      .map((row) => ({
        year: lyYearMap.get(row.libraryyear as number) ?? null,
        library_name: lyNameMap.get(row.libraryyear as number) ?? "Unknown",
        ...row,
      }))
      .sort((a, b) => {
        if ((b.year ?? 0) !== (a.year ?? 0))
          return (b.year ?? 0) - (a.year ?? 0);
        return String(a.library_name).localeCompare(String(b.library_name));
      });

    // Prepend Year column only when multiple years were requested
    const columns: ColDef[] =
      years.length > 1
        ? [
            { key: "year", label: "Year", type: "number" as const },
            ...config.columns,
          ]
        : config.columns;

    return NextResponse.json({
      data: enriched,
      columns,
      columnGroups: COLUMN_GROUPS[tableKey] ?? null,
      tableLabel: config.label,
    });
  } catch (error) {
    console.error("Error in tableview API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Column definitions for each of the 10 forms.
// Each column has: key (field name), label (display header), type (number|string|boolean)
// ---------------------------------------------------------------------------

type ColType = "number" | "string" | "boolean";
interface ColDef {
  key: string;
  label: string;
  type: ColType;
}
interface ColGroup {
  label: string | null; // null = no group header (rowspan=2)
  span: number;
}

// Column group definitions — label + how many leaf columns fall under each group.
// null label means that column cell spans both header rows (rowspan 2).
const COLUMN_GROUPS: Record<string, ColGroup[]> = {
  monographic: [
    { label: null, span: 1 }, // Institution
    { label: "Purchased Titles", span: 5 }, // CHN JPN KOR Non-CJK Subtotal
    { label: "Purchased Volumes", span: 5 },
    { label: "Rec'd but Not Purchased Titles", span: 5 },
    { label: "Rec'd but Not Purchased Volumes", span: 5 },
    { label: "Total Titles", span: 1 },
    { label: "Total Volumes", span: 1 },
    { label: null, span: 1 }, // Notes
  ],
  volume_holdings: [
    { label: null, span: 1 },
    { label: "Previous Year Holdings", span: 5 },
    { label: "Added Gross", span: 5 },
    { label: "Withdrawn", span: 5 },
    { label: "Microfilm", span: 4 },
    { label: "Microfiche", span: 4 },
    { label: "Film + Fiche", span: 4 },
    { label: null, span: 1 }, // Grand Total
    { label: null, span: 1 }, // E-Books Purchased
    { label: null, span: 1 }, // Overall Grand Total
    { label: null, span: 1 }, // Notes
  ],
  serials: [
    { label: null, span: 1 },
    { label: "Print Purchased", span: 5 },
    { label: "Print Non-Purchased", span: 5 },
    { label: "Print Total", span: 4 },
    { label: "E-Serial Purchased", span: 5 },
    { label: "E-Serial Non-Purchased", span: 5 },
    { label: "E-Serial Total", span: 4 },
    { label: null, span: 1 }, // Periodical Subtotal
    { label: null, span: 1 }, // Newspaper Subtotal
    { label: null, span: 1 }, // Print Grand Total
    { label: null, span: 1 }, // E-Serial Grand Total
    { label: null, span: 1 }, // Notes
  ],
  other_holdings: [
    { label: null, span: 1 },
    { label: "Audio", span: 5 },
    { label: "Cartographic", span: 5 },
    { label: "Computer CD", span: 5 },
    { label: "Computer Files", span: 5 },
    { label: "DVD", span: 5 },
    { label: "Film / Video", span: 5 },
    { label: "Microform", span: 5 },
    { label: "Online Image", span: 5 },
    { label: "Online Map", span: 5 },
    { label: "Other", span: 5 },
    { label: "Streaming", span: 5 },
    { label: "Streaming Video", span: 5 },
    { label: null, span: 1 }, // Custom Subtotal
    { label: null, span: 1 }, // Grand Total
    { label: null, span: 1 }, // Notes
  ],
  unprocessed: [
    { label: null, span: 1 },
    { label: "Uncataloged Materials", span: 5 },
    { label: "Cataloging Backlog", span: 2 },
    { label: "Total Backlog", span: 2 },
    { label: null, span: 1 }, // Notes
  ],
  fiscal: [
    { label: null, span: 1 },
    { label: "Chinese Appropriations", span: 5 },
    { label: "Japanese Appropriations", span: 5 },
    { label: "Korean Appropriations", span: 5 },
    { label: "Non-CJK Appropriations", span: 5 },
    { label: null, span: 1 }, // Total Appropriations
    { label: "Endowments", span: 5 },
    { label: "Grants", span: 5 },
    { label: "East Asian Program Support", span: 5 },
    { label: null, span: 1 }, // Total Acquisition Budget
    { label: null, span: 1 }, // Notes
  ],
  personnel: [
    { label: null, span: 1 },
    { label: "Professional Staff", span: 5 },
    { label: "Student Assistants", span: 5 },
    { label: "Support Staff", span: 5 },
    { label: null, span: 1 }, // Grand Total
    { label: null, span: 1 }, // Others
    { label: null, span: 1 }, // Notes
  ],
  public_services: [
    { label: null, span: 1 },
    { label: "Instruction", span: 2 },
    { label: null, span: 1 }, // Reference Transactions
    { label: null, span: 1 }, // Total Circulations
    { label: "ILL Lending", span: 2 },
    { label: "ILL Borrowing", span: 2 },
    { label: null, span: 1 }, // Notes
  ],
  electronic: [
    { label: null, span: 1 },
    { label: "Accompanied Computer Files", span: 2 },
    { label: "Fulltext Electronic", span: 2 },
    { label: "Gift Computer Files", span: 2 },
    { label: "Grand Total", span: 2 },
    { label: "Index Electronic", span: 2 },
    { label: "One-Time Computer Files", span: 3 },
    { label: "Previous Total", span: 2 },
    { label: "Total Computer Files", span: 3 },
    { label: "Total Electronic", span: 2 },
    { label: "Total Expenditure", span: 3 },
    { label: null, span: 1 }, // Notes
  ],
  electronic_books: [
    { label: null, span: 1 },
    { label: "Purchased Volumes", span: 5 },
    { label: "Purchased Titles", span: 5 },
    { label: "Non-Purchased Volumes", span: 5 },
    { label: "Non-Purchased Titles", span: 5 },
    { label: null, span: 1 }, // Subscription Vols Subtotal
    { label: null, span: 1 }, // Subscription Titles Subtotal
    { label: null, span: 1 }, // Total Volumes
    { label: null, span: 1 }, // Total Titles
    { label: null, span: 1 }, // Grand Total Expenditure
    { label: null, span: 1 }, // Notes
  ],
};

const TABLE_CONFIG: Record<
  string,
  { label: string; prismaModel: string; columns: ColDef[] }
> = {
  monographic: {
    label: "1. Monographic Acquisitions",
    prismaModel: "monographic_Acquisitions",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "mapurchased_titles_chinese",
        label: "Purch. Titles CHN",
        type: "number",
      },
      {
        key: "mapurchased_titles_japanese",
        label: "Purch. Titles JPN",
        type: "number",
      },
      {
        key: "mapurchased_titles_korean",
        label: "Purch. Titles KOR",
        type: "number",
      },
      {
        key: "mapurchased_titles_noncjk",
        label: "Purch. Titles Non-CJK",
        type: "number",
      },
      {
        key: "mapurchased_titles_subtotal",
        label: "Purch. Titles Subtotal",
        type: "number",
      },
      {
        key: "mapurchased_volumes_chinese",
        label: "Purch. Vols CHN",
        type: "number",
      },
      {
        key: "mapurchased_volumes_japanese",
        label: "Purch. Vols JPN",
        type: "number",
      },
      {
        key: "mapurchased_volumes_korean",
        label: "Purch. Vols KOR",
        type: "number",
      },
      {
        key: "mapurchased_volumes_noncjk",
        label: "Purch. Vols Non-CJK",
        type: "number",
      },
      {
        key: "mapurchased_volumes_subtotal",
        label: "Purch. Vols Subtotal",
        type: "number",
      },
      {
        key: "manonpurchased_titles_chinese",
        label: "Non-Purch. Titles CHN",
        type: "number",
      },
      {
        key: "manonpurchased_titles_japanese",
        label: "Non-Purch. Titles JPN",
        type: "number",
      },
      {
        key: "manonpurchased_titles_korean",
        label: "Non-Purch. Titles KOR",
        type: "number",
      },
      {
        key: "manonpurchased_titles_noncjk",
        label: "Non-Purch. Titles Non-CJK",
        type: "number",
      },
      {
        key: "manonpurchased_titles_subtotal",
        label: "Non-Purch. Titles Subtotal",
        type: "number",
      },
      {
        key: "manonpurchased_volumes_chinese",
        label: "Non-Purch. Vols CHN",
        type: "number",
      },
      {
        key: "manonpurchased_volumes_japanese",
        label: "Non-Purch. Vols JPN",
        type: "number",
      },
      {
        key: "manonpurchased_volumes_korean",
        label: "Non-Purch. Vols KOR",
        type: "number",
      },
      {
        key: "manonpurchased_volumes_noncjk",
        label: "Non-Purch. Vols Non-CJK",
        type: "number",
      },
      {
        key: "manonpurchased_volumes_subtotal",
        label: "Non-Purch. Vols Subtotal",
        type: "number",
      },
      { key: "matotal_titles", label: "Total Titles", type: "number" },
      { key: "matotal_volumes", label: "Total Volumes", type: "number" },
      { key: "manotes", label: "Notes", type: "string" },
    ],
  },

  volume_holdings: {
    label: "2. Physical Volume Holdings",
    prismaModel: "volume_Holdings",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "vhprevious_year_chinese",
        label: "Prev Year CHN",
        type: "number",
      },
      {
        key: "vhprevious_year_japanese",
        label: "Prev Year JPN",
        type: "number",
      },
      { key: "vhprevious_year_korean", label: "Prev Year KOR", type: "number" },
      {
        key: "vhprevious_year_noncjk",
        label: "Prev Year Non-CJK",
        type: "number",
      },
      {
        key: "vhprevious_year_subtotal",
        label: "Prev Year Subtotal",
        type: "number",
      },
      {
        key: "vhadded_gross_chinese",
        label: "Added Gross CHN",
        type: "number",
      },
      {
        key: "vhadded_gross_japanese",
        label: "Added Gross JPN",
        type: "number",
      },
      { key: "vhadded_gross_korean", label: "Added Gross KOR", type: "number" },
      {
        key: "vhadded_gross_noncjk",
        label: "Added Gross Non-CJK",
        type: "number",
      },
      {
        key: "vhadded_gross_subtotal",
        label: "Added Gross Subtotal",
        type: "number",
      },
      { key: "vhwithdrawn_chinese", label: "Withdrawn CHN", type: "number" },
      { key: "vhwithdrawn_japanese", label: "Withdrawn JPN", type: "number" },
      { key: "vhwithdrawn_korean", label: "Withdrawn KOR", type: "number" },
      { key: "vhwithdrawn_noncjk", label: "Withdrawn Non-CJK", type: "number" },
      {
        key: "vhwithdrawn_subtotal",
        label: "Withdrawn Subtotal",
        type: "number",
      },
      { key: "vh_film_chinese", label: "Microfilm CHN", type: "number" },
      { key: "vh_film_japanese", label: "Microfilm JPN", type: "number" },
      { key: "vh_film_korean", label: "Microfilm KOR", type: "number" },
      { key: "vh_film_subtotal", label: "Microfilm Subtotal", type: "number" },
      { key: "vh_fiche_chinese", label: "Microfiche CHN", type: "number" },
      { key: "vh_fiche_japanese", label: "Microfiche JPN", type: "number" },
      { key: "vh_fiche_korean", label: "Microfiche KOR", type: "number" },
      {
        key: "vh_fiche_subtotal",
        label: "Microfiche Subtotal",
        type: "number",
      },
      { key: "vh_film_fiche_chinese", label: "Film+Fiche CHN", type: "number" },
      {
        key: "vh_film_fiche_japanese",
        label: "Film+Fiche JPN",
        type: "number",
      },
      { key: "vh_film_fiche_korean", label: "Film+Fiche KOR", type: "number" },
      {
        key: "vh_film_fiche_subtotal",
        label: "Film+Fiche Subtotal",
        type: "number",
      },
      { key: "vhgrandtotal", label: "Grand Total", type: "number" },
      {
        key: "vhebooks_purchased_volume_total",
        label: "E-Books Purchased Vol Total",
        type: "number",
      },
      {
        key: "vhoverall_grand_total",
        label: "Overall Grand Total",
        type: "number",
      },
      { key: "vhnotes", label: "Notes", type: "string" },
    ],
  },

  serials: {
    label: "3. Serial Titles: Purchased and Non-Purchased",
    prismaModel: "serials",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      { key: "spurchased_chinese", label: "Print Purch. CHN", type: "number" },
      { key: "spurchased_japanese", label: "Print Purch. JPN", type: "number" },
      { key: "spurchased_korean", label: "Print Purch. KOR", type: "number" },
      {
        key: "spurchased_noncjk",
        label: "Print Purch. Non-CJK",
        type: "number",
      },
      {
        key: "spurchased_subtotal",
        label: "Print Purch. Subtotal",
        type: "number",
      },
      {
        key: "snonpurchased_chinese",
        label: "Print Non-Purch. CHN",
        type: "number",
      },
      {
        key: "snonpurchased_japanese",
        label: "Print Non-Purch. JPN",
        type: "number",
      },
      {
        key: "snonpurchased_korean",
        label: "Print Non-Purch. KOR",
        type: "number",
      },
      {
        key: "snonpurchased_noncjk",
        label: "Print Non-Purch. Non-CJK",
        type: "number",
      },
      {
        key: "snonpurchased_subtotal",
        label: "Print Non-Purch. Subtotal",
        type: "number",
      },
      { key: "stotal_chinese", label: "Print Total CHN", type: "number" },
      { key: "stotal_japanese", label: "Print Total JPN", type: "number" },
      { key: "stotal_korean", label: "Print Total KOR", type: "number" },
      { key: "stotal_noncjk", label: "Print Total Non-CJK", type: "number" },
      {
        key: "s_epurchased_chinese",
        label: "E-Serial Purch. CHN",
        type: "number",
      },
      {
        key: "s_epurchased_japanese",
        label: "E-Serial Purch. JPN",
        type: "number",
      },
      {
        key: "s_epurchased_korean",
        label: "E-Serial Purch. KOR",
        type: "number",
      },
      {
        key: "s_epurchased_noncjk",
        label: "E-Serial Purch. Non-CJK",
        type: "number",
      },
      {
        key: "s_epurchased_subtotal",
        label: "E-Serial Purch. Subtotal",
        type: "number",
      },
      {
        key: "s_enonpurchased_chinese",
        label: "E-Serial Non-Purch. CHN",
        type: "number",
      },
      {
        key: "s_enonpurchased_japanese",
        label: "E-Serial Non-Purch. JPN",
        type: "number",
      },
      {
        key: "s_enonpurchased_korean",
        label: "E-Serial Non-Purch. KOR",
        type: "number",
      },
      {
        key: "s_enonpurchased_noncjk",
        label: "E-Serial Non-Purch. Non-CJK",
        type: "number",
      },
      {
        key: "s_enonpurchased_subtotal",
        label: "E-Serial Non-Purch. Subtotal",
        type: "number",
      },
      { key: "s_etotal_chinese", label: "E-Serial Total CHN", type: "number" },
      { key: "s_etotal_japanese", label: "E-Serial Total JPN", type: "number" },
      { key: "s_etotal_korean", label: "E-Serial Total KOR", type: "number" },
      {
        key: "s_etotal_noncjk",
        label: "E-Serial Total Non-CJK",
        type: "number",
      },
      {
        key: "speriodical_subtotal",
        label: "Periodical Subtotal",
        type: "number",
      },
      {
        key: "snewspaper_subtotal",
        label: "Newspaper Subtotal",
        type: "number",
      },
      { key: "sgrandtotal", label: "Print Grand Total", type: "number" },
      { key: "s_egrandtotal", label: "E-Serial Grand Total", type: "number" },
      { key: "snotes", label: "Notes", type: "string" },
    ],
  },

  other_holdings: {
    label: "4. Holdings of Other Materials",
    prismaModel: "other_Holdings",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      { key: "ohaudio_chinese", label: "Audio CHN", type: "number" },
      { key: "ohaudio_japanese", label: "Audio JPN", type: "number" },
      { key: "ohaudio_korean", label: "Audio KOR", type: "number" },
      { key: "ohaudio_noncjk", label: "Audio Non-CJK", type: "number" },
      { key: "ohaudio_subtotal", label: "Audio Subtotal", type: "number" },
      {
        key: "ohcarto_graphic_chinese",
        label: "Cartographic CHN",
        type: "number",
      },
      {
        key: "ohcarto_graphic_japanese",
        label: "Cartographic JPN",
        type: "number",
      },
      {
        key: "ohcarto_graphic_korean",
        label: "Cartographic KOR",
        type: "number",
      },
      {
        key: "ohcarto_graphic_noncjk",
        label: "Cartographic Non-CJK",
        type: "number",
      },
      {
        key: "ohcarto_graphic_subtotal",
        label: "Cartographic Subtotal",
        type: "number",
      },
      {
        key: "ohcomputer_cd_chinese",
        label: "Computer CD CHN",
        type: "number",
      },
      {
        key: "ohcomputer_cd_japanese",
        label: "Computer CD JPN",
        type: "number",
      },
      { key: "ohcomputer_cd_korean", label: "Computer CD KOR", type: "number" },
      {
        key: "ohcomputer_cd_noncjk",
        label: "Computer CD Non-CJK",
        type: "number",
      },
      {
        key: "ohcomputer_cd_subtotal",
        label: "Computer CD Subtotal",
        type: "number",
      },
      {
        key: "ohcomputer_files_chinese",
        label: "Computer Files CHN",
        type: "number",
      },
      {
        key: "ohcomputer_files_japanese",
        label: "Computer Files JPN",
        type: "number",
      },
      {
        key: "ohcomputer_files_korean",
        label: "Computer Files KOR",
        type: "number",
      },
      {
        key: "ohcomputer_files_noncjk",
        label: "Computer Files Non-CJK",
        type: "number",
      },
      {
        key: "ohcomputer_files_subtotal",
        label: "Computer Files Subtotal",
        type: "number",
      },
      { key: "ohdvd_chinese", label: "DVD CHN", type: "number" },
      { key: "ohdvd_japanese", label: "DVD JPN", type: "number" },
      { key: "ohdvd_korean", label: "DVD KOR", type: "number" },
      { key: "ohdvd_noncjk", label: "DVD Non-CJK", type: "number" },
      { key: "ohdvd_subtotal", label: "DVD Subtotal", type: "number" },
      { key: "ohfilm_video_chinese", label: "Film/Video CHN", type: "number" },
      { key: "ohfilm_video_japanese", label: "Film/Video JPN", type: "number" },
      { key: "ohfilm_video_korean", label: "Film/Video KOR", type: "number" },
      {
        key: "ohfilm_video_noncjk",
        label: "Film/Video Non-CJK",
        type: "number",
      },
      {
        key: "ohfilm_video_subtotal",
        label: "Film/Video Subtotal",
        type: "number",
      },
      { key: "ohmicroform_chinese", label: "Microform CHN", type: "number" },
      { key: "ohmicroform_japanese", label: "Microform JPN", type: "number" },
      { key: "ohmicroform_korean", label: "Microform KOR", type: "number" },
      { key: "ohmicroform_noncjk", label: "Microform Non-CJK", type: "number" },
      {
        key: "ohmicroform_subtotal",
        label: "Microform Subtotal",
        type: "number",
      },
      {
        key: "ohonlineimagechinese",
        label: "Online Image CHN",
        type: "number",
      },
      {
        key: "ohonlineimagejapanese",
        label: "Online Image JPN",
        type: "number",
      },
      { key: "ohonlineimagekorean", label: "Online Image KOR", type: "number" },
      {
        key: "ohonlineimagenoncjk",
        label: "Online Image Non-CJK",
        type: "number",
      },
      {
        key: "ohonlineimagesubtotal",
        label: "Online Image Subtotal",
        type: "number",
      },
      { key: "ohonlinemapchinese", label: "Online Map CHN", type: "number" },
      { key: "ohonlinemapjapanese", label: "Online Map JPN", type: "number" },
      { key: "ohonlinemapkorean", label: "Online Map KOR", type: "number" },
      { key: "ohonlinemapnoncjk", label: "Online Map Non-CJK", type: "number" },
      {
        key: "ohonlinemapsubtotal",
        label: "Online Map Subtotal",
        type: "number",
      },
      { key: "ohotherchinese", label: "Other CHN", type: "number" },
      { key: "ohotherjapanese", label: "Other JPN", type: "number" },
      { key: "ohotherkorean", label: "Other KOR", type: "number" },
      { key: "ohothernoncjk", label: "Other Non-CJK", type: "number" },
      { key: "ohothersubtotal", label: "Other Subtotal", type: "number" },
      { key: "ohstreamingchinese", label: "Streaming CHN", type: "number" },
      { key: "ohstreamingjapanese", label: "Streaming JPN", type: "number" },
      { key: "ohstreamingkorean", label: "Streaming KOR", type: "number" },
      { key: "ohstreamingnoncjk", label: "Streaming Non-CJK", type: "number" },
      {
        key: "ohstreamingsubtotal",
        label: "Streaming Subtotal",
        type: "number",
      },
      {
        key: "ohstreamingvideochinese",
        label: "Streaming Video CHN",
        type: "number",
      },
      {
        key: "ohstreamingvideojapanese",
        label: "Streaming Video JPN",
        type: "number",
      },
      {
        key: "ohstreamingvideokorean",
        label: "Streaming Video KOR",
        type: "number",
      },
      {
        key: "ohstreamingvideononcjk",
        label: "Streaming Video Non-CJK",
        type: "number",
      },
      {
        key: "ohstreamingvideosubtotal",
        label: "Streaming Video Subtotal",
        type: "number",
      },
      { key: "ohcustomsubtotal", label: "Custom Subtotal", type: "number" },
      { key: "ohgrandtotal", label: "Grand Total", type: "number" },
      { key: "ohnotes", label: "Notes", type: "string" },
    ],
  },

  unprocessed: {
    label: "5. Unprocessed Backlog Materials",
    prismaModel: "unprocessed_Backlog_Materials",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      { key: "ubchinese", label: "CHN", type: "number" },
      { key: "ubjapanese", label: "JPN", type: "number" },
      { key: "ubkorean", label: "KOR", type: "number" },
      { key: "ubnoncjk", label: "Non-CJK", type: "number" },
      { key: "ubtotal", label: "Total", type: "number" },
      {
        key: "ubcatalog_title",
        label: "Cataloging Backlog Titles",
        type: "number",
      },
      {
        key: "ubcatalog_volume",
        label: "Cataloging Backlog Volumes",
        type: "number",
      },
      { key: "ub_title", label: "Total Backlog Titles", type: "number" },
      { key: "ub_volume", label: "Total Backlog Volumes", type: "number" },
      { key: "ubnotes", label: "Notes", type: "string" },
    ],
  },

  fiscal: {
    label: "6. Fiscal Support",
    prismaModel: "fiscal_Support",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "fschinese_appropriations_monographic",
        label: "Approp. Mono CHN",
        type: "number",
      },
      {
        key: "fschinese_appropriations_serial",
        label: "Approp. Serial CHN",
        type: "number",
      },
      {
        key: "fschinese_appropriations_other_material",
        label: "Approp. Other CHN",
        type: "number",
      },
      {
        key: "fschinese_appropriations_electronic",
        label: "Approp. Electronic CHN",
        type: "number",
      },
      {
        key: "fschinese_appropriations_subtotal",
        label: "Approp. Subtotal CHN",
        type: "number",
      },
      {
        key: "fsjapanese_appropriations_monographic",
        label: "Approp. Mono JPN",
        type: "number",
      },
      {
        key: "fsjapanese_appropriations_serial",
        label: "Approp. Serial JPN",
        type: "number",
      },
      {
        key: "fsjapanese_appropriations_other_material",
        label: "Approp. Other JPN",
        type: "number",
      },
      {
        key: "fsjapanese_appropriations_electronic",
        label: "Approp. Electronic JPN",
        type: "number",
      },
      {
        key: "fsjapanese_appropriations_subtotal",
        label: "Approp. Subtotal JPN",
        type: "number",
      },
      {
        key: "fskorean_appropriations_monographic",
        label: "Approp. Mono KOR",
        type: "number",
      },
      {
        key: "fskorean_appropriations_serial",
        label: "Approp. Serial KOR",
        type: "number",
      },
      {
        key: "fskorean_appropriations_other_material",
        label: "Approp. Other KOR",
        type: "number",
      },
      {
        key: "fskorean_appropriations_electronic",
        label: "Approp. Electronic KOR",
        type: "number",
      },
      {
        key: "fskorean_appropriations_subtotal",
        label: "Approp. Subtotal KOR",
        type: "number",
      },
      {
        key: "fsnoncjk_appropriations_monographic",
        label: "Approp. Mono Non-CJK",
        type: "number",
      },
      {
        key: "fsnoncjk_appropriations_serial",
        label: "Approp. Serial Non-CJK",
        type: "number",
      },
      {
        key: "fsnoncjk_appropriations_other_material",
        label: "Approp. Other Non-CJK",
        type: "number",
      },
      {
        key: "fsnoncjk_appropriations_electronic",
        label: "Approp. Electronic Non-CJK",
        type: "number",
      },
      {
        key: "fsnoncjk_appropriations_subtotal",
        label: "Approp. Subtotal Non-CJK",
        type: "number",
      },
      {
        key: "fstotal_appropriations",
        label: "Total Appropriations",
        type: "number",
      },
      { key: "fsendowments_chinese", label: "Endowments CHN", type: "number" },
      { key: "fsendowments_japanese", label: "Endowments JPN", type: "number" },
      { key: "fsendowments_korean", label: "Endowments KOR", type: "number" },
      {
        key: "fsendowments_noncjk",
        label: "Endowments Non-CJK",
        type: "number",
      },
      {
        key: "fsendowments_subtotal",
        label: "Endowments Subtotal",
        type: "number",
      },
      { key: "fsgrants_chinese", label: "Grants CHN", type: "number" },
      { key: "fsgrants_japanese", label: "Grants JPN", type: "number" },
      { key: "fsgrants_korean", label: "Grants KOR", type: "number" },
      { key: "fsgrants_noncjk", label: "Grants Non-CJK", type: "number" },
      { key: "fsgrants_subtotal", label: "Grants Subtotal", type: "number" },
      {
        key: "fseast_asian_program_support_chinese",
        label: "EA Program CHN",
        type: "number",
      },
      {
        key: "fseast_asian_program_support_japanese",
        label: "EA Program JPN",
        type: "number",
      },
      {
        key: "fseast_asian_program_support_korean",
        label: "EA Program KOR",
        type: "number",
      },
      {
        key: "fseast_asian_program_support_noncjk",
        label: "EA Program Non-CJK",
        type: "number",
      },
      {
        key: "fseast_asian_program_support_subtotal",
        label: "EA Program Subtotal",
        type: "number",
      },
      {
        key: "fstotal_acquisition_budget",
        label: "Total Acquisition Budget",
        type: "number",
      },
      { key: "fsnotes", label: "Notes", type: "string" },
    ],
  },

  personnel: {
    label: "7. Personnel Support",
    prismaModel: "personnel_Support",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "psfprofessional_chinese",
        label: "Professional CHN",
        type: "number",
      },
      {
        key: "psfprofessional_eastasian",
        label: "Professional EA",
        type: "number",
      },
      {
        key: "psfprofessional_japanese",
        label: "Professional JPN",
        type: "number",
      },
      {
        key: "psfprofessional_korean",
        label: "Professional KOR",
        type: "number",
      },
      {
        key: "psfprofessional_subtotal",
        label: "Professional Subtotal",
        type: "number",
      },
      {
        key: "psfstudent_assistants_chinese",
        label: "Student Asst. CHN",
        type: "number",
      },
      {
        key: "psfstudent_assistants_eastasian",
        label: "Student Asst. EA",
        type: "number",
      },
      {
        key: "psfstudent_assistants_japanese",
        label: "Student Asst. JPN",
        type: "number",
      },
      {
        key: "psfstudent_assistants_korean",
        label: "Student Asst. KOR",
        type: "number",
      },
      {
        key: "psfstudent_assistants_subtotal",
        label: "Student Asst. Subtotal",
        type: "number",
      },
      {
        key: "psfsupport_staff_chinese",
        label: "Support Staff CHN",
        type: "number",
      },
      {
        key: "psfsupport_staff_eastasian",
        label: "Support Staff EA",
        type: "number",
      },
      {
        key: "psfsupport_staff_japanese",
        label: "Support Staff JPN",
        type: "number",
      },
      {
        key: "psfsupport_staff_korean",
        label: "Support Staff KOR",
        type: "number",
      },
      {
        key: "psfsupport_staff_subtotal",
        label: "Support Staff Subtotal",
        type: "number",
      },
      { key: "psftotal", label: "Grand Total", type: "number" },
      { key: "psfothers", label: "Others", type: "number" },
      { key: "psfnotes", label: "Notes", type: "string" },
    ],
  },

  public_services: {
    label: "8. Public Services",
    prismaModel: "public_Services",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "pspresentations_subtotal",
        label: "Presentations",
        type: "number",
      },
      {
        key: "pspresentation_participants_subtotal",
        label: "Presentation Participants",
        type: "number",
      },
      {
        key: "psreference_transactions_subtotal",
        label: "Reference Transactions",
        type: "number",
      },
      {
        key: "pstotal_circulations_subtotal",
        label: "Total Circulations",
        type: "number",
      },
      {
        key: "pslending_requests_filled_subtotal",
        label: "ILL Lending Filled",
        type: "number",
      },
      {
        key: "pslending_requests_unfilled_subtotal",
        label: "ILL Lending Unfilled",
        type: "number",
      },
      {
        key: "psborrowing_requests_filled_subtotal",
        label: "ILL Borrowing Filled",
        type: "number",
      },
      {
        key: "psborrowing_requests_unfilled_subtotal",
        label: "ILL Borrowing Unfilled",
        type: "number",
      },
      { key: "psnotes", label: "Notes", type: "string" },
    ],
  },

  electronic: {
    label: "9. Electronic",
    prismaModel: "electronic",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "eaccompanied_computer_cd_subtotal",
        label: "Accompanied CD Subtotal",
        type: "number",
      },
      {
        key: "eaccompanied_computer_title_subtotal",
        label: "Accompanied Title Subtotal",
        type: "number",
      },
      {
        key: "efulltext_electronic_title_subtotal",
        label: "Fulltext E-Title Subtotal",
        type: "number",
      },
      {
        key: "efulltext_electronic_expenditure_subtotal",
        label: "Fulltext Expenditure",
        type: "number",
      },
      {
        key: "egift_computer_cd_subtotal",
        label: "Gift CD Subtotal",
        type: "number",
      },
      {
        key: "egift_computer_title_subtotal",
        label: "Gift Title Subtotal",
        type: "number",
      },
      {
        key: "egrand_total_cd_subtotal",
        label: "Grand Total CD",
        type: "number",
      },
      {
        key: "egrand_total_title_subtotal",
        label: "Grand Total Titles",
        type: "number",
      },
      {
        key: "eindex_electronic_title_subtotal",
        label: "Index E-Title Subtotal",
        type: "number",
      },
      {
        key: "eindex_electronic_expenditure_subtotal",
        label: "Index Expenditure",
        type: "number",
      },
      {
        key: "eonetime_computer_cd_subtotal",
        label: "One-Time CD Subtotal",
        type: "number",
      },
      {
        key: "eonetime_computer_title_subtotal",
        label: "One-Time Title Subtotal",
        type: "number",
      },
      {
        key: "eonetime_computer_expenditure_subtotal",
        label: "One-Time Expenditure",
        type: "number",
      },
      {
        key: "eprevious_total_cd_subtotal",
        label: "Previous Total CD",
        type: "number",
      },
      {
        key: "eprevious_total_title_subtotal",
        label: "Previous Total Titles",
        type: "number",
      },
      { key: "etotal_computer_cd_subtotal", label: "Total CD", type: "number" },
      {
        key: "etotal_computer_title_subtotal",
        label: "Total Titles",
        type: "number",
      },
      {
        key: "etotal_computer_expenditure_subtotal",
        label: "Total Computer Expenditure",
        type: "number",
      },
      {
        key: "etotal_electronic_title_subtotal",
        label: "Total E-Title",
        type: "number",
      },
      {
        key: "etotal_electronic_expenditure_subtotal",
        label: "Total E-Expenditure",
        type: "number",
      },
      {
        key: "etotal_expenditure_ongoing",
        label: "Total Ongoing Expenditure",
        type: "number",
      },
      {
        key: "etotal_expenditure_onetime",
        label: "Total One-Time Expenditure",
        type: "number",
      },
      {
        key: "etotal_expenditure_grandtotal",
        label: "Grand Total Expenditure",
        type: "number",
      },
      { key: "enotes", label: "Notes", type: "string" },
    ],
  },

  electronic_books: {
    label: "10. Electronic Books",
    prismaModel: "electronic_Books",
    columns: [
      { key: "library_name", label: "Institution", type: "string" },
      {
        key: "ebooks_purchased_volumes_chinese",
        label: "Purch. Vols CHN",
        type: "number",
      },
      {
        key: "ebooks_purchased_volumes_japanese",
        label: "Purch. Vols JPN",
        type: "number",
      },
      {
        key: "ebooks_purchased_volumes_korean",
        label: "Purch. Vols KOR",
        type: "number",
      },
      {
        key: "ebooks_purchased_volumes_noncjk",
        label: "Purch. Vols Non-CJK",
        type: "number",
      },
      {
        key: "ebooks_purchased_volumes_subtotal",
        label: "Purch. Vols Subtotal",
        type: "number",
      },
      {
        key: "ebooks_purchased_titles_chinese",
        label: "Purch. Titles CHN",
        type: "number",
      },
      {
        key: "ebooks_purchased_titles_japanese",
        label: "Purch. Titles JPN",
        type: "number",
      },
      {
        key: "ebooks_purchased_titles_korean",
        label: "Purch. Titles KOR",
        type: "number",
      },
      {
        key: "ebooks_purchased_titles_noncjk",
        label: "Purch. Titles Non-CJK",
        type: "number",
      },
      {
        key: "ebooks_purchased_titles_subtotal",
        label: "Purch. Titles Subtotal",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_volumes_chinese",
        label: "Non-Purch. Vols CHN",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_volumes_japanese",
        label: "Non-Purch. Vols JPN",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_volumes_korean",
        label: "Non-Purch. Vols KOR",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_volumes_noncjk",
        label: "Non-Purch. Vols Non-CJK",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_volumes_subtotal",
        label: "Non-Purch. Vols Subtotal",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_titles_chinese",
        label: "Non-Purch. Titles CHN",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_titles_japanese",
        label: "Non-Purch. Titles JPN",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_titles_korean",
        label: "Non-Purch. Titles KOR",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_titles_noncjk",
        label: "Non-Purch. Titles Non-CJK",
        type: "number",
      },
      {
        key: "ebooks_nonpurchased_titles_subtotal",
        label: "Non-Purch. Titles Subtotal",
        type: "number",
      },
      {
        key: "ebooks_subscription_volumes_subtotal",
        label: "Subscription Vols Subtotal",
        type: "number",
      },
      {
        key: "ebooks_subscription_titles_subtotal",
        label: "Subscription Titles Subtotal",
        type: "number",
      },
      { key: "ebooks_total_volumes", label: "Total Volumes", type: "number" },
      { key: "ebooks_total_titles", label: "Total Titles", type: "number" },
      {
        key: "ebooks_expenditure_grandtotal",
        label: "Grand Total Expenditure",
        type: "number",
      },
      { key: "ebooks_notes", label: "Notes", type: "string" },
    ],
  },
};
