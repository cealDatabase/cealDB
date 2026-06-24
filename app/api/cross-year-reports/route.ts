import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

// ---------------------------------------------------------------------------
// Calculation helpers — mirrors the logic in year-end-pdf/route.ts exactly
// ---------------------------------------------------------------------------

/** Parse any DB value to a number (null/undefined/'' → 0). */
function n(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

/** Sum several values, returning null only when ALL inputs are null/undefined. */
function sumWithNull(...values: any[]): number | null {
  const allNull = values.every(v => v === null || v === undefined);
  if (allNull) return null;
  return values.reduce((acc, v) => acc + n(v), 0);
}

/** Round to 2 decimal places (avoids floating-point drift). */
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ---------------------------------------------------------------------------
// Per-institution calculations
// These replicate the fetchXxxData() functions in year-end-pdf/route.ts
// ---------------------------------------------------------------------------

/**
 * Volume Holdings
 * End-year physical volumes = previous_year + added_gross − withdrawn  (per language, then subtotal)
 * This is NOT the stored vhgrandtotal field; that field stores a legacy value.
 */
function calcVolumeHoldings(vh: any): {
  endYearSubtotal: number | null;
} {
  if (!vh) return { endYearSubtotal: null };

  const prevSub  = sumWithNull(vh.vhprevious_year_chinese, vh.vhprevious_year_japanese, vh.vhprevious_year_korean, vh.vhprevious_year_noncjk);
  const addSub   = sumWithNull(vh.vhadded_gross_chinese,   vh.vhadded_gross_japanese,   vh.vhadded_gross_korean,   vh.vhadded_gross_noncjk);
  const withSub  = sumWithNull(vh.vhwithdrawn_chinese,     vh.vhwithdrawn_japanese,     vh.vhwithdrawn_korean,     vh.vhwithdrawn_noncjk);

  if (prevSub === null && addSub === null && withSub === null) return { endYearSubtotal: null };

  // Per-language end-year values (net = added − withdrawn)
  function endYearLang(
    prev: any, added: any, withdrawn: any
  ): number | null {
    if (prev === null && added === null && withdrawn === null) return null;
    return n(prev) + n(added) - n(withdrawn);
  }

  const eyChinese  = endYearLang(vh.vhprevious_year_chinese,  vh.vhadded_gross_chinese,  vh.vhwithdrawn_chinese);
  const eyJapanese = endYearLang(vh.vhprevious_year_japanese, vh.vhadded_gross_japanese, vh.vhwithdrawn_japanese);
  const eyKorean   = endYearLang(vh.vhprevious_year_korean,   vh.vhadded_gross_korean,   vh.vhwithdrawn_korean);
  const eyNonCjk   = endYearLang(vh.vhprevious_year_noncjk,   vh.vhadded_gross_noncjk,   vh.vhwithdrawn_noncjk);

  const endYearSubtotal = sumWithNull(eyChinese, eyJapanese, eyKorean, eyNonCjk);
  return { endYearSubtotal };
}

/**
 * Electronic Books
 * Total volumes = purchased_volumes_subtotal + nonpurchased_volumes_subtotal
 *
 * IMPORTANT: The DB fields ebooks_purchased_volumes_{lang} may be null for
 * older records where the form split volumes into prev+add sub-fields. In that
 * case we fall back to prev_volumes + add_volumes per language — exactly the
 * same fallback used in the purchased-volumes API and year-end-pdf route.
 */
function calcEBookVolumes(eb: any): number | null {
  if (!eb) return null;

  // Resolve per-language purchased volumes: stored field ?? (prev + add)
  function purchasedLang(lang: string): number | null {
    const stored = eb[`ebooks_purchased_volumes_${lang}`];
    if (stored !== null && stored !== undefined) return n(stored);
    const prev = eb[`ebooks_purchased_prev_volumes_${lang}`];
    const add  = eb[`ebooks_purchased_add_volumes_${lang}`];
    if ((prev === null || prev === undefined) && (add === null || add === undefined)) return null;
    return n(prev) + n(add);
  }

  const purchasedSub = sumWithNull(
    purchasedLang('chinese'),
    purchasedLang('japanese'),
    purchasedLang('korean'),
    purchasedLang('noncjk'),
  );
  const nonpurchasedSub = sumWithNull(
    eb.ebooks_nonpurchased_volumes_chinese,
    eb.ebooks_nonpurchased_volumes_japanese,
    eb.ebooks_nonpurchased_volumes_korean,
    eb.ebooks_nonpurchased_volumes_noncjk,
  );

  return sumWithNull(purchasedSub, nonpurchasedSub);
}

/**
 * Other Holdings
 * "Total Other Library Materials" = ALL 10 categories summed across all 4 languages.
 * This matches ohtotal_grandtotal in year-end-pdf fetchOtherHoldingsData().
 * Note: the stored ohgrandtotal field only covers the 5 physical categories
 *       and is NOT used here.
 */
function calcOtherHoldingsTotal(oh: any): number | null {
  if (!oh) return null;

  // Per-language grand totals across all 10 categories
  const totalChinese  = sumWithNull(oh.ohmicroform_chinese, oh.ohcarto_graphic_chinese, oh.ohaudio_chinese, oh.ohfilm_video_chinese, oh.ohdvd_chinese, oh.ohonlinemapchinese, oh.ohonlineimagechinese, oh.ohstreamingchinese, oh.ohstreamingvideochinese, oh.ohcustom1chinese, oh.ohcustom2chinese, oh.ohcustom3chinese, oh.ohcustom4chinese);
  const totalJapanese = sumWithNull(oh.ohmicroform_japanese, oh.ohcarto_graphic_japanese, oh.ohaudio_japanese, oh.ohfilm_video_japanese, oh.ohdvd_japanese, oh.ohonlinemapjapanese, oh.ohonlineimagejapanese, oh.ohstreamingjapanese, oh.ohstreamingvideojapanese, oh.ohcustom1japanese, oh.ohcustom2japanese, oh.ohcustom3japanese, oh.ohcustom4japanese);
  const totalKorean   = sumWithNull(oh.ohmicroform_korean, oh.ohcarto_graphic_korean, oh.ohaudio_korean, oh.ohfilm_video_korean, oh.ohdvd_korean, oh.ohonlinemapkorean, oh.ohonlineimagekorean, oh.ohstreamingkorean, oh.ohstreamingvideokorean, oh.ohcustom1korean, oh.ohcustom2korean, oh.ohcustom3korean, oh.ohcustom4korean);
  const totalNonCjk   = sumWithNull(oh.ohmicroform_noncjk, oh.ohcarto_graphic_noncjk, oh.ohaudio_noncjk, oh.ohfilm_video_noncjk, oh.ohdvd_noncjk, oh.ohonlinemapnoncjk, oh.ohonlineimagenoncjk, oh.ohstreamingnoncjk, oh.ohstreamingvideononcjk, oh.ohcustom1noncjk, oh.ohcustom2noncjk, oh.ohcustom3noncjk, oh.ohcustom4noncjk);

  return sumWithNull(totalChinese, totalJapanese, totalKorean, totalNonCjk);
}

/**
 * Monographic Acquisitions
 * Total volumes = purchased_subtotal + nonpurchased_subtotal
 * Both subtotals are calculated from 4 language columns (not trusted from DB stored value).
 */
function calcMonoTotalVolumes(ma: any): number | null {
  if (!ma) return null;

  const purchasedSub = sumWithNull(
    ma.mapurchased_volumes_chinese,
    ma.mapurchased_volumes_japanese,
    ma.mapurchased_volumes_korean,
    ma.mapurchased_volumes_noncjk,
  );
  const nonpurchasedSub = sumWithNull(
    ma.manonpurchased_volumes_chinese,
    ma.manonpurchased_volumes_japanese,
    ma.manonpurchased_volumes_korean,
    ma.manonpurchased_volumes_noncjk,
  );

  return sumWithNull(purchasedSub, nonpurchasedSub);
}

/**
 * Serials
 * Physical serial titles grand total = purchased + nonpurchased (all languages)
 * Electronic serial titles grand total = e-purchased + e-nonpurchased (all languages)
 * stotal_overall = sgrandtotal + s_egrandtotal (i.e. all physical + all electronic titles)
 */
function calcSerialsTotal(s: any): number | null {
  if (!s) return null;

  const purchasedSub    = sumWithNull(s.spurchased_chinese,    s.spurchased_japanese,    s.spurchased_korean,    s.spurchased_noncjk);
  const nonpurchasedSub = sumWithNull(s.snonpurchased_chinese, s.snonpurchased_japanese, s.snonpurchased_korean, s.snonpurchased_noncjk);
  const sgrandtotal     = sumWithNull(purchasedSub, nonpurchasedSub);

  const ePurchasedSub    = sumWithNull(s.s_epurchased_chinese,    s.s_epurchased_japanese,    s.s_epurchased_korean,    s.s_epurchased_noncjk);
  const eNonpurchasedSub = sumWithNull(s.s_enonpurchased_chinese, s.s_enonpurchased_japanese, s.s_enonpurchased_korean, s.s_enonpurchased_noncjk);
  const s_egrandtotal    = sumWithNull(ePurchasedSub, eNonpurchasedSub);

  return sumWithNull(sgrandtotal, s_egrandtotal);
}

/**
 * Fiscal Support
 * All subtotals must be calculated from individual language fields.
 * Manual override fields (field*_manual) take priority over calculated values
 * when they are not null — this matches the priority logic in year-end-pdf/route.ts.
 */
function calcFiscal(fs: any): {
  appropriations: number | null;
  grants: number | null;
  programSupport: number | null;
  endowments: number | null;
  totalBudget: number | null;
} {
  if (!fs) return { appropriations: null, grants: null, programSupport: null, endowments: null, totalBudget: null };

  // Appropriations: always recalculate from sub-fields; manual overrides the result.
  // This matches year-end-pdf/route.ts exactly — stored subtotals are NOT trusted.
  function langApprop(lang: string): number | null {
    const calc = sumWithNull(
      fs[`fs${lang}_appropriations_monographic`],
      fs[`fs${lang}_appropriations_serial`],
      fs[`fs${lang}_appropriations_other_material`],
      fs[`fs${lang}_appropriations_electronic`],
    );
    const calcRounded = calc !== null ? round2(calc) : null;
    const manual = fs[`fs${lang}_appropriations_subtotal_manual`];
    return (manual !== null && manual !== undefined) ? n(manual) : calcRounded;
  }

  const chineseApprop  = langApprop('chinese');
  const japaneseApprop = langApprop('japanese');
  const koreanApprop   = langApprop('korean');
  const noncjkApprop   = langApprop('noncjk');
  const calcTotalApprop = sumWithNull(chineseApprop, japaneseApprop, koreanApprop, noncjkApprop);
  const roundedCalcApprop = calcTotalApprop !== null ? round2(calcTotalApprop) : null;
  // Field21a (manual) prioritized over calculated
  const appropriations = (fs.fstotal_appropriations_manual !== null && fs.fstotal_appropriations_manual !== undefined)
    ? round2(n(fs.fstotal_appropriations_manual))
    : roundedCalcApprop;

  // Endowments: recalculate from language fields; manual overrides
  const calcEndow = sumWithNull(fs.fsendowments_chinese, fs.fsendowments_japanese, fs.fsendowments_korean, fs.fsendowments_noncjk);
  const roundedCalcEndow = calcEndow !== null ? round2(calcEndow) : null;
  const endowments = (fs.fsendowments_subtotal_manual !== null && fs.fsendowments_subtotal_manual !== undefined)
    ? round2(n(fs.fsendowments_subtotal_manual))
    : roundedCalcEndow;

  // Grants: recalculate from language fields; manual overrides
  const calcGrants = sumWithNull(fs.fsgrants_chinese, fs.fsgrants_japanese, fs.fsgrants_korean, fs.fsgrants_noncjk);
  const roundedCalcGrants = calcGrants !== null ? round2(calcGrants) : null;
  const grants = (fs.fsgrants_subtotal_manual !== null && fs.fsgrants_subtotal_manual !== undefined)
    ? round2(n(fs.fsgrants_subtotal_manual))
    : roundedCalcGrants;

  // Program Support (East Asian Program Support): recalculate; manual overrides
  const calcProgram = sumWithNull(
    fs.fseast_asian_program_support_chinese,
    fs.fseast_asian_program_support_japanese,
    fs.fseast_asian_program_support_korean,
    fs.fseast_asian_program_support_noncjk,
  );
  const roundedCalcProgram = calcProgram !== null ? round2(calcProgram) : null;
  const programSupport = (fs.fseast_asian_program_support_subtotal_manual !== null && fs.fseast_asian_program_support_subtotal_manual !== undefined)
    ? round2(n(fs.fseast_asian_program_support_subtotal_manual))
    : roundedCalcProgram;

  // Total Budget = appropriations + endowments + grants + program support (always derived)
  const calcBudget = sumWithNull(appropriations, endowments, grants, programSupport);
  const totalBudget = calcBudget !== null ? round2(calcBudget) : null;

  return { appropriations, grants, programSupport, endowments, totalBudget };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('uinf')?.value;
    const roleCookie = cookieStore.get('role')?.value;

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userRoles: string[] = [];
    try {
      userRoles = roleCookie ? JSON.parse(roleCookie) : [];
    } catch {
      userRoles = roleCookie ? [roleCookie] : [];
    }

    const isAllowed = userRoles.some((r) => ['1', '3', '4'].includes(r));
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ── Action: available years ──────────────────────────────────────────────
    if (action === 'years') {
      const years = await db.library_Year.findMany({
        select: { year: true },
        distinct: ['year'],
        where: { year: { not: 1900 } },
        orderBy: { year: 'desc' },
      });
      return NextResponse.json({
        years: years.map((y: { year: number }) => y.year),
      });
    }

    // ── Action: institutions ─────────────────────────────────────────────────
    if (action === 'institutions') {
      const libraries = await db.library.findMany({
        select: { id: true, library_name: true },
        where: {},
        orderBy: { library_name: 'asc' },
      });
      return NextResponse.json({ institutions: libraries });
    }

    // ── Action: cross-year data ──────────────────────────────────────────────
    if (action === 'data') {
      const startYearStr = searchParams.get('startYear');
      const endYearStr   = searchParams.get('endYear');
      const institutionIdsStr = searchParams.get('institutionIds'); // comma-separated, empty = all

      if (!startYearStr || !endYearStr) {
        return NextResponse.json({ error: 'startYear and endYear are required' }, { status: 400 });
      }

      const startYear = parseInt(startYearStr);
      const endYear   = parseInt(endYearStr);

      if (isNaN(startYear) || isNaN(endYear) || endYear <= startYear) {
        return NextResponse.json(
          { error: 'Invalid year range: endYear must be greater than startYear' },
          { status: 400 },
        );
      }

      // Build optional library filter
      let libraryFilter: any = {};
      if (institutionIdsStr && institutionIdsStr.trim()) {
        const ids = institutionIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (ids.length > 0) libraryFilter = { library: { in: ids } };
      }

      const yearsInRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).filter(y => y !== 1900);

      // Fetch all Library_Year records with all necessary raw fields
      // We fetch raw individual fields so we can calculate correctly (not trust stored computed fields)
      const libraryYears = await db.library_Year.findMany({
        where: {
          year: { in: yearsInRange },
          ...libraryFilter,
        },
        select: {
          id: true,
          year: true,
          library: true,
          Library: { select: { id: true, library_name: true } },

          // Volume Holdings — need raw language fields to calculate end-year correctly
          Volume_Holdings: {
            select: {
              vhprevious_year_chinese: true, vhprevious_year_japanese: true,
              vhprevious_year_korean:  true, vhprevious_year_noncjk:   true,
              vhadded_gross_chinese:   true, vhadded_gross_japanese:   true,
              vhadded_gross_korean:    true, vhadded_gross_noncjk:     true,
              vhwithdrawn_chinese:     true, vhwithdrawn_japanese:     true,
              vhwithdrawn_korean:      true, vhwithdrawn_noncjk:       true,
            },
          },

          // Electronic Books — need raw language volumes to calculate total.
          // Also fetch prev/add sub-fields as fallback for older records where
          // the combined _chinese/_japanese/etc. fields may be null.
          Electronic_Books: {
            select: {
              ebooks_purchased_volumes_chinese:         true, ebooks_purchased_volumes_japanese:         true,
              ebooks_purchased_volumes_korean:          true, ebooks_purchased_volumes_noncjk:           true,
              ebooks_purchased_prev_volumes_chinese:    true, ebooks_purchased_prev_volumes_japanese:    true,
              ebooks_purchased_prev_volumes_korean:     true, ebooks_purchased_prev_volumes_noncjk:      true,
              ebooks_purchased_add_volumes_chinese:     true, ebooks_purchased_add_volumes_japanese:     true,
              ebooks_purchased_add_volumes_korean:      true, ebooks_purchased_add_volumes_noncjk:       true,
              ebooks_nonpurchased_volumes_chinese:      true, ebooks_nonpurchased_volumes_japanese:      true,
              ebooks_nonpurchased_volumes_korean:       true, ebooks_nonpurchased_volumes_noncjk:        true,
            },
          },

          // Other Holdings — ALL category language fields for complete total
          Other_Holdings: {
            select: {
              ohmicroform_chinese: true,     ohmicroform_japanese: true,     ohmicroform_korean: true,     ohmicroform_noncjk: true,
              ohcarto_graphic_chinese: true, ohcarto_graphic_japanese: true, ohcarto_graphic_korean: true, ohcarto_graphic_noncjk: true,
              ohaudio_chinese: true,         ohaudio_japanese: true,         ohaudio_korean: true,         ohaudio_noncjk: true,
              ohfilm_video_chinese: true,    ohfilm_video_japanese: true,    ohfilm_video_korean: true,    ohfilm_video_noncjk: true,
              ohdvd_chinese: true,           ohdvd_japanese: true,           ohdvd_korean: true,           ohdvd_noncjk: true,
              ohonlinemapchinese: true,      ohonlinemapjapanese: true,      ohonlinemapkorean: true,      ohonlinemapnoncjk: true,
              ohonlineimagechinese: true,    ohonlineimagejapanese: true,    ohonlineimagekorean: true,    ohonlineimagenoncjk: true,
              ohstreamingchinese: true,      ohstreamingjapanese: true,      ohstreamingkorean: true,      ohstreamingnoncjk: true,
              ohstreamingvideochinese: true, ohstreamingvideojapanese: true, ohstreamingvideokorean: true, ohstreamingvideononcjk: true,
              ohcustom1chinese: true,        ohcustom1japanese: true,        ohcustom1korean: true,        ohcustom1noncjk: true,
              ohcustom2chinese: true,        ohcustom2japanese: true,        ohcustom2korean: true,        ohcustom2noncjk: true,
              ohcustom3chinese: true,        ohcustom3japanese: true,        ohcustom3korean: true,        ohcustom3noncjk: true,
              ohcustom4chinese: true,        ohcustom4japanese: true,        ohcustom4korean: true,        ohcustom4noncjk: true,
            },
          },

          // Monographic — need raw language volumes to compute total
          Monographic_Acquisitions: {
            select: {
              mapurchased_volumes_chinese:    true, mapurchased_volumes_japanese:    true,
              mapurchased_volumes_korean:     true, mapurchased_volumes_noncjk:      true,
              manonpurchased_volumes_chinese: true, manonpurchased_volumes_japanese: true,
              manonpurchased_volumes_korean:  true, manonpurchased_volumes_noncjk:   true,
            },
          },

          // Serials — need raw language fields to compute grand totals
          Serials: {
            select: {
              spurchased_chinese:      true, spurchased_japanese:      true,
              spurchased_korean:       true, spurchased_noncjk:        true,
              snonpurchased_chinese:   true, snonpurchased_japanese:   true,
              snonpurchased_korean:    true, snonpurchased_noncjk:     true,
              s_epurchased_chinese:    true, s_epurchased_japanese:    true,
              s_epurchased_korean:     true, s_epurchased_noncjk:      true,
              s_enonpurchased_chinese: true, s_enonpurchased_japanese: true,
              s_enonpurchased_korean:  true, s_enonpurchased_noncjk:   true,
            },
          },

          // Fiscal — ALL individual fields + manual overrides
          Fiscal_Support: {
            select: {
              // Appropriations by language × 4 sub-categories
              fschinese_appropriations_monographic:         true,
              fschinese_appropriations_serial:              true,
              fschinese_appropriations_other_material:      true,
              fschinese_appropriations_electronic:          true,
              fschinese_appropriations_subtotal:            true,
              fschinese_appropriations_subtotal_manual:     true,
              fsjapanese_appropriations_monographic:        true,
              fsjapanese_appropriations_serial:             true,
              fsjapanese_appropriations_other_material:     true,
              fsjapanese_appropriations_electronic:         true,
              fsjapanese_appropriations_subtotal:           true,
              fsjapanese_appropriations_subtotal_manual:    true,
              fskorean_appropriations_monographic:          true,
              fskorean_appropriations_serial:               true,
              fskorean_appropriations_other_material:       true,
              fskorean_appropriations_electronic:           true,
              fskorean_appropriations_subtotal:             true,
              fskorean_appropriations_subtotal_manual:      true,
              fsnoncjk_appropriations_monographic:          true,
              fsnoncjk_appropriations_serial:               true,
              fsnoncjk_appropriations_other_material:       true,
              fsnoncjk_appropriations_electronic:           true,
              fsnoncjk_appropriations_subtotal:             true,
              fsnoncjk_appropriations_subtotal_manual:      true,
              fstotal_appropriations:                       true,
              fstotal_appropriations_manual:                true,
              // Endowments
              fsendowments_chinese:                         true,
              fsendowments_japanese:                        true,
              fsendowments_korean:                          true,
              fsendowments_noncjk:                          true,
              fsendowments_subtotal:                        true,
              fsendowments_subtotal_manual:                 true,
              // Grants
              fsgrants_chinese:                             true,
              fsgrants_japanese:                            true,
              fsgrants_korean:                              true,
              fsgrants_noncjk:                              true,
              fsgrants_subtotal:                            true,
              fsgrants_subtotal_manual:                     true,
              // East Asian Program Support
              fseast_asian_program_support_chinese:                         true,
              fseast_asian_program_support_japanese:                        true,
              fseast_asian_program_support_korean:                          true,
              fseast_asian_program_support_noncjk:                          true,
              fseast_asian_program_support_subtotal:                        true,
              fseast_asian_program_support_subtotal_manual:                 true,
              // Total budget (stored; we re-derive it anyway)
              fstotal_acquisition_budget:                   true,
            },
          },
        },
        orderBy: [{ year: 'asc' }, { library: 'asc' }],
      });

      // ── Aggregate per year ───────────────────────────────────────────────
      type YearAccum = {
        year: number;
        institutionCount: number;
        grandTotalWithEBooks: number | null;
        grandTotalWithoutEBooks: number | null;
        totalVolumesWithEBooks: number | null;
        totalVolumesWithoutEBooks: number | null;
        totalOtherMaterials: number | null;
        monographAdditions: number | null;
        serials: number | null;
        appropriations: number | null;
        grants: number | null;
        programSupport: number | null;
        endowments: number | null;
        totalBudget: number | null;
      };

      const yearData: Record<number, YearAccum> = {};

      function addNullable(existing: number | null, incoming: number | null): number | null {
        if (incoming === null) return existing; // institution had no data for this field — skip
        return (existing ?? 0) + incoming;
      }

      for (const ly of libraryYears) {
        const year = ly.year;
        if (!yearData[year]) {
          yearData[year] = {
            year,
            institutionCount: 0,
            grandTotalWithEBooks: null,
            grandTotalWithoutEBooks: null,
            totalVolumesWithEBooks: null,
            totalVolumesWithoutEBooks: null,
            totalOtherMaterials: null,
            monographAdditions: null,
            serials: null,
            appropriations: null,
            grants: null,
            programSupport: null,
            endowments: null,
            totalBudget: null,
          };
        }

        const yd = yearData[year];
        yd.institutionCount++;

        // ── Volume Holdings ────────────────────────────────────────────────
        const { endYearSubtotal: physVols } = calcVolumeHoldings(ly.Volume_Holdings);

        // ── E-Book Volumes ─────────────────────────────────────────────────
        const ebookVols = calcEBookVolumes(ly.Electronic_Books);

        // ── Other Holdings ─────────────────────────────────────────────────
        const otherTotal = calcOtherHoldingsTotal(ly.Other_Holdings);

        // ── Grand Total Materials ──────────────────────────────────────────
        // = physical end-year volumes + other library materials
        // (matches grand_total_without_ebooks in year-end-pdf)
        const grandWithout = (physVols !== null || otherTotal !== null)
          ? sumWithNull(physVols, otherTotal)
          : null;
        // With e-books adds ebook volumes
        const grandWith = (physVols !== null || ebookVols !== null || otherTotal !== null)
          ? sumWithNull(physVols, ebookVols, otherTotal)
          : null;

        yd.grandTotalWithEBooks    = addNullable(yd.grandTotalWithEBooks,    grandWith);
        yd.grandTotalWithoutEBooks = addNullable(yd.grandTotalWithoutEBooks, grandWithout);

        // ── Total Volumes ──────────────────────────────────────────────────
        const totalVolsWith    = (physVols !== null || ebookVols !== null) ? sumWithNull(physVols, ebookVols) : null;
        const totalVolsWithout = physVols;

        yd.totalVolumesWithEBooks    = addNullable(yd.totalVolumesWithEBooks,    totalVolsWith);
        yd.totalVolumesWithoutEBooks = addNullable(yd.totalVolumesWithoutEBooks, totalVolsWithout);

        // ── Other Materials ────────────────────────────────────────────────
        yd.totalOtherMaterials = addNullable(yd.totalOtherMaterials, otherTotal);

        // ── Monograph Additions ────────────────────────────────────────────
        const monoVols = calcMonoTotalVolumes(ly.Monographic_Acquisitions);
        yd.monographAdditions = addNullable(yd.monographAdditions, monoVols);

        // ── Serials ────────────────────────────────────────────────────────
        const serialTotal = calcSerialsTotal(ly.Serials);
        yd.serials = addNullable(yd.serials, serialTotal);

        // ── Fiscal ────────────────────────────────────────────────────────
        const fiscal = calcFiscal(ly.Fiscal_Support);
        yd.appropriations = addNullable(yd.appropriations, fiscal.appropriations);
        yd.grants         = addNullable(yd.grants,         fiscal.grants);
        yd.programSupport = addNullable(yd.programSupport, fiscal.programSupport);
        yd.endowments     = addNullable(yd.endowments,     fiscal.endowments);
        yd.totalBudget    = addNullable(yd.totalBudget,    fiscal.totalBudget);
      }

      // ── Compute growth rates ─────────────────────────────────────────────
      function growthRate(curr: number | null, prev: number | null): number | null {
        if (curr === null || prev === null || prev === 0) return null;
        return Math.round(((curr - prev) / prev) * 10000) / 100; // 2 decimal places
      }

      const sortedYears = yearsInRange.filter(y => yearData[y]);
      const result = sortedYears.map((year, idx) => {
        const curr = yearData[year];
        const prev = idx > 0 ? yearData[sortedYears[idx - 1]] : null;

        return {
          year,
          institutionCount: curr.institutionCount,
          materials: {
            grandTotalWithEBooks:         curr.grandTotalWithEBooks,
            grandTotalWithEBooksGrowth:   growthRate(curr.grandTotalWithEBooks,    prev?.grandTotalWithEBooks    ?? null),
            grandTotalWithoutEBooks:      curr.grandTotalWithoutEBooks,
            grandTotalWithoutEBooksGrowth: growthRate(curr.grandTotalWithoutEBooks, prev?.grandTotalWithoutEBooks ?? null),
            totalVolumesWithEBooks:       curr.totalVolumesWithEBooks,
            totalVolumesWithEBooksGrowth: growthRate(curr.totalVolumesWithEBooks,   prev?.totalVolumesWithEBooks  ?? null),
            totalVolumesWithoutEBooks:    curr.totalVolumesWithoutEBooks,
            totalVolumesWithoutEBooksGrowth: growthRate(curr.totalVolumesWithoutEBooks, prev?.totalVolumesWithoutEBooks ?? null),
            totalOtherMaterials:          curr.totalOtherMaterials,
            totalOtherMaterialsGrowth:    growthRate(curr.totalOtherMaterials,      prev?.totalOtherMaterials     ?? null),
            monographAdditions:           curr.monographAdditions,
            monographAdditionsGrowth:     growthRate(curr.monographAdditions,       prev?.monographAdditions      ?? null),
            serials:                      curr.serials,
            serialsGrowth:                growthRate(curr.serials,                  prev?.serials                 ?? null),
          },
          fiscal: {
            appropriations:       curr.appropriations,
            appropriationsGrowth: growthRate(curr.appropriations, prev?.appropriations ?? null),
            grants:               curr.grants,
            grantsGrowth:         growthRate(curr.grants,         prev?.grants         ?? null),
            programSupport:       curr.programSupport,
            programSupportGrowth: growthRate(curr.programSupport, prev?.programSupport ?? null),
            endowments:           curr.endowments,
            endowmentsGrowth:     growthRate(curr.endowments,     prev?.endowments     ?? null),
            totalBudget:          curr.totalBudget,
            totalBudgetGrowth:    growthRate(curr.totalBudget,    prev?.totalBudget    ?? null),
          },
        };
      });

      return NextResponse.json({ data: result });
    }

    // ── Action: per-institution breakdown ────────────────────────────────────
    // Returns the same metrics as 'data' but split per institution, so the
    // frontend can render a drill-down row for each selected institution.
    if (action === 'institution-data') {
      const startYearStr = searchParams.get('startYear');
      const endYearStr   = searchParams.get('endYear');
      const institutionIdsStr = searchParams.get('institutionIds');

      if (!startYearStr || !endYearStr) {
        return NextResponse.json({ error: 'startYear and endYear are required' }, { status: 400 });
      }

      const startYear = parseInt(startYearStr);
      const endYear   = parseInt(endYearStr);

      if (isNaN(startYear) || isNaN(endYear) || endYear <= startYear) {
        return NextResponse.json({ error: 'Invalid year range' }, { status: 400 });
      }

      // Which institutions to break down — must be explicitly specified
      let institutionIds: number[] = [];
      if (institutionIdsStr && institutionIdsStr.trim()) {
        institutionIds = institutionIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
      if (institutionIds.length === 0) {
        return NextResponse.json({ error: 'institutionIds required for institution-data action' }, { status: 400 });
      }

      const yearsInRange = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i,
      ).filter(y => y !== 1900);

      // Fetch raw records — same select shape as 'data' action
      const libraryYears = await db.library_Year.findMany({
        where: {
          year: { in: yearsInRange },
          library: { in: institutionIds },
        },
        select: {
          id: true, year: true, library: true,
          Library: { select: { id: true, library_name: true } },
          Volume_Holdings: {
            select: {
              vhprevious_year_chinese: true, vhprevious_year_japanese: true,
              vhprevious_year_korean:  true, vhprevious_year_noncjk:   true,
              vhadded_gross_chinese:   true, vhadded_gross_japanese:   true,
              vhadded_gross_korean:    true, vhadded_gross_noncjk:     true,
              vhwithdrawn_chinese:     true, vhwithdrawn_japanese:     true,
              vhwithdrawn_korean:      true, vhwithdrawn_noncjk:       true,
            },
          },
          Electronic_Books: {
            select: {
              ebooks_purchased_volumes_chinese:         true, ebooks_purchased_volumes_japanese:         true,
              ebooks_purchased_volumes_korean:          true, ebooks_purchased_volumes_noncjk:           true,
              ebooks_purchased_prev_volumes_chinese:    true, ebooks_purchased_prev_volumes_japanese:    true,
              ebooks_purchased_prev_volumes_korean:     true, ebooks_purchased_prev_volumes_noncjk:      true,
              ebooks_purchased_add_volumes_chinese:     true, ebooks_purchased_add_volumes_japanese:     true,
              ebooks_purchased_add_volumes_korean:      true, ebooks_purchased_add_volumes_noncjk:       true,
              ebooks_nonpurchased_volumes_chinese:      true, ebooks_nonpurchased_volumes_japanese:      true,
              ebooks_nonpurchased_volumes_korean:       true, ebooks_nonpurchased_volumes_noncjk:        true,
            },
          },
          Other_Holdings: {
            select: {
              ohmicroform_chinese: true,     ohmicroform_japanese: true,     ohmicroform_korean: true,     ohmicroform_noncjk: true,
              ohcarto_graphic_chinese: true, ohcarto_graphic_japanese: true, ohcarto_graphic_korean: true, ohcarto_graphic_noncjk: true,
              ohaudio_chinese: true,         ohaudio_japanese: true,         ohaudio_korean: true,         ohaudio_noncjk: true,
              ohfilm_video_chinese: true,    ohfilm_video_japanese: true,    ohfilm_video_korean: true,    ohfilm_video_noncjk: true,
              ohdvd_chinese: true,           ohdvd_japanese: true,           ohdvd_korean: true,           ohdvd_noncjk: true,
              ohonlinemapchinese: true,      ohonlinemapjapanese: true,      ohonlinemapkorean: true,      ohonlinemapnoncjk: true,
              ohonlineimagechinese: true,    ohonlineimagejapanese: true,    ohonlineimagekorean: true,    ohonlineimagenoncjk: true,
              ohstreamingchinese: true,      ohstreamingjapanese: true,      ohstreamingkorean: true,      ohstreamingnoncjk: true,
              ohstreamingvideochinese: true, ohstreamingvideojapanese: true, ohstreamingvideokorean: true, ohstreamingvideononcjk: true,
              ohcustom1chinese: true,        ohcustom1japanese: true,        ohcustom1korean: true,        ohcustom1noncjk: true,
              ohcustom2chinese: true,        ohcustom2japanese: true,        ohcustom2korean: true,        ohcustom2noncjk: true,
              ohcustom3chinese: true,        ohcustom3japanese: true,        ohcustom3korean: true,        ohcustom3noncjk: true,
              ohcustom4chinese: true,        ohcustom4japanese: true,        ohcustom4korean: true,        ohcustom4noncjk: true,
            },
          },
          Monographic_Acquisitions: {
            select: {
              mapurchased_volumes_chinese:    true, mapurchased_volumes_japanese:    true,
              mapurchased_volumes_korean:     true, mapurchased_volumes_noncjk:      true,
              manonpurchased_volumes_chinese: true, manonpurchased_volumes_japanese: true,
              manonpurchased_volumes_korean:  true, manonpurchased_volumes_noncjk:   true,
            },
          },
          Serials: {
            select: {
              spurchased_chinese:      true, spurchased_japanese:      true,
              spurchased_korean:       true, spurchased_noncjk:        true,
              snonpurchased_chinese:   true, snonpurchased_japanese:   true,
              snonpurchased_korean:    true, snonpurchased_noncjk:     true,
              s_epurchased_chinese:    true, s_epurchased_japanese:    true,
              s_epurchased_korean:     true, s_epurchased_noncjk:      true,
              s_enonpurchased_chinese: true, s_enonpurchased_japanese: true,
              s_enonpurchased_korean:  true, s_enonpurchased_noncjk:   true,
            },
          },
          Fiscal_Support: {
            select: {
              fschinese_appropriations_monographic:         true, fschinese_appropriations_serial:              true,
              fschinese_appropriations_other_material:      true, fschinese_appropriations_electronic:          true,
              fschinese_appropriations_subtotal:            true, fschinese_appropriations_subtotal_manual:     true,
              fsjapanese_appropriations_monographic:        true, fsjapanese_appropriations_serial:             true,
              fsjapanese_appropriations_other_material:     true, fsjapanese_appropriations_electronic:         true,
              fsjapanese_appropriations_subtotal:           true, fsjapanese_appropriations_subtotal_manual:    true,
              fskorean_appropriations_monographic:          true, fskorean_appropriations_serial:               true,
              fskorean_appropriations_other_material:       true, fskorean_appropriations_electronic:           true,
              fskorean_appropriations_subtotal:             true, fskorean_appropriations_subtotal_manual:      true,
              fsnoncjk_appropriations_monographic:          true, fsnoncjk_appropriations_serial:               true,
              fsnoncjk_appropriations_other_material:       true, fsnoncjk_appropriations_electronic:           true,
              fsnoncjk_appropriations_subtotal:             true, fsnoncjk_appropriations_subtotal_manual:      true,
              fstotal_appropriations:                       true, fstotal_appropriations_manual:                true,
              fsendowments_chinese:                         true, fsendowments_japanese:                        true,
              fsendowments_korean:                          true, fsendowments_noncjk:                          true,
              fsendowments_subtotal:                        true, fsendowments_subtotal_manual:                 true,
              fsgrants_chinese:                             true, fsgrants_japanese:                            true,
              fsgrants_korean:                              true, fsgrants_noncjk:                              true,
              fsgrants_subtotal:                            true, fsgrants_subtotal_manual:                     true,
              fseast_asian_program_support_chinese:                         true, fseast_asian_program_support_japanese:                        true,
              fseast_asian_program_support_korean:                          true, fseast_asian_program_support_noncjk:                          true,
              fseast_asian_program_support_subtotal:                        true, fseast_asian_program_support_subtotal_manual:                 true,
              fstotal_acquisition_budget:                   true,
            },
          },
        },
        orderBy: [{ library: 'asc' }, { year: 'asc' }],
      });

      // Group by institution → per-year metric object
      // Map: institutionId → { name, years: { year → metrics } }
      const instMap: Record<number, {
        id: number;
        name: string;
        yearData: Record<number, {
          grandTotalWithEBooks: number | null;
          grandTotalWithoutEBooks: number | null;
          totalVolumesWithEBooks: number | null;
          totalVolumesWithoutEBooks: number | null;
          totalOtherMaterials: number | null;
          monographAdditions: number | null;
          serials: number | null;
          appropriations: number | null;
          grants: number | null;
          programSupport: number | null;
          endowments: number | null;
          totalBudget: number | null;
        }>;
      }> = {};

      for (const ly of libraryYears) {
        const libId = ly.library;
        if (!libId) continue;

        if (!instMap[libId]) {
          instMap[libId] = {
            id: libId,
            name: ly.Library?.library_name ?? `Institution ${libId}`,
            yearData: {},
          };
        }

        const { endYearSubtotal: physVols } = calcVolumeHoldings(ly.Volume_Holdings);
        const ebookVols  = calcEBookVolumes(ly.Electronic_Books);
        const otherTotal = calcOtherHoldingsTotal(ly.Other_Holdings);
        const monoVols   = calcMonoTotalVolumes(ly.Monographic_Acquisitions);
        const serialTot  = calcSerialsTotal(ly.Serials);
        const fiscal     = calcFiscal(ly.Fiscal_Support);

        const grandWith    = (physVols !== null || ebookVols !== null || otherTotal !== null) ? sumWithNull(physVols, ebookVols, otherTotal) : null;
        const grandWithout = (physVols !== null || otherTotal !== null) ? sumWithNull(physVols, otherTotal) : null;
        const totalVolsWith    = (physVols !== null || ebookVols !== null) ? sumWithNull(physVols, ebookVols) : null;

        instMap[libId].yearData[ly.year] = {
          grandTotalWithEBooks:    grandWith,
          grandTotalWithoutEBooks: grandWithout,
          totalVolumesWithEBooks:  totalVolsWith,
          totalVolumesWithoutEBooks: physVols,
          totalOtherMaterials:     otherTotal,
          monographAdditions:      monoVols,
          serials:                 serialTot,
          ...fiscal,
        };
      }

      // Build the response: array of institutions, each with sorted yearly rows + growth rates
      function growthRate(curr: number | null, prev: number | null): number | null {
        if (curr === null || prev === null || prev === 0) return null;
        return Math.round(((curr - prev) / prev) * 10000) / 100;
      }

      const institutions = Object.values(instMap).map(inst => {
        const sortedYears = yearsInRange.filter(y => inst.yearData[y]);
        const yearRows = sortedYears.map((year, idx) => {
          const curr = inst.yearData[year];
          const prev = idx > 0 ? inst.yearData[sortedYears[idx - 1]] : null;
          return {
            year,
            materials: {
              grandTotalWithEBooks:            curr.grandTotalWithEBooks,
              grandTotalWithEBooksGrowth:      growthRate(curr.grandTotalWithEBooks,    prev?.grandTotalWithEBooks    ?? null),
              grandTotalWithoutEBooks:         curr.grandTotalWithoutEBooks,
              grandTotalWithoutEBooksGrowth:   growthRate(curr.grandTotalWithoutEBooks, prev?.grandTotalWithoutEBooks ?? null),
              totalVolumesWithEBooks:          curr.totalVolumesWithEBooks,
              totalVolumesWithEBooksGrowth:    growthRate(curr.totalVolumesWithEBooks,  prev?.totalVolumesWithEBooks  ?? null),
              totalVolumesWithoutEBooks:       curr.totalVolumesWithoutEBooks,
              totalVolumesWithoutEBooksGrowth: growthRate(curr.totalVolumesWithoutEBooks, prev?.totalVolumesWithoutEBooks ?? null),
              totalOtherMaterials:             curr.totalOtherMaterials,
              totalOtherMaterialsGrowth:       growthRate(curr.totalOtherMaterials,    prev?.totalOtherMaterials     ?? null),
              monographAdditions:              curr.monographAdditions,
              monographAdditionsGrowth:        growthRate(curr.monographAdditions,     prev?.monographAdditions      ?? null),
              serials:                         curr.serials,
              serialsGrowth:                   growthRate(curr.serials,                prev?.serials                 ?? null),
            },
            fiscal: {
              appropriations:       curr.appropriations,
              appropriationsGrowth: growthRate(curr.appropriations, prev?.appropriations ?? null),
              grants:               curr.grants,
              grantsGrowth:         growthRate(curr.grants,         prev?.grants         ?? null),
              programSupport:       curr.programSupport,
              programSupportGrowth: growthRate(curr.programSupport, prev?.programSupport ?? null),
              endowments:           curr.endowments,
              endowmentsGrowth:     growthRate(curr.endowments,     prev?.endowments     ?? null),
              totalBudget:          curr.totalBudget,
              totalBudgetGrowth:    growthRate(curr.totalBudget,    prev?.totalBudget    ?? null),
            },
          };
        });
        return { id: inst.id, name: inst.name, years: yearRows };
      });

      // Sort by institution name
      institutions.sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({ institutions });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cross-year reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
