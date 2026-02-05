import { NextRequest, NextResponse } from "next/server";
import { ExcelExporter, getNestedValue } from '@/lib/excelExporter';
import { formFieldMappings, notesFields } from '@/lib/formFieldMappings';
import db from "@/lib/db";
import { Buffer } from "node:buffer";

const prisma = db;

// Helper function for calculations - treats null as 0 for math operations
function parseNum(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function for subtotal calculations - returns null if all inputs are null
function sumWithNull(...values: any[]): number | null {
  // Check if all values are null/undefined
  const allNull = values.every(v => v === null || v === undefined || v === '');
  if (allNull) return null;
  
  // Otherwise sum, treating null as 0
  return values.reduce((sum, val) => sum + parseNum(val), 0);
}

// Helper function to round to 2 decimal places (fixes floating-point precision)
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Helper function to calculate fields for each form type (EXACT COPY from year-end-reports)
function calculateFormFields(formType: string, record: any): any {
  const calculated: any = {};
  
  switch (formType) {
    case 'monographic':
      calculated.mapurchased_titles_subtotal = sumWithNull(record.mapurchased_titles_chinese, record.mapurchased_titles_japanese, record.mapurchased_titles_korean, record.mapurchased_titles_noncjk);
      calculated.mapurchased_volumes_subtotal = sumWithNull(record.mapurchased_volumes_chinese, record.mapurchased_volumes_japanese, record.mapurchased_volumes_korean, record.mapurchased_volumes_noncjk);
      calculated.manonpurchased_titles_subtotal = sumWithNull(record.manonpurchased_titles_chinese, record.manonpurchased_titles_japanese, record.manonpurchased_titles_korean, record.manonpurchased_titles_noncjk);
      calculated.manonpurchased_volumes_subtotal = sumWithNull(record.manonpurchased_volumes_chinese, record.manonpurchased_volumes_japanese, record.manonpurchased_volumes_korean, record.manonpurchased_volumes_noncjk);
      calculated.matotal_titles = sumWithNull(calculated.mapurchased_titles_subtotal, calculated.manonpurchased_titles_subtotal);
      calculated.matotal_volumes = sumWithNull(calculated.mapurchased_volumes_subtotal, calculated.manonpurchased_volumes_subtotal);
      break;
      
    case 'volumeHoldings':
      calculated.vhprevious_year_subtotal = sumWithNull(record.vhprevious_year_chinese, record.vhprevious_year_japanese, record.vhprevious_year_korean, record.vhprevious_year_noncjk);
      calculated.vhadded_gross_subtotal = sumWithNull(record.vhadded_gross_chinese, record.vhadded_gross_japanese, record.vhadded_gross_korean, record.vhadded_gross_noncjk);
      calculated.vhwithdrawn_subtotal = sumWithNull(record.vhwithdrawn_chinese, record.vhwithdrawn_japanese, record.vhwithdrawn_korean, record.vhwithdrawn_noncjk);
      // Grand total: if all subtotals are null, result is null
      const vhPrev = calculated.vhprevious_year_subtotal ?? 0;
      const vhAdded = calculated.vhadded_gross_subtotal ?? 0;
      const vhWith = calculated.vhwithdrawn_subtotal ?? 0;
      const allVhNull = calculated.vhprevious_year_subtotal === null && calculated.vhadded_gross_subtotal === null && calculated.vhwithdrawn_subtotal === null;
      calculated.vhgrandtotal = allVhNull ? null : (vhPrev + vhAdded - vhWith);
      calculated.vhebooks_purchased_volume_total = record.vhebooks_purchased_volume_total;
      calculated.vhoverall_grand_total = record.vhoverall_grand_total;
      break;
      
    case 'serials':
      calculated.s_epurchased_subtotal = sumWithNull(record.s_epurchased_chinese, record.s_epurchased_japanese, record.s_epurchased_korean, record.s_epurchased_noncjk);
      calculated.spurchased_subtotal = sumWithNull(record.spurchased_chinese, record.spurchased_japanese, record.spurchased_korean, record.spurchased_noncjk);
      calculated.s_enonpurchased_subtotal = sumWithNull(record.s_enonpurchased_chinese, record.s_enonpurchased_japanese, record.s_enonpurchased_korean, record.s_enonpurchased_noncjk);
      calculated.snonpurchased_subtotal = sumWithNull(record.snonpurchased_chinese, record.snonpurchased_japanese, record.snonpurchased_korean, record.snonpurchased_noncjk);
      calculated.s_etotal_chinese = sumWithNull(record.s_epurchased_chinese, record.s_enonpurchased_chinese);
      calculated.s_etotal_japanese = sumWithNull(record.s_epurchased_japanese, record.s_enonpurchased_japanese);
      calculated.s_etotal_korean = sumWithNull(record.s_epurchased_korean, record.s_enonpurchased_korean);
      calculated.s_etotal_noncjk = sumWithNull(record.s_epurchased_noncjk, record.s_enonpurchased_noncjk);
      calculated.s_egrandtotal = sumWithNull(calculated.s_epurchased_subtotal, calculated.s_enonpurchased_subtotal);
      calculated.stotal_chinese = sumWithNull(record.spurchased_chinese, record.snonpurchased_chinese);
      calculated.stotal_japanese = sumWithNull(record.spurchased_japanese, record.snonpurchased_japanese);
      calculated.stotal_korean = sumWithNull(record.spurchased_korean, record.snonpurchased_korean);
      calculated.stotal_noncjk = sumWithNull(record.spurchased_noncjk, record.snonpurchased_noncjk);
      calculated.sgrandtotal = sumWithNull(calculated.spurchased_subtotal, calculated.snonpurchased_subtotal);
      calculated.stotal_overall = sumWithNull(calculated.s_egrandtotal, calculated.sgrandtotal);
      break;
      
    case 'otherHoldings':
      // Physical materials subtotals
      calculated.ohmicroform_subtotal = sumWithNull(record.ohmicroform_chinese, record.ohmicroform_japanese, record.ohmicroform_korean, record.ohmicroform_noncjk);
      calculated.ohcarto_graphic_subtotal = sumWithNull(record.ohcarto_graphic_chinese, record.ohcarto_graphic_japanese, record.ohcarto_graphic_korean, record.ohcarto_graphic_noncjk);
      calculated.ohaudio_subtotal = sumWithNull(record.ohaudio_chinese, record.ohaudio_japanese, record.ohaudio_korean, record.ohaudio_noncjk);
      calculated.ohfilm_video_subtotal = sumWithNull(record.ohfilm_video_chinese, record.ohfilm_video_japanese, record.ohfilm_video_korean, record.ohfilm_video_noncjk);
      calculated.ohdvd_subtotal = sumWithNull(record.ohdvd_chinese, record.ohdvd_japanese, record.ohdvd_korean, record.ohdvd_noncjk);
      
      // Online materials subtotals
      calculated.ohonlinemapsubtotal = sumWithNull(record.ohonlinemapchinese, record.ohonlinemapjapanese, record.ohonlinemapkorean, record.ohonlinemapnoncjk);
      calculated.ohonlineimagesubtotal = sumWithNull(record.ohonlineimagechinese, record.ohonlineimagejapanese, record.ohonlineimagekorean, record.ohonlineimagenoncjk);
      calculated.ohstreamingsubtotal = sumWithNull(record.ohstreamingchinese, record.ohstreamingjapanese, record.ohstreamingkorean, record.ohstreamingnoncjk);
      calculated.ohstreamingvideosubtotal = sumWithNull(record.ohstreamingvideochinese, record.ohstreamingvideojapanese, record.ohstreamingvideokorean, record.ohstreamingvideononcjk);
      
      // Custom materials subtotal
      calculated.ohcustom1subtotal = sumWithNull(record.ohcustom1chinese, record.ohcustom1japanese, record.ohcustom1korean, record.ohcustom1noncjk);
      
      // Grand total (only physical materials per form specification - line 51)
      calculated.ohgrandtotal = sumWithNull(calculated.ohmicroform_subtotal, calculated.ohcarto_graphic_subtotal, calculated.ohaudio_subtotal, calculated.ohfilm_video_subtotal, calculated.ohdvd_subtotal);
      break;
      
    case 'unprocessed':
      calculated.ubtotal = sumWithNull(record.ubchinese, record.ubjapanese, record.ubkorean, record.ubnoncjk);
      break;
      
    case 'fiscal':
      const fsChinese = sumWithNull(record.fschinese_appropriations_monographic, record.fschinese_appropriations_serial, record.fschinese_appropriations_other_material, record.fschinese_appropriations_electronic);
      calculated.fschinese_appropriations_subtotal = fsChinese !== null ? round2(fsChinese) : null;
      const fsJapanese = sumWithNull(record.fsjapanese_appropriations_monographic, record.fsjapanese_appropriations_serial, record.fsjapanese_appropriations_other_material, record.fsjapanese_appropriations_electronic);
      calculated.fsjapanese_appropriations_subtotal = fsJapanese !== null ? round2(fsJapanese) : null;
      const fsKorean = sumWithNull(record.fskorean_appropriations_monographic, record.fskorean_appropriations_serial, record.fskorean_appropriations_other_material, record.fskorean_appropriations_electronic);
      calculated.fskorean_appropriations_subtotal = fsKorean !== null ? round2(fsKorean) : null;
      const fsNonCjk = sumWithNull(record.fsnoncjk_appropriations_monographic, record.fsnoncjk_appropriations_serial, record.fsnoncjk_appropriations_other_material, record.fsnoncjk_appropriations_electronic);
      calculated.fsnoncjk_appropriations_subtotal = fsNonCjk !== null ? round2(fsNonCjk) : null;
      const fsTotalApprop = sumWithNull(calculated.fschinese_appropriations_subtotal, calculated.fsjapanese_appropriations_subtotal, calculated.fskorean_appropriations_subtotal, calculated.fsnoncjk_appropriations_subtotal);
      calculated.fstotal_appropriations = fsTotalApprop !== null ? round2(fsTotalApprop) : null;
      const fsEndow = sumWithNull(record.fsendowments_chinese, record.fsendowments_japanese, record.fsendowments_korean, record.fsendowments_noncjk);
      calculated.fsendowments_subtotal = fsEndow !== null ? round2(fsEndow) : null;
      const fsGrants = sumWithNull(record.fsgrants_chinese, record.fsgrants_japanese, record.fsgrants_korean, record.fsgrants_noncjk);
      calculated.fsgrants_subtotal = fsGrants !== null ? round2(fsGrants) : null;
      const fsEAProgram = sumWithNull(record.fseast_asian_program_support_chinese, record.fseast_asian_program_support_japanese, record.fseast_asian_program_support_korean, record.fseast_asian_program_support_noncjk);
      calculated.fseast_asian_program_support_subtotal = fsEAProgram !== null ? round2(fsEAProgram) : null;
      const fsTotalBudget = sumWithNull(calculated.fstotal_appropriations, calculated.fsendowments_subtotal, calculated.fsgrants_subtotal, calculated.fseast_asian_program_support_subtotal);
      calculated.fstotal_acquisition_budget = fsTotalBudget !== null ? round2(fsTotalBudget) : null;
      break;
      
    case 'personnel':
      const psProf = sumWithNull(record.psfprofessional_chinese, record.psfprofessional_japanese, record.psfprofessional_korean, record.psfprofessional_eastasian);
      calculated.psfprofessional_subtotal = psProf !== null ? round2(psProf) : null;
      const psSupport = sumWithNull(record.psfsupport_staff_chinese, record.psfsupport_staff_japanese, record.psfsupport_staff_korean, record.psfsupport_staff_eastasian);
      calculated.psfsupport_staff_subtotal = psSupport !== null ? round2(psSupport) : null;
      const psStudent = sumWithNull(record.psfstudent_assistants_chinese, record.psfstudent_assistants_japanese, record.psfstudent_assistants_korean, record.psfstudent_assistants_eastasian);
      calculated.psfstudent_assistants_subtotal = psStudent !== null ? round2(psStudent) : null;
      const psTotal = sumWithNull(calculated.psfprofessional_subtotal, calculated.psfsupport_staff_subtotal, calculated.psfstudent_assistants_subtotal, record.psfothers);
      calculated.psftotal = psTotal !== null ? round2(psTotal) : null;
      break;
      
    case 'publicServices':
      // Public services fields are already calculated/stored as subtotals
      break;
      
    case 'electronic':
      // One-time Computer Files subtotals
      calculated.eonetime_computer_title_subtotal = sumWithNull(record.eonetime_computer_title_chinese, record.eonetime_computer_title_japanese, record.eonetime_computer_title_korean, record.eonetime_computer_title_noncjk);
      calculated.eonetime_computer_cd_subtotal = sumWithNull(record.eonetime_computer_cd_chinese, record.eonetime_computer_cd_japanese, record.eonetime_computer_cd_korean, record.eonetime_computer_cd_noncjk);
      // Accompanied Computer Files subtotals
      calculated.eaccompanied_computer_title_subtotal = sumWithNull(record.eaccompanied_computer_title_chinese, record.eaccompanied_computer_title_japanese, record.eaccompanied_computer_title_korean, record.eaccompanied_computer_title_noncjk);
      calculated.eaccompanied_computer_cd_subtotal = sumWithNull(record.eaccompanied_computer_cd_chinese, record.eaccompanied_computer_cd_japanese, record.eaccompanied_computer_cd_korean, record.eaccompanied_computer_cd_noncjk);
      // Gift Computer Files subtotals
      calculated.egift_computer_title_subtotal = sumWithNull(record.egift_computer_title_chinese, record.egift_computer_title_japanese, record.egift_computer_title_korean, record.egift_computer_title_noncjk);
      calculated.egift_computer_cd_subtotal = sumWithNull(record.egift_computer_cd_chinese, record.egift_computer_cd_japanese, record.egift_computer_cd_korean, record.egift_computer_cd_noncjk);
      // Total Computer Files (Current Year) subtotals
      calculated.etotal_computer_title_subtotal = sumWithNull(record.etotal_computer_title_chinese, record.etotal_computer_title_japanese, record.etotal_computer_title_korean, record.etotal_computer_title_noncjk);
      calculated.etotal_computer_cd_subtotal = sumWithNull(record.etotal_computer_cd_chinese, record.etotal_computer_cd_japanese, record.etotal_computer_cd_korean, record.etotal_computer_cd_noncjk);
      // Previous Year Totals subtotals
      calculated.eprevious_total_title_subtotal = sumWithNull(record.eprevious_total_title_chinese, record.eprevious_total_title_japanese, record.eprevious_total_title_korean, record.eprevious_total_title_noncjk);
      calculated.eprevious_total_cd_subtotal = sumWithNull(record.eprevious_total_cd_chinese, record.eprevious_total_cd_japanese, record.eprevious_total_cd_korean, record.eprevious_total_cd_noncjk);
      // Grand Totals subtotals
      calculated.egrand_total_title_subtotal = sumWithNull(record.egrand_total_title_chinese, record.egrand_total_title_japanese, record.egrand_total_title_korean, record.egrand_total_title_noncjk);
      calculated.egrand_total_cd_subtotal = sumWithNull(record.egrand_total_cd_chinese, record.egrand_total_cd_japanese, record.egrand_total_cd_korean, record.egrand_total_cd_noncjk);
      // Electronic Indexes subtotals
      calculated.eindex_electronic_title_subtotal = sumWithNull(record.eindex_electronic_title_chinese, record.eindex_electronic_title_japanese, record.eindex_electronic_title_korean, record.eindex_electronic_title_noncjk);
      // Full-text Electronic subtotals
      calculated.efulltext_electronic_title_subtotal = sumWithNull(record.efulltext_electronic_title_chinese, record.efulltext_electronic_title_japanese, record.efulltext_electronic_title_korean, record.efulltext_electronic_title_noncjk);
      // Total Electronic Titles subtotals
      calculated.etotal_electronic_title_subtotal = sumWithNull(record.etotal_electronic_title_chinese, record.etotal_electronic_title_japanese, record.etotal_electronic_title_korean, record.etotal_electronic_title_noncjk);
      break;
      
    case 'electronicBooks':
      calculated.ebooks_purchased_prev_titles_subtotal = sumWithNull(record.ebooks_purchased_prev_titles_chinese, record.ebooks_purchased_prev_titles_japanese, record.ebooks_purchased_prev_titles_korean, record.ebooks_purchased_prev_titles_noncjk);
      calculated.ebooks_purchased_add_titles_subtotal = sumWithNull(record.ebooks_purchased_add_titles_chinese, record.ebooks_purchased_add_titles_japanese, record.ebooks_purchased_add_titles_korean, record.ebooks_purchased_add_titles_noncjk);
      calculated.ebooks_purchased_titles_chinese = sumWithNull(record.ebooks_purchased_prev_titles_chinese, record.ebooks_purchased_add_titles_chinese);
      calculated.ebooks_purchased_titles_japanese = sumWithNull(record.ebooks_purchased_prev_titles_japanese, record.ebooks_purchased_add_titles_japanese);
      calculated.ebooks_purchased_titles_korean = sumWithNull(record.ebooks_purchased_prev_titles_korean, record.ebooks_purchased_add_titles_korean);
      calculated.ebooks_purchased_titles_noncjk = sumWithNull(record.ebooks_purchased_prev_titles_noncjk, record.ebooks_purchased_add_titles_noncjk);
      calculated.ebooks_purchased_titles_subtotal = sumWithNull(calculated.ebooks_purchased_titles_chinese, calculated.ebooks_purchased_titles_japanese, calculated.ebooks_purchased_titles_korean, calculated.ebooks_purchased_titles_noncjk);
      calculated.ebooks_nonpurchased_titles_subtotal = sumWithNull(record.ebooks_nonpurchased_titles_chinese, record.ebooks_nonpurchased_titles_japanese, record.ebooks_nonpurchased_titles_korean, record.ebooks_nonpurchased_titles_noncjk);
      calculated.ebooks_subscription_titles_subtotal = sumWithNull(record.ebooks_subscription_titles_chinese, record.ebooks_subscription_titles_japanese, record.ebooks_subscription_titles_korean, record.ebooks_subscription_titles_noncjk);
      calculated.ebooks_purchased_prev_volumes_subtotal = sumWithNull(record.ebooks_purchased_prev_volumes_chinese, record.ebooks_purchased_prev_volumes_japanese, record.ebooks_purchased_prev_volumes_korean, record.ebooks_purchased_prev_volumes_noncjk);
      calculated.ebooks_purchased_add_volumes_subtotal = sumWithNull(record.ebooks_purchased_add_volumes_chinese, record.ebooks_purchased_add_volumes_japanese, record.ebooks_purchased_add_volumes_korean, record.ebooks_purchased_add_volumes_noncjk);
      calculated.ebooks_purchased_volumes_chinese = sumWithNull(record.ebooks_purchased_prev_volumes_chinese, record.ebooks_purchased_add_volumes_chinese);
      calculated.ebooks_purchased_volumes_japanese = sumWithNull(record.ebooks_purchased_prev_volumes_japanese, record.ebooks_purchased_add_volumes_japanese);
      calculated.ebooks_purchased_volumes_korean = sumWithNull(record.ebooks_purchased_prev_volumes_korean, record.ebooks_purchased_add_volumes_korean);
      calculated.ebooks_purchased_volumes_noncjk = sumWithNull(record.ebooks_purchased_prev_volumes_noncjk, record.ebooks_purchased_add_volumes_noncjk);
      calculated.ebooks_purchased_volumes_subtotal = sumWithNull(calculated.ebooks_purchased_volumes_chinese, calculated.ebooks_purchased_volumes_japanese, calculated.ebooks_purchased_volumes_korean, calculated.ebooks_purchased_volumes_noncjk);
      calculated.ebooks_nonpurchased_volumes_subtotal = sumWithNull(record.ebooks_nonpurchased_volumes_chinese, record.ebooks_nonpurchased_volumes_japanese, record.ebooks_nonpurchased_volumes_korean, record.ebooks_nonpurchased_volumes_noncjk);
      calculated.ebooks_subscription_volumes_subtotal = sumWithNull(record.ebooks_subscription_volumes_chinese, record.ebooks_subscription_volumes_japanese, record.ebooks_subscription_volumes_korean, record.ebooks_subscription_volumes_noncjk);
      calculated.ebooks_total_titles = sumWithNull(calculated.ebooks_purchased_titles_subtotal, calculated.ebooks_nonpurchased_titles_subtotal);
      calculated.ebooks_total_volumes = sumWithNull(calculated.ebooks_purchased_volumes_subtotal, calculated.ebooks_nonpurchased_volumes_subtotal);
      break;
  }
  
  return calculated;
}

// Get grouped headers configuration for each form
function getGroupedHeaders(formType: string): { label: string; colspan: number }[] | null {
  // Forms with multi-tier headers: electronic, electronicBooks, volumeHoldings, otherHoldings, fiscal
  if (formType === 'electronic' || formType === 'electronicBooks' || 
      formType === 'volumeHoldings' || formType === 'otherHoldings' || formType === 'fiscal') {
    return null;
  }
  switch (formType) {
    case 'monographic':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Titles', colspan: 5 },
        { label: 'Purchased Volumes', colspan: 5 },
        { label: 'Non-Purchased Titles', colspan: 5 },
        { label: 'Non-Purchased Volumes', colspan: 5 },
        { label: 'Totals', colspan: 2 }
      ];
    case 'volumeHoldings':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Physical Volume Numbers from Last Year', colspan: 5 },
        { label: 'Physical Volumes Added This Year', colspan: 5 },
        { label: 'Physical Volumes Withdrawn This Year', colspan: 5 },
        { label: 'Total Physical Volume Holdings', colspan: 1 },
        { label: 'Grand Total Volume Holdings', colspan: 2 }
      ];
    case 'serials':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Serial Titles: Purchased (including Subscriptions) - Electronic', colspan: 5 },
        { label: 'Serial Titles: Purchased (including Subscriptions) - Print and other formats', colspan: 5 },
        { label: 'Non-Purchased Serials - Electronic', colspan: 5 },
        { label: 'Non-Purchased Serials - Print and other formats', colspan: 5 },
        { label: 'Totals - Electronic', colspan: 5 },
        { label: 'Totals - Print and other formats', colspan: 5 },
        { label: 'Grand Totals', colspan: 1 }
      ];
    case 'otherHoldings':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Microforms', colspan: 5 },
        { label: 'Cartographic and Graphic Materials', colspan: 5 },
        { label: 'Audio Materials', colspan: 5 },
        { label: 'Video Materials', colspan: 5 },
        { label: 'DVD Materials', colspan: 5 },
        { label: 'Online Materials - Map', colspan: 5 },
        { label: 'Online Materials - Image/Photograph', colspan: 5 },
        { label: 'Online Materials - Streaming Audio/Music', colspan: 5 },
        { label: 'Online Materials - Streaming Film/Video', colspan: 5 },
        { label: 'Online Materials - Custom', colspan: 5 },
        { label: 'Grand Total', colspan: 1 }
      ];
    case 'unprocessed':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Backlog', colspan: 5 }
      ];
    case 'fiscal':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Chinese Appropriations', colspan: 6 },
        { label: 'Japanese Appropriations', colspan: 6 },
        { label: 'Korean Appropriations', colspan: 6 },
        { label: 'Non-CJK Appropriations', colspan: 6 },
        { label: 'Total Appropriations', colspan: 2 },
        { label: 'Endowments', colspan: 6 },
        { label: 'Grants', colspan: 6 },
        { label: 'East Asian Program Support', colspan: 6 },
        { label: 'Total Acquisition Budget', colspan: 1 }
      ];
    case 'personnel':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Professional', colspan: 5 },
        { label: 'Support Staff', colspan: 5 },
        { label: 'Student Assistants', colspan: 5 },
        { label: 'Others', colspan: 1 },
        { label: 'Total', colspan: 1 },
        { label: 'Outsourcing', colspan: 2 }
      ];
    case 'publicServices':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Presentations & Participants', colspan: 2 },
        { label: 'Reference & Circulation', colspan: 2 },
        { label: 'Inter-Library Loan', colspan: 4 }
      ];
    case 'electronic':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'One-time Purchases - Titles', colspan: 5 },
        { label: 'One-time Purchases - CDs', colspan: 5 },
        { label: 'Accompanied Materials - Titles', colspan: 5 },
        { label: 'Accompanied Materials - CDs', colspan: 5 },
        { label: 'Gifts - Titles', colspan: 5 },
        { label: 'Gifts - CDs', colspan: 5 },
        { label: 'Total Current Year - Titles', colspan: 5 },
        { label: 'Total Current Year - CDs', colspan: 5 },
        { label: 'Previous Year - Titles', colspan: 5 },
        { label: 'Previous Year - CDs', colspan: 5 },
        { label: 'Grand Total - Titles', colspan: 5 },
        { label: 'Grand Total - CDs', colspan: 5 },
        { label: 'Electronic Indexes', colspan: 5 },
        { label: 'Full-text Electronic Resources', colspan: 5 },
        { label: 'Total Electronic Titles', colspan: 5 },
        { label: 'Total Expenditure', colspan: 1 }
      ];
    case 'electronicBooks':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased - Previous Year Titles', colspan: 5 },
        { label: 'Purchased - Added This Year Titles', colspan: 5 },
        { label: 'Purchased - Total Titles', colspan: 5 },
        { label: 'Non-Purchased Titles', colspan: 5 },
        { label: 'Subscription Titles', colspan: 5 },
        { label: 'Purchased - Previous Year Volumes', colspan: 5 },
        { label: 'Purchased - Added This Year Volumes', colspan: 5 },
        { label: 'Purchased - Total Volumes', colspan: 5 },
        { label: 'Non-Purchased Volumes', colspan: 5 },
        { label: 'Subscription Volumes', colspan: 5 },
        { label: 'Total Titles', colspan: 1 },
        { label: 'Total Volumes', colspan: 1 }
      ];
    default:
      return [{ label: 'Data', colspan: 1 }];
  }
}

const FORM_NAMES: { [key: string]: string } = {
  monographic: "1. Monographic Acquisitions",
  volumeHoldings: "2. Physical Volume Holdings",
  serials: "3. Serial Titles",
  otherHoldings: "4. Holdings of Other Materials",
  unprocessed: "5. Unprocessed Backlog Materials",
  fiscal: "6. Fiscal Support",
  personnel: "7. Personnel Support",
  publicServices: "8. Public Services",
  electronic: "9. Electronic",
  electronicBooks: "10. Electronic Books",
};

const FORM_FULL_TITLES: { [key: string]: string } = {
  monographic: "Monographic Acquisitions",
  volumeHoldings: "Physical Volume Holdings",
  serials: "Current Serials (Print and Electronic)",
  otherHoldings: "Holdings of Other Materials",
  unprocessed: "Unprocessed Backlog Materials",
  fiscal: "Fiscal Appropriations",
  personnel: "Personnel Support",
  publicServices: "Public Services",
  electronic: "Electronic Resources",
  electronicBooks: "Electronic Books",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { libraryId, years, forms } = body;

    if (!libraryId || !years || !forms || years.length === 0 || forms.length === 0) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      return NextResponse.json(
        { error: "Library not found" },
        { status: 404 }
      );
    }

    const exporter = new ExcelExporter();

    // Process each form
    for (const formType of forms) {
      const fieldMapping = (formFieldMappings as any)[formType];
      if (!fieldMapping) continue;

      const title = FORM_NAMES[formType] || formType;
      const fullTitle = FORM_FULL_TITLES[formType] || formType;
      const groupedHeaders = getGroupedHeaders(formType);

      // Collect data for all years for this form
      const allYearsData: any[] = [];

      for (const year of years) {
        const yearNum = parseInt(year);
        let yearData: any[] = [];

        // Fetch data based on form type
        switch (formType) {
          case 'monographic':
            yearData = await prisma.monographic_Acquisitions.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'volumeHoldings':
            yearData = await prisma.volume_Holdings.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'serials':
            yearData = await prisma.serials.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'otherHoldings':
            yearData = await prisma.other_Holdings.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'unprocessed':
            yearData = await prisma.unprocessed_Backlog_Materials.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'fiscal':
            yearData = await prisma.fiscal_Support.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'personnel':
            yearData = await prisma.personnel_Support.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'publicServices':
            yearData = await prisma.public_Services.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'electronic':
            yearData = await prisma.electronic.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
          case 'electronicBooks':
            yearData = await prisma.electronic_Books.findMany({
              where: { 
                Library_Year: { 
                  year: yearNum,
                  library: libraryId 
                } 
              },
              include: { Library_Year: { include: { Library: true } } }
            });
            break;
        }

        // Add year data with year label
        if (yearData.length > 0) {
          // Transform each record
          const needsDecimalRounding = formType === 'fiscal' || formType === 'personnel';
          
          yearData.forEach(record => {
            const transformed: any = { year: yearNum };
            
            // Get all base field values
            Object.keys(fieldMapping).forEach(field => {
              let value = getNestedValue(record, field);
              
              // Handle Prisma Decimal types - convert to number and round if needed
              if (value !== null && value !== undefined && typeof value === 'object' && 'toNumber' in value) {
                value = value.toNumber();
              }
              
              // Round numeric values for Fiscal and Personnel forms to fix precision
              if (needsDecimalRounding && typeof value === 'number' && !isNaN(value)) {
                value = round2(value);
              }
              
              transformed[field] = value;
            });
            
            // Calculate all computed fields for this form type
            const calculatedFields = calculateFormFields(formType, record);
            Object.assign(transformed, calculatedFields);
            
            // Also include notes field for bottom section
            const notesFieldName = (notesFields as any)[formType];
            if (notesFieldName) {
              transformed[notesFieldName] = record[notesFieldName];
            }
            
            allYearsData.push(transformed);
          });
        }
      }

      if (allYearsData.length > 0) {
        // Add 'Year' as first column in field mapping
        const extendedFieldMapping = {
          'year': 'Year',
          ...fieldMapping
        };

        const headers = Object.values(extendedFieldMapping) as string[];

        // Use the first year for the title (institutional reports are multi-year)
        const firstYear = parseInt(years[0]);

        // Special handling for electronic form with multi-tier headers
        const worksheetConfig: any = {
          title: title,
          fullTitle: `${fullTitle} (${years.join(', ')})`,
          year: firstYear,
          headers: headers,
          data: allYearsData,
          fieldMapping: extendedFieldMapping,
          notesField: (notesFields as any)[formType]
        };

        // Add multi-tier headers for forms that have them, otherwise use groupedHeaders
        if (formType === 'electronic') {
          worksheetConfig.multiTierHeaders = {
            tier1: [
              { label: 'Year', colspan: 1 },
              { label: 'Institution', colspan: 1 },
              { label: '1. Computer Files (CD-ROMs)', colspan: 60 },
              { label: '2. Electronic Resources', colspan: 15 },
              { label: '3. Expenditure', colspan: 1 }
            ],
            tier2: [
              { label: '', colspan: 1 }, // Year column
              { label: '', colspan: 1 }, // Institution column
              { label: '1.1 One-time Purchases', colspan: 10 },
              { label: '1.2 Accompanied Materials', colspan: 10 },
              { label: '1.3 Gifts', colspan: 10 },
              { label: '1.4 Total Current Year', colspan: 10 },
              { label: '1.5 Previous Year', colspan: 10 },
              { label: '1.6 Grand Total', colspan: 10 },
              { label: '2.1 Electronic Indexes', colspan: 5 },
              { label: '2.2 Full-text Database', colspan: 5 },
              { label: '2.3 Total Electronic', colspan: 5 },
              { label: '', colspan: 1 } // Expenditure column
            ]
          };
        } else if (formType === 'electronicBooks') {
          worksheetConfig.multiTierHeaders = {
            tier1: [
              { label: 'Year', colspan: 1 },
              { label: 'Institution', colspan: 1 },
              { label: 'TITLES', colspan: 25 },
              { label: 'VOLUMES', colspan: 25 },
              { label: 'Totals', colspan: 2 }
            ],
            tier2: [
              { label: '', colspan: 1 }, // Year column
              { label: '', colspan: 1 }, // Institution column
              { label: 'Purchased', colspan: 15 },
              { label: 'Non-Purchased', colspan: 5 },
              { label: 'Subscription', colspan: 5 },
              { label: 'Purchased', colspan: 15 },
              { label: 'Non-Purchased', colspan: 5 },
              { label: 'Subscription', colspan: 5 },
              { label: '', colspan: 2 } // Totals columns
            ]
          };
        } else if (formType === 'volumeHoldings') {
          worksheetConfig.multiTierHeaders = {
            tier1: [
              { label: 'Year', colspan: 1 },
              { label: 'Institution', colspan: 1 },
              { label: 'Physical Volumes', colspan: 15 },
              { label: 'Totals', colspan: 3 }
            ],
            tier2: [
              { label: '', colspan: 1 }, // Year column
              { label: '', colspan: 1 }, // Institution column
              { label: 'From Last Year', colspan: 5 },
              { label: 'Added This Year', colspan: 5 },
              { label: 'Withdrawn This Year', colspan: 5 },
              { label: 'Physical Total', colspan: 1 },
              { label: 'E-Books', colspan: 1 },
              { label: 'Grand Total', colspan: 1 }
            ]
          };
        } else if (formType === 'otherHoldings') {
          worksheetConfig.multiTierHeaders = {
            tier1: [
              { label: 'Year', colspan: 1 },
              { label: 'Institution', colspan: 1 },
              { label: 'Physical Materials', colspan: 25 },
              { label: 'Online Materials', colspan: 25 },
              { label: 'Total', colspan: 1 }
            ],
            tier2: [
              { label: '', colspan: 1 }, // Year column
              { label: '', colspan: 1 }, // Institution column
              { label: 'Microforms', colspan: 5 },
              { label: 'Cartographic & Graphic', colspan: 5 },
              { label: 'Audio', colspan: 5 },
              { label: 'Video', colspan: 5 },
              { label: 'DVD', colspan: 5 },
              { label: 'Map', colspan: 5 },
              { label: 'Image/Photo', colspan: 5 },
              { label: 'Audio/Music', colspan: 5 },
              { label: 'Film/Video', colspan: 5 },
              { label: 'Custom', colspan: 5 },
              { label: '', colspan: 1 } // Total column
            ]
          };
        } else if (formType === 'fiscal') {
          worksheetConfig.multiTierHeaders = {
            tier1: [
              { label: 'Year', colspan: 1 },
              { label: 'Institution', colspan: 1 },
              { label: 'Appropriations by Language', colspan: 24 },
              { label: 'Total Approp.', colspan: 2 },
              { label: 'Other Funding Sources', colspan: 18 },
              { label: 'Total Budget', colspan: 1 }
            ],
            tier2: [
              { label: '', colspan: 1 }, // Year column
              { label: '', colspan: 1 }, // Institution column
              { label: 'Chinese', colspan: 6 },
              { label: 'Japanese', colspan: 6 },
              { label: 'Korean', colspan: 6 },
              { label: 'Non-CJK', colspan: 6 },
              { label: '', colspan: 2 }, // Total Appropriations
              { label: 'Endowments', colspan: 6 },
              { label: 'Grants', colspan: 6 },
              { label: 'East Asian Program Support', colspan: 6 },
              { label: '', colspan: 1 } // Total Budget
            ]
          };
        } else if (groupedHeaders && groupedHeaders.length > 0) {
          worksheetConfig.groupedHeaders = [
            { label: 'Year', colspan: 1 }, // Year column added first
            ...groupedHeaders // Keep all original headers including Institution
          ];
        }

        await exporter.createWorksheet(worksheetConfig);
      }
    }

    const buffer = await exporter.generateBuffer();
    const uint8Array = new Uint8Array(buffer);

    const fileName = `${library.library_name.replace(/[^a-z0-9]/gi, "_")}_Report_${years.join("-")}.xlsx`;

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": uint8Array.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating institutional report:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
