import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { PdfExporter } from '@/lib/pdfExporter';
import {
  getTable1Config,
  getTable2Config,
  getTable3_1Config,
  getTable3_2Config,
  getTable4_1Config,
  getTable4_2Config,
  getTable4_3Config,
  getTable5Config,
  getTable6_1Config,
  getTable6_2Config,
  getTable7Config,
  getTable8Config,
  getTable9_1Config,
  getTable9_2Config,
  getTable10_1Config,
  getTable10_2Config,
} from '@/lib/pdfTableDefinitions';

const prisma = db;

// Helper function for calculations - treats null as 0 for math operations
function parseNum(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function for subtotal calculations - returns null if all inputs are null
function sumWithNull(...values: any[]): number | null {
  const allNull = values.every(v => v === null || v === undefined || v === '');
  if (allNull) return null;
  return values.reduce((sum, val) => sum + parseNum(val), 0);
}

// Helper function to round to 2 decimal places
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Convert Prisma Decimal to number
function toNum(value: any): any {
  if (value !== null && value !== undefined && typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }
  return value;
}

// Safely get nested value from an object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Build a set of library_year IDs that have a specific form submitted,
// based on the Entry_Status table (the authoritative participation tracker).
// For older years without Entry_Status records, sets will be empty → filterByParticipation
// will fall back to returning all data.
async function fetchParticipationSets(year: number): Promise<Record<string, Set<number>>> {
  const entries = await prisma.library_Year.findMany({
    where: { year },
    select: { id: true, Entry_Status: true },
  });

  const sets: Record<string, Set<number>> = {
    monographic_acquisitions: new Set(),
    volume_holdings: new Set(),
    serials: new Set(),
    other_holdings: new Set(),
    unprocessed_backlog_materials: new Set(),
    fiscal_support: new Set(),
    personnel_support_fte: new Set(),
    public_services: new Set(),
    electronic: new Set(),
    electronic_books: new Set(),
  };

  for (const ly of entries) {
    const es = ly.Entry_Status;
    if (!es) continue;
    if (es.monographic_acquisitions) sets.monographic_acquisitions.add(ly.id);
    if (es.volume_holdings) sets.volume_holdings.add(ly.id);
    if (es.serials) sets.serials.add(ly.id);
    if (es.other_holdings) sets.other_holdings.add(ly.id);
    if (es.unprocessed_backlog_materials) sets.unprocessed_backlog_materials.add(ly.id);
    if (es.fiscal_support) sets.fiscal_support.add(ly.id);
    if (es.personnel_support_fte) sets.personnel_support_fte.add(ly.id);
    if (es.public_services) sets.public_services.add(ly.id);
    if (es.electronic) sets.electronic.add(ly.id);
    if (es.electronic_books) sets.electronic_books.add(ly.id);
  }

  return sets;
}

// Filter form data to only include institutions whose Entry_Status has that form flagged.
// If participatingIds is empty (older years without Entry_Status), return all data as-is.
function filterByParticipation(data: any[], participatingIds: Set<number>): any[] {
  if (participatingIds.size === 0) return data;
  return data.filter(record => {
    const lyId = record.Library_Year?.id;
    return lyId && participatingIds.has(lyId);
  });
}

// =============================================================================
// Data fetching functions
// =============================================================================

async function fetchMonographicData(year: number) {
  const raw = await prisma.monographic_Acquisitions.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    // Convert decimals
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    // Calculate subtotals
    r.mapurchased_titles_subtotal = sumWithNull(r.mapurchased_titles_chinese, r.mapurchased_titles_japanese, r.mapurchased_titles_korean, r.mapurchased_titles_noncjk);
    r.mapurchased_volumes_subtotal = sumWithNull(r.mapurchased_volumes_chinese, r.mapurchased_volumes_japanese, r.mapurchased_volumes_korean, r.mapurchased_volumes_noncjk);
    r.manonpurchased_titles_subtotal = sumWithNull(r.manonpurchased_titles_chinese, r.manonpurchased_titles_japanese, r.manonpurchased_titles_korean, r.manonpurchased_titles_noncjk);
    r.manonpurchased_volumes_subtotal = sumWithNull(r.manonpurchased_volumes_chinese, r.manonpurchased_volumes_japanese, r.manonpurchased_volumes_korean, r.manonpurchased_volumes_noncjk);
    r.matotal_titles = sumWithNull(r.mapurchased_titles_subtotal, r.manonpurchased_titles_subtotal);
    r.matotal_volumes = sumWithNull(r.mapurchased_volumes_subtotal, r.manonpurchased_volumes_subtotal);

    // Per-language totals for Table 1
    r.matotal_titles_chinese = sumWithNull(r.mapurchased_titles_chinese, r.manonpurchased_titles_chinese);
    r.matotal_titles_japanese = sumWithNull(r.mapurchased_titles_japanese, r.manonpurchased_titles_japanese);
    r.matotal_titles_korean = sumWithNull(r.mapurchased_titles_korean, r.manonpurchased_titles_korean);
    r.matotal_titles_noncjk = sumWithNull(r.mapurchased_titles_noncjk, r.manonpurchased_titles_noncjk);
    r.matotal_volumes_chinese = sumWithNull(r.mapurchased_volumes_chinese, r.manonpurchased_volumes_chinese);
    r.matotal_volumes_japanese = sumWithNull(r.mapurchased_volumes_japanese, r.manonpurchased_volumes_japanese);
    r.matotal_volumes_korean = sumWithNull(r.mapurchased_volumes_korean, r.manonpurchased_volumes_korean);
    r.matotal_volumes_noncjk = sumWithNull(r.mapurchased_volumes_noncjk, r.manonpurchased_volumes_noncjk);

    return r;
  });
}

async function fetchVolumeHoldingsData(year: number) {
  const raw = await prisma.volume_Holdings.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    // Subtotals
    r.vhprevious_year_subtotal = sumWithNull(r.vhprevious_year_chinese, r.vhprevious_year_japanese, r.vhprevious_year_korean, r.vhprevious_year_noncjk);
    r.vhadded_gross_subtotal = sumWithNull(r.vhadded_gross_chinese, r.vhadded_gross_japanese, r.vhadded_gross_korean, r.vhadded_gross_noncjk);
    r.vhwithdrawn_subtotal = sumWithNull(r.vhwithdrawn_chinese, r.vhwithdrawn_japanese, r.vhwithdrawn_korean, r.vhwithdrawn_noncjk);

    // Net = Added - Withdrawn (per language)
    r.vhnet_chinese = sumWithNull(r.vhadded_gross_chinese, -(parseNum(r.vhwithdrawn_chinese)));
    r.vhnet_japanese = sumWithNull(r.vhadded_gross_japanese, -(parseNum(r.vhwithdrawn_japanese)));
    r.vhnet_korean = sumWithNull(r.vhadded_gross_korean, -(parseNum(r.vhwithdrawn_korean)));
    r.vhnet_noncjk = sumWithNull(r.vhadded_gross_noncjk, -(parseNum(r.vhwithdrawn_noncjk)));
    // Fix: compute net correctly when both added and withdrawn are null
    if (r.vhadded_gross_chinese === null && r.vhwithdrawn_chinese === null) r.vhnet_chinese = null;
    if (r.vhadded_gross_japanese === null && r.vhwithdrawn_japanese === null) r.vhnet_japanese = null;
    if (r.vhadded_gross_korean === null && r.vhwithdrawn_korean === null) r.vhnet_korean = null;
    if (r.vhadded_gross_noncjk === null && r.vhwithdrawn_noncjk === null) r.vhnet_noncjk = null;
    r.vhnet_subtotal = sumWithNull(r.vhnet_chinese, r.vhnet_japanese, r.vhnet_korean, r.vhnet_noncjk);

    // End year = Previous + Net (per language)
    r.vhend_year_chinese = sumWithNull(r.vhprevious_year_chinese, r.vhnet_chinese);
    r.vhend_year_japanese = sumWithNull(r.vhprevious_year_japanese, r.vhnet_japanese);
    r.vhend_year_korean = sumWithNull(r.vhprevious_year_korean, r.vhnet_korean);
    r.vhend_year_noncjk = sumWithNull(r.vhprevious_year_noncjk, r.vhnet_noncjk);
    if (r.vhprevious_year_chinese === null && r.vhnet_chinese === null) r.vhend_year_chinese = null;
    if (r.vhprevious_year_japanese === null && r.vhnet_japanese === null) r.vhend_year_japanese = null;
    if (r.vhprevious_year_korean === null && r.vhnet_korean === null) r.vhend_year_korean = null;
    if (r.vhprevious_year_noncjk === null && r.vhnet_noncjk === null) r.vhend_year_noncjk = null;
    r.vhend_year_subtotal = sumWithNull(r.vhend_year_chinese, r.vhend_year_japanese, r.vhend_year_korean, r.vhend_year_noncjk);

    return r;
  });
}

async function fetchSerialsData(year: number) {
  const raw = await prisma.serials.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    r.s_epurchased_subtotal = sumWithNull(r.s_epurchased_chinese, r.s_epurchased_japanese, r.s_epurchased_korean, r.s_epurchased_noncjk);
    r.spurchased_subtotal = sumWithNull(r.spurchased_chinese, r.spurchased_japanese, r.spurchased_korean, r.spurchased_noncjk);
    r.s_enonpurchased_subtotal = sumWithNull(r.s_enonpurchased_chinese, r.s_enonpurchased_japanese, r.s_enonpurchased_korean, r.s_enonpurchased_noncjk);
    r.snonpurchased_subtotal = sumWithNull(r.snonpurchased_chinese, r.snonpurchased_japanese, r.snonpurchased_korean, r.snonpurchased_noncjk);

    r.s_etotal_chinese = sumWithNull(r.s_epurchased_chinese, r.s_enonpurchased_chinese);
    r.s_etotal_japanese = sumWithNull(r.s_epurchased_japanese, r.s_enonpurchased_japanese);
    r.s_etotal_korean = sumWithNull(r.s_epurchased_korean, r.s_enonpurchased_korean);
    r.s_etotal_noncjk = sumWithNull(r.s_epurchased_noncjk, r.s_enonpurchased_noncjk);
    r.s_egrandtotal = sumWithNull(r.s_epurchased_subtotal, r.s_enonpurchased_subtotal);

    r.stotal_chinese = sumWithNull(r.spurchased_chinese, r.snonpurchased_chinese);
    r.stotal_japanese = sumWithNull(r.spurchased_japanese, r.snonpurchased_japanese);
    r.stotal_korean = sumWithNull(r.spurchased_korean, r.snonpurchased_korean);
    r.stotal_noncjk = sumWithNull(r.spurchased_noncjk, r.snonpurchased_noncjk);
    r.sgrandtotal = sumWithNull(r.spurchased_subtotal, r.snonpurchased_subtotal);

    r.stotal_overall = sumWithNull(r.s_egrandtotal, r.sgrandtotal);
    // Per-language grand totals for Table 3-2
    r.stotal_overall_chinese = sumWithNull(r.s_etotal_chinese, r.stotal_chinese);
    r.stotal_overall_japanese = sumWithNull(r.s_etotal_japanese, r.stotal_japanese);
    r.stotal_overall_korean = sumWithNull(r.s_etotal_korean, r.stotal_korean);
    r.stotal_overall_noncjk = sumWithNull(r.s_etotal_noncjk, r.stotal_noncjk);

    return r;
  });
}

async function fetchOtherHoldingsData(year: number) {
  const raw = await prisma.other_Holdings.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    // Physical subtotals
    r.ohmicroform_subtotal = sumWithNull(r.ohmicroform_chinese, r.ohmicroform_japanese, r.ohmicroform_korean, r.ohmicroform_noncjk);
    r.ohcarto_graphic_subtotal = sumWithNull(r.ohcarto_graphic_chinese, r.ohcarto_graphic_japanese, r.ohcarto_graphic_korean, r.ohcarto_graphic_noncjk);
    r.ohaudio_subtotal = sumWithNull(r.ohaudio_chinese, r.ohaudio_japanese, r.ohaudio_korean, r.ohaudio_noncjk);
    r.ohfilm_video_subtotal = sumWithNull(r.ohfilm_video_chinese, r.ohfilm_video_japanese, r.ohfilm_video_korean, r.ohfilm_video_noncjk);
    r.ohdvd_subtotal = sumWithNull(r.ohdvd_chinese, r.ohdvd_japanese, r.ohdvd_korean, r.ohdvd_noncjk);

    // Online subtotals
    r.ohonlinemapsubtotal = sumWithNull(r.ohonlinemapchinese, r.ohonlinemapjapanese, r.ohonlinemapkorean, r.ohonlinemapnoncjk);
    r.ohonlineimagesubtotal = sumWithNull(r.ohonlineimagechinese, r.ohonlineimagejapanese, r.ohonlineimagekorean, r.ohonlineimagenoncjk);
    r.ohstreamingsubtotal = sumWithNull(r.ohstreamingchinese, r.ohstreamingjapanese, r.ohstreamingkorean, r.ohstreamingnoncjk);
    r.ohstreamingvideosubtotal = sumWithNull(r.ohstreamingvideochinese, r.ohstreamingvideojapanese, r.ohstreamingvideokorean, r.ohstreamingvideononcjk);

    // Custom subtotals
    r.ohcustom1subtotal = sumWithNull(r.ohcustom1chinese, r.ohcustom1japanese, r.ohcustom1korean, r.ohcustom1noncjk);
    r.ohcustom2subtotal = sumWithNull(r.ohcustom2chinese, r.ohcustom2japanese, r.ohcustom2korean, r.ohcustom2noncjk);
    r.ohcustom3subtotal = sumWithNull(r.ohcustom3chinese, r.ohcustom3japanese, r.ohcustom3korean, r.ohcustom3noncjk);
    r.ohcustom4subtotal = sumWithNull(r.ohcustom4chinese, r.ohcustom4japanese, r.ohcustom4korean, r.ohcustom4noncjk);

    // Total Other Library Materials (all 10 categories per language)
    r.ohtotal_chinese = sumWithNull(
      r.ohmicroform_chinese, r.ohcarto_graphic_chinese, r.ohaudio_chinese, r.ohfilm_video_chinese, r.ohdvd_chinese,
      r.ohonlinemapchinese, r.ohonlineimagechinese, r.ohstreamingchinese, r.ohstreamingvideochinese,
      r.ohcustom1chinese, r.ohcustom2chinese, r.ohcustom3chinese, r.ohcustom4chinese
    );
    r.ohtotal_japanese = sumWithNull(
      r.ohmicroform_japanese, r.ohcarto_graphic_japanese, r.ohaudio_japanese, r.ohfilm_video_japanese, r.ohdvd_japanese,
      r.ohonlinemapjapanese, r.ohonlineimagejapanese, r.ohstreamingjapanese, r.ohstreamingvideojapanese,
      r.ohcustom1japanese, r.ohcustom2japanese, r.ohcustom3japanese, r.ohcustom4japanese
    );
    r.ohtotal_korean = sumWithNull(
      r.ohmicroform_korean, r.ohcarto_graphic_korean, r.ohaudio_korean, r.ohfilm_video_korean, r.ohdvd_korean,
      r.ohonlinemapkorean, r.ohonlineimagekorean, r.ohstreamingkorean, r.ohstreamingvideokorean,
      r.ohcustom1korean, r.ohcustom2korean, r.ohcustom3korean, r.ohcustom4korean
    );
    r.ohtotal_noncjk = sumWithNull(
      r.ohmicroform_noncjk, r.ohcarto_graphic_noncjk, r.ohaudio_noncjk, r.ohfilm_video_noncjk, r.ohdvd_noncjk,
      r.ohonlinemapnoncjk, r.ohonlineimagenoncjk, r.ohstreamingnoncjk, r.ohstreamingvideononcjk,
      r.ohcustom1noncjk, r.ohcustom2noncjk, r.ohcustom3noncjk, r.ohcustom4noncjk
    );
    r.ohtotal_grandtotal = sumWithNull(r.ohtotal_chinese, r.ohtotal_japanese, r.ohtotal_korean, r.ohtotal_noncjk);

    return r;
  });
}

async function fetchUnprocessedData(year: number) {
  const raw = await prisma.unprocessed_Backlog_Materials.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;
    r.ubtotal = sumWithNull(r.ubchinese, r.ubjapanese, r.ubkorean, r.ubnoncjk);
    return r;
  });
}

async function fetchFiscalData(year: number) {
  const raw = await prisma.fiscal_Support.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    const fsChinese = sumWithNull(r.fschinese_appropriations_monographic, r.fschinese_appropriations_serial, r.fschinese_appropriations_other_material, r.fschinese_appropriations_electronic);
    r.fschinese_appropriations_subtotal = fsChinese !== null ? round2(fsChinese) : null;
    const fsJapanese = sumWithNull(r.fsjapanese_appropriations_monographic, r.fsjapanese_appropriations_serial, r.fsjapanese_appropriations_other_material, r.fsjapanese_appropriations_electronic);
    r.fsjapanese_appropriations_subtotal = fsJapanese !== null ? round2(fsJapanese) : null;
    const fsKorean = sumWithNull(r.fskorean_appropriations_monographic, r.fskorean_appropriations_serial, r.fskorean_appropriations_other_material, r.fskorean_appropriations_electronic);
    r.fskorean_appropriations_subtotal = fsKorean !== null ? round2(fsKorean) : null;
    const fsNonCjk = sumWithNull(r.fsnoncjk_appropriations_monographic, r.fsnoncjk_appropriations_serial, r.fsnoncjk_appropriations_other_material, r.fsnoncjk_appropriations_electronic);
    r.fsnoncjk_appropriations_subtotal = fsNonCjk !== null ? round2(fsNonCjk) : null;
    const fsTotalApprop = sumWithNull(r.fschinese_appropriations_subtotal, r.fsjapanese_appropriations_subtotal, r.fskorean_appropriations_subtotal, r.fsnoncjk_appropriations_subtotal);
    r.fstotal_appropriations = fsTotalApprop !== null ? round2(fsTotalApprop) : null;

    const fsEndow = sumWithNull(r.fsendowments_chinese, r.fsendowments_japanese, r.fsendowments_korean, r.fsendowments_noncjk);
    r.fsendowments_subtotal = fsEndow !== null ? round2(fsEndow) : null;
    const fsGrants = sumWithNull(r.fsgrants_chinese, r.fsgrants_japanese, r.fsgrants_korean, r.fsgrants_noncjk);
    r.fsgrants_subtotal = fsGrants !== null ? round2(fsGrants) : null;
    const fsEAProgram = sumWithNull(r.fseast_asian_program_support_chinese, r.fseast_asian_program_support_japanese, r.fseast_asian_program_support_korean, r.fseast_asian_program_support_noncjk);
    r.fseast_asian_program_support_subtotal = fsEAProgram !== null ? round2(fsEAProgram) : null;
    const fsTotalBudget = sumWithNull(r.fstotal_appropriations, r.fsendowments_subtotal, r.fsgrants_subtotal, r.fseast_asian_program_support_subtotal);
    r.fstotal_acquisition_budget = fsTotalBudget !== null ? round2(fsTotalBudget) : null;

    return r;
  });
}

async function fetchPersonnelData(year: number) {
  const raw = await prisma.personnel_Support.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    const psProf = sumWithNull(r.psfprofessional_chinese, r.psfprofessional_japanese, r.psfprofessional_korean, r.psfprofessional_eastasian);
    r.psfprofessional_subtotal = psProf !== null ? round2(psProf) : null;
    const psSupport = sumWithNull(r.psfsupport_staff_chinese, r.psfsupport_staff_japanese, r.psfsupport_staff_korean, r.psfsupport_staff_eastasian);
    r.psfsupport_staff_subtotal = psSupport !== null ? round2(psSupport) : null;
    const psStudent = sumWithNull(r.psfstudent_assistants_chinese, r.psfstudent_assistants_japanese, r.psfstudent_assistants_korean, r.psfstudent_assistants_eastasian);
    r.psfstudent_assistants_subtotal = psStudent !== null ? round2(psStudent) : null;
    const psTotal = sumWithNull(r.psfprofessional_subtotal, r.psfsupport_staff_subtotal, r.psfstudent_assistants_subtotal, r.psfothers);
    r.psftotal = psTotal !== null ? round2(psTotal) : null;

    return r;
  });
}

async function fetchPublicServicesData(year: number) {
  const raw = await prisma.public_Services.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;
    return r;
  });
}

async function fetchElectronicData(year: number) {
  const raw = await prisma.electronic.findMany({
    where: { Library_Year: { year } },
    include: { Library_Year: { include: { Library: true } } },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    // One-time subtotals
    r.eonetime_computer_title_subtotal = sumWithNull(r.eonetime_computer_title_chinese, r.eonetime_computer_title_japanese, r.eonetime_computer_title_korean, r.eonetime_computer_title_noncjk);
    r.eonetime_computer_cd_subtotal = sumWithNull(r.eonetime_computer_cd_chinese, r.eonetime_computer_cd_japanese, r.eonetime_computer_cd_korean, r.eonetime_computer_cd_noncjk);
    // Accompanied subtotals
    r.eaccompanied_computer_title_subtotal = sumWithNull(r.eaccompanied_computer_title_chinese, r.eaccompanied_computer_title_japanese, r.eaccompanied_computer_title_korean, r.eaccompanied_computer_title_noncjk);
    r.eaccompanied_computer_cd_subtotal = sumWithNull(r.eaccompanied_computer_cd_chinese, r.eaccompanied_computer_cd_japanese, r.eaccompanied_computer_cd_korean, r.eaccompanied_computer_cd_noncjk);
    // Gift subtotals
    r.egift_computer_title_subtotal = sumWithNull(r.egift_computer_title_chinese, r.egift_computer_title_japanese, r.egift_computer_title_korean, r.egift_computer_title_noncjk);
    r.egift_computer_cd_subtotal = sumWithNull(r.egift_computer_cd_chinese, r.egift_computer_cd_japanese, r.egift_computer_cd_korean, r.egift_computer_cd_noncjk);
    // Total current year subtotals
    r.etotal_computer_title_subtotal = sumWithNull(r.etotal_computer_title_chinese, r.etotal_computer_title_japanese, r.etotal_computer_title_korean, r.etotal_computer_title_noncjk);
    r.etotal_computer_cd_subtotal = sumWithNull(r.etotal_computer_cd_chinese, r.etotal_computer_cd_japanese, r.etotal_computer_cd_korean, r.etotal_computer_cd_noncjk);
    // Previous year subtotals
    r.eprevious_total_title_subtotal = sumWithNull(r.eprevious_total_title_chinese, r.eprevious_total_title_japanese, r.eprevious_total_title_korean, r.eprevious_total_title_noncjk);
    r.eprevious_total_cd_subtotal = sumWithNull(r.eprevious_total_cd_chinese, r.eprevious_total_cd_japanese, r.eprevious_total_cd_korean, r.eprevious_total_cd_noncjk);
    // Grand total subtotals
    r.egrand_total_title_subtotal = sumWithNull(r.egrand_total_title_chinese, r.egrand_total_title_japanese, r.egrand_total_title_korean, r.egrand_total_title_noncjk);
    r.egrand_total_cd_subtotal = sumWithNull(r.egrand_total_cd_chinese, r.egrand_total_cd_japanese, r.egrand_total_cd_korean, r.egrand_total_cd_noncjk);
    // Electronic indexes subtotals
    r.eindex_electronic_title_subtotal = sumWithNull(r.eindex_electronic_title_chinese, r.eindex_electronic_title_japanese, r.eindex_electronic_title_korean, r.eindex_electronic_title_noncjk);
    // Full-text subtotals
    r.efulltext_electronic_title_subtotal = sumWithNull(r.efulltext_electronic_title_chinese, r.efulltext_electronic_title_japanese, r.efulltext_electronic_title_korean, r.efulltext_electronic_title_noncjk);
    // Total electronic subtotals
    r.etotal_electronic_title_subtotal = sumWithNull(r.etotal_electronic_title_chinese, r.etotal_electronic_title_japanese, r.etotal_electronic_title_korean, r.etotal_electronic_title_noncjk);

    return r;
  });
}

async function fetchElectronicBooksData(year: number) {
  const raw = await prisma.electronic_Books.findMany({
    where: { Library_Year: { year } },
    include: {
      Library_Year: {
        include: {
          Library: true,
          Volume_Holdings: true,
        },
      },
    },
    orderBy: { Library_Year: { Library: { library_name: 'asc' } } },
  });

  return raw.map(record => {
    const r: any = { ...record };
    Object.keys(r).forEach(k => { r[k] = toNum(r[k]); });
    r.Library_Year = record.Library_Year;

    // Titles subtotals
    r.ebooks_purchased_prev_titles_subtotal = sumWithNull(r.ebooks_purchased_prev_titles_chinese, r.ebooks_purchased_prev_titles_japanese, r.ebooks_purchased_prev_titles_korean, r.ebooks_purchased_prev_titles_noncjk);
    r.ebooks_purchased_add_titles_subtotal = sumWithNull(r.ebooks_purchased_add_titles_chinese, r.ebooks_purchased_add_titles_japanese, r.ebooks_purchased_add_titles_korean, r.ebooks_purchased_add_titles_noncjk);
    r.ebooks_purchased_titles_chinese = sumWithNull(r.ebooks_purchased_prev_titles_chinese, r.ebooks_purchased_add_titles_chinese);
    r.ebooks_purchased_titles_japanese = sumWithNull(r.ebooks_purchased_prev_titles_japanese, r.ebooks_purchased_add_titles_japanese);
    r.ebooks_purchased_titles_korean = sumWithNull(r.ebooks_purchased_prev_titles_korean, r.ebooks_purchased_add_titles_korean);
    r.ebooks_purchased_titles_noncjk = sumWithNull(r.ebooks_purchased_prev_titles_noncjk, r.ebooks_purchased_add_titles_noncjk);
    r.ebooks_purchased_titles_subtotal = sumWithNull(r.ebooks_purchased_titles_chinese, r.ebooks_purchased_titles_japanese, r.ebooks_purchased_titles_korean, r.ebooks_purchased_titles_noncjk);
    r.ebooks_nonpurchased_titles_subtotal = sumWithNull(r.ebooks_nonpurchased_titles_chinese, r.ebooks_nonpurchased_titles_japanese, r.ebooks_nonpurchased_titles_korean, r.ebooks_nonpurchased_titles_noncjk);
    r.ebooks_subscription_titles_subtotal = sumWithNull(r.ebooks_subscription_titles_chinese, r.ebooks_subscription_titles_japanese, r.ebooks_subscription_titles_korean, r.ebooks_subscription_titles_noncjk);

    // Volumes subtotals
    r.ebooks_purchased_prev_volumes_subtotal = sumWithNull(r.ebooks_purchased_prev_volumes_chinese, r.ebooks_purchased_prev_volumes_japanese, r.ebooks_purchased_prev_volumes_korean, r.ebooks_purchased_prev_volumes_noncjk);
    r.ebooks_purchased_add_volumes_subtotal = sumWithNull(r.ebooks_purchased_add_volumes_chinese, r.ebooks_purchased_add_volumes_japanese, r.ebooks_purchased_add_volumes_korean, r.ebooks_purchased_add_volumes_noncjk);
    r.ebooks_purchased_volumes_chinese = sumWithNull(r.ebooks_purchased_prev_volumes_chinese, r.ebooks_purchased_add_volumes_chinese);
    r.ebooks_purchased_volumes_japanese = sumWithNull(r.ebooks_purchased_prev_volumes_japanese, r.ebooks_purchased_add_volumes_japanese);
    r.ebooks_purchased_volumes_korean = sumWithNull(r.ebooks_purchased_prev_volumes_korean, r.ebooks_purchased_add_volumes_korean);
    r.ebooks_purchased_volumes_noncjk = sumWithNull(r.ebooks_purchased_prev_volumes_noncjk, r.ebooks_purchased_add_volumes_noncjk);
    r.ebooks_purchased_volumes_subtotal = sumWithNull(r.ebooks_purchased_volumes_chinese, r.ebooks_purchased_volumes_japanese, r.ebooks_purchased_volumes_korean, r.ebooks_purchased_volumes_noncjk);
    r.ebooks_nonpurchased_volumes_subtotal = sumWithNull(r.ebooks_nonpurchased_volumes_chinese, r.ebooks_nonpurchased_volumes_japanese, r.ebooks_nonpurchased_volumes_korean, r.ebooks_nonpurchased_volumes_noncjk);
    r.ebooks_subscription_volumes_subtotal = sumWithNull(r.ebooks_subscription_volumes_chinese, r.ebooks_subscription_volumes_japanese, r.ebooks_subscription_volumes_korean, r.ebooks_subscription_volumes_noncjk);

    // Grand totals
    r.ebooks_total_titles = sumWithNull(r.ebooks_purchased_titles_subtotal, r.ebooks_nonpurchased_titles_subtotal);
    r.ebooks_total_volumes = sumWithNull(r.ebooks_purchased_volumes_subtotal, r.ebooks_nonpurchased_volumes_subtotal);

    return r;
  });
}

// =============================================================================
// Table 5 — Composite data assembly
// =============================================================================
function assembleTable5Data(
  volumeHoldingsData: any[],
  otherHoldingsData: any[],
  unprocessedData: any[],
  electronicBooksData: any[],
): any[] {
  // Build a map of library_id -> institution name for all participating institutions
  const institutionMap = new Map<number, { name: string; libraryYear: any }>();

  const addToMap = (data: any[]) => {
    for (const r of data) {
      const libId = r.Library_Year?.Library?.id;
      if (libId && !institutionMap.has(libId)) {
        institutionMap.set(libId, {
          name: r.Library_Year.Library.library_name,
          libraryYear: r.Library_Year,
        });
      }
    }
  };

  addToMap(volumeHoldingsData);
  addToMap(otherHoldingsData);
  addToMap(unprocessedData);
  addToMap(electronicBooksData);

  // Build lookup maps by library_id
  const vhMap = new Map<number, any>();
  for (const r of volumeHoldingsData) {
    const libId = r.Library_Year?.Library?.id;
    if (libId) vhMap.set(libId, r);
  }

  const ohMap = new Map<number, any>();
  for (const r of otherHoldingsData) {
    const libId = r.Library_Year?.Library?.id;
    if (libId) ohMap.set(libId, r);
  }

  const ubMap = new Map<number, any>();
  for (const r of unprocessedData) {
    const libId = r.Library_Year?.Library?.id;
    if (libId) ubMap.set(libId, r);
  }

  const ebMap = new Map<number, any>();
  for (const r of electronicBooksData) {
    const libId = r.Library_Year?.Library?.id;
    if (libId) ebMap.set(libId, r);
  }

  // Build composite records sorted by institution name
  const compositeRecords: any[] = [];

  for (const [libId, inst] of institutionMap) {
    const vh = vhMap.get(libId);
    const oh = ohMap.get(libId);
    const ub = ubMap.get(libId);
    const eb = ebMap.get(libId);

    const row: any = {
      Library_Year: {
        Library: { library_name: inst.name },
      },
      // Physical volumes from Table 2
      vhend_year_chinese: vh?.vhend_year_chinese ?? null,
      vhend_year_japanese: vh?.vhend_year_japanese ?? null,
      vhend_year_korean: vh?.vhend_year_korean ?? null,
      vhend_year_noncjk: vh?.vhend_year_noncjk ?? null,
      vhend_year_subtotal: vh?.vhend_year_subtotal ?? null,
      // E-Books total volumes from Form 10
      ebooks_total_volumes: eb?.ebooks_total_volumes ?? null,
      // Total Other Library Materials from Form 4
      ohtotal_grandtotal: oh?.ohtotal_grandtotal ?? null,
      // Unprocessed from Form 5
      ubchinese: ub?.ubchinese ?? null,
      ubjapanese: ub?.ubjapanese ?? null,
      ubkorean: ub?.ubkorean ?? null,
      ubnoncjk: ub?.ubnoncjk ?? null,
      ubtotal: ub?.ubtotal ?? null,
    };

    // Grand total without e-books = Physical Volumes + Other Materials
    row.grand_total_without_ebooks = sumWithNull(row.vhend_year_subtotal, row.ohtotal_grandtotal);
    // Grand total with e-books = Physical Volumes + E-Books Volumes + Other Materials
    row.grand_total_with_ebooks = sumWithNull(row.vhend_year_subtotal, row.ebooks_total_volumes, row.ohtotal_grandtotal);

    compositeRecords.push(row);
  }

  // Sort by institution name
  compositeRecords.sort((a, b) => {
    const nameA = a.Library_Year?.Library?.library_name || '';
    const nameB = b.Library_Year?.Library?.library_name || '';
    return nameA.localeCompare(nameB);
  });

  return compositeRecords;
}

// =============================================================================
// Main API handler
// =============================================================================
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;
    const roleData = cookieStore.get('role')?.value;

    if (!userEmail || !roleData) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    let userRoles: string[] = [];
    try {
      userRoles = JSON.parse(roleData);
    } catch {
      userRoles = [roleData];
    }

    const hasAccess = userRoles.includes('1') || userRoles.includes('3');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden - Super Admin or E-Resource Editor role required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json({ error: 'Year parameter is required' }, { status: 400 });
    }

    const yearNum = parseInt(year);

    // Fetch participation status (Entry_Status) and all form data in parallel
    const [
      participation,
      monographicDataRaw,
      volumeHoldingsDataRaw,
      serialsDataRaw,
      otherHoldingsDataRaw,
      unprocessedDataRaw,
      fiscalDataRaw,
      personnelDataRaw,
      publicServicesDataRaw,
      electronicDataRaw,
      electronicBooksDataRaw,
    ] = await Promise.all([
      fetchParticipationSets(yearNum),
      fetchMonographicData(yearNum),
      fetchVolumeHoldingsData(yearNum),
      fetchSerialsData(yearNum),
      fetchOtherHoldingsData(yearNum),
      fetchUnprocessedData(yearNum),
      fetchFiscalData(yearNum),
      fetchPersonnelData(yearNum),
      fetchPublicServicesData(yearNum),
      fetchElectronicData(yearNum),
      fetchElectronicBooksData(yearNum),
    ]);

    // Filter ALL datasets to only include institutions that actually participated
    // (based on Entry_Status, the authoritative participation tracker)
    const monographicData = filterByParticipation(monographicDataRaw, participation.monographic_acquisitions);
    const volumeHoldingsData = filterByParticipation(volumeHoldingsDataRaw, participation.volume_holdings);
    const serialsData = filterByParticipation(serialsDataRaw, participation.serials);
    const otherHoldingsData = filterByParticipation(otherHoldingsDataRaw, participation.other_holdings);
    const unprocessedData = filterByParticipation(unprocessedDataRaw, participation.unprocessed_backlog_materials);
    const fiscalData = filterByParticipation(fiscalDataRaw, participation.fiscal_support);
    const personnelData = filterByParticipation(personnelDataRaw, participation.personnel_support_fte);
    const publicServicesData = filterByParticipation(publicServicesDataRaw, participation.public_services);
    const electronicData = filterByParticipation(electronicDataRaw, participation.electronic);
    const electronicBooksData = filterByParticipation(electronicBooksDataRaw, participation.electronic_books);

    // Assemble Table 5 composite data (uses already-filtered data)
    const table5Data = assembleTable5Data(
      volumeHoldingsData,
      otherHoldingsData,
      unprocessedData,
      electronicBooksData,
    );

    // Build PDF
    const exporter = new PdfExporter();

    // Table 1 — Monograph Additions
    if (monographicData.length > 0) {
      exporter.addTable({ ...getTable1Config(yearNum), data: monographicData, skipFilter: true });
    }

    // Table 2 — Total Volumes in Library
    if (volumeHoldingsData.length > 0) {
      exporter.addTable({ ...getTable2Config(yearNum), data: volumeHoldingsData, skipFilter: true });
    }

    // Table 3-1 — Serials (Purchased & Non-Purchased)
    if (serialsData.length > 0) {
      exporter.addTable({ ...getTable3_1Config(yearNum), data: serialsData, skipNotes: true, skipFilter: true });
    }

    // Table 3-2 — Serials (Totals) — notes go here (last part)
    if (serialsData.length > 0) {
      exporter.addTable({ ...getTable3_2Config(yearNum), data: serialsData, skipFilter: true });
    }

    // Table 4-1 — Other Holdings Physical
    if (otherHoldingsData.length > 0) {
      exporter.addTable({ ...getTable4_1Config(yearNum), data: otherHoldingsData, skipNotes: true, skipFilter: true });
    }

    // Table 4-2 — Other Holdings Online
    if (otherHoldingsData.length > 0) {
      exporter.addTable({ ...getTable4_2Config(yearNum), data: otherHoldingsData, skipNotes: true, skipFilter: true });
    }

    // Table 4-3 — Other Holdings Custom + Total — notes go here (last part)
    if (otherHoldingsData.length > 0) {
      exporter.addTable({ ...getTable4_3Config(yearNum), data: otherHoldingsData, skipFilter: true });
    }

    // Table 5 — Total East Asian Collections
    if (table5Data.length > 0) {
      exporter.addTable({ ...getTable5Config(yearNum), data: table5Data, skipFilter: true });
    }

    // Table 6-1 — Fiscal Appropriations
    if (fiscalData.length > 0) {
      exporter.addTable({ ...getTable6_1Config(yearNum), data: fiscalData, skipNotes: true, skipFilter: true });
    }

    // Table 6-2 — Fiscal Other Funding — notes go here (last part)
    if (fiscalData.length > 0) {
      exporter.addTable({ ...getTable6_2Config(yearNum), data: fiscalData, skipFilter: true });
    }

    // Table 7 — Personnel Support
    if (personnelData.length > 0) {
      exporter.addTable({ ...getTable7Config(yearNum), data: personnelData, skipFilter: true });
    }

    // Table 8 — Public Services
    if (publicServicesData.length > 0) {
      exporter.addTable({ ...getTable8Config(yearNum), data: publicServicesData, skipFilter: true });
    }

    // Table 9-1 — Electronic Computer Files
    if (electronicData.length > 0) {
      exporter.addTable({ ...getTable9_1Config(yearNum), data: electronicData, skipNotes: true, skipFilter: true });
    }

    // Table 9-2 — Electronic Databases & Serials — notes go here (last part)
    if (electronicData.length > 0) {
      exporter.addTable({ ...getTable9_2Config(yearNum), data: electronicData, skipFilter: true });
    }

    // Table 10-1 — Electronic Books Titles
    if (electronicBooksData.length > 0) {
      exporter.addTable({ ...getTable10_1Config(yearNum), data: electronicBooksData, skipNotes: true, skipFilter: true });
    }

    // Table 10-2 — Electronic Books Volumes — notes go here (last part)
    if (electronicBooksData.length > 0) {
      exporter.addTable({ ...getTable10_2Config(yearNum), data: electronicBooksData, skipFilter: true });
    }

    const buffer = await exporter.generateBuffer();
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CEAL_Statistics_${yearNum}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
