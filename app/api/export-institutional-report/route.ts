import { NextRequest, NextResponse } from "next/server";
import { ExcelExporter, getNestedValue } from '@/lib/excelExporter';
import { formFieldMappings, notesFields } from '@/lib/formFieldMappings';
import db from "@/lib/db";
import { Buffer } from "node:buffer";

const prisma = db;

// Helper function to safely parse numbers from record values
function parseNum(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
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
      calculated.mapurchased_titles_subtotal = parseNum(record.mapurchased_titles_chinese) + parseNum(record.mapurchased_titles_japanese) + parseNum(record.mapurchased_titles_korean) + parseNum(record.mapurchased_titles_noncjk);
      calculated.mapurchased_volumes_subtotal = parseNum(record.mapurchased_volumes_chinese) + parseNum(record.mapurchased_volumes_japanese) + parseNum(record.mapurchased_volumes_korean) + parseNum(record.mapurchased_volumes_noncjk);
      calculated.manonpurchased_titles_subtotal = parseNum(record.manonpurchased_titles_chinese) + parseNum(record.manonpurchased_titles_japanese) + parseNum(record.manonpurchased_titles_korean) + parseNum(record.manonpurchased_titles_noncjk);
      calculated.manonpurchased_volumes_subtotal = parseNum(record.manonpurchased_volumes_chinese) + parseNum(record.manonpurchased_volumes_japanese) + parseNum(record.manonpurchased_volumes_korean) + parseNum(record.manonpurchased_volumes_noncjk);
      calculated.matotal_titles = calculated.mapurchased_titles_subtotal + calculated.manonpurchased_titles_subtotal;
      calculated.matotal_volumes = calculated.mapurchased_volumes_subtotal + calculated.manonpurchased_volumes_subtotal;
      break;
      
    case 'volumeHoldings':
      calculated.vhprevious_year_subtotal = parseNum(record.vhprevious_year_chinese) + parseNum(record.vhprevious_year_japanese) + parseNum(record.vhprevious_year_korean) + parseNum(record.vhprevious_year_noncjk);
      calculated.vhadded_gross_subtotal = parseNum(record.vhadded_gross_chinese) + parseNum(record.vhadded_gross_japanese) + parseNum(record.vhadded_gross_korean) + parseNum(record.vhadded_gross_noncjk);
      calculated.vhwithdrawn_subtotal = parseNum(record.vhwithdrawn_chinese) + parseNum(record.vhwithdrawn_japanese) + parseNum(record.vhwithdrawn_korean) + parseNum(record.vhwithdrawn_noncjk);
      calculated.vhgrandtotal = calculated.vhprevious_year_subtotal + calculated.vhadded_gross_subtotal - calculated.vhwithdrawn_subtotal;
      break;
      
    case 'serials':
      calculated.s_epurchased_subtotal = parseNum(record.s_epurchased_chinese) + parseNum(record.s_epurchased_japanese) + parseNum(record.s_epurchased_korean) + parseNum(record.s_epurchased_noncjk);
      calculated.spurchased_subtotal = parseNum(record.spurchased_chinese) + parseNum(record.spurchased_japanese) + parseNum(record.spurchased_korean) + parseNum(record.spurchased_noncjk);
      calculated.s_enonpurchased_subtotal = parseNum(record.s_enonpurchased_chinese) + parseNum(record.s_enonpurchased_japanese) + parseNum(record.s_enonpurchased_korean) + parseNum(record.s_enonpurchased_noncjk);
      calculated.snonpurchased_subtotal = parseNum(record.snonpurchased_chinese) + parseNum(record.snonpurchased_japanese) + parseNum(record.snonpurchased_korean) + parseNum(record.snonpurchased_noncjk);
      calculated.s_etotal_chinese = parseNum(record.s_epurchased_chinese) + parseNum(record.s_enonpurchased_chinese);
      calculated.s_etotal_japanese = parseNum(record.s_epurchased_japanese) + parseNum(record.s_enonpurchased_japanese);
      calculated.s_etotal_korean = parseNum(record.s_epurchased_korean) + parseNum(record.s_enonpurchased_korean);
      calculated.s_etotal_noncjk = parseNum(record.s_epurchased_noncjk) + parseNum(record.s_enonpurchased_noncjk);
      calculated.s_egrandtotal = calculated.s_epurchased_subtotal + calculated.s_enonpurchased_subtotal;
      calculated.stotal_chinese = parseNum(record.spurchased_chinese) + parseNum(record.snonpurchased_chinese);
      calculated.stotal_japanese = parseNum(record.spurchased_japanese) + parseNum(record.snonpurchased_japanese);
      calculated.stotal_korean = parseNum(record.spurchased_korean) + parseNum(record.snonpurchased_korean);
      calculated.stotal_noncjk = parseNum(record.spurchased_noncjk) + parseNum(record.snonpurchased_noncjk);
      calculated.sgrandtotal = calculated.spurchased_subtotal + calculated.snonpurchased_subtotal;
      calculated.stotal_overall = calculated.s_egrandtotal + calculated.sgrandtotal;
      break;
      
    case 'otherHoldings':
      calculated.ohmicroform_subtotal = parseNum(record.ohmicroform_chinese) + parseNum(record.ohmicroform_japanese) + parseNum(record.ohmicroform_korean) + parseNum(record.ohmicroform_noncjk);
      calculated.ohcarto_graphic_subtotal = parseNum(record.ohcarto_graphic_chinese) + parseNum(record.ohcarto_graphic_japanese) + parseNum(record.ohcarto_graphic_korean) + parseNum(record.ohcarto_graphic_noncjk);
      calculated.ohaudio_subtotal = parseNum(record.ohaudio_chinese) + parseNum(record.ohaudio_japanese) + parseNum(record.ohaudio_korean) + parseNum(record.ohaudio_noncjk);
      calculated.ohfilm_video_subtotal = parseNum(record.ohfilm_video_chinese) + parseNum(record.ohfilm_video_japanese) + parseNum(record.ohfilm_video_korean) + parseNum(record.ohfilm_video_noncjk);
      calculated.ohdvd_subtotal = parseNum(record.ohdvd_chinese) + parseNum(record.ohdvd_japanese) + parseNum(record.ohdvd_korean) + parseNum(record.ohdvd_noncjk);
      calculated.ohgrandtotal = calculated.ohmicroform_subtotal + calculated.ohcarto_graphic_subtotal + calculated.ohaudio_subtotal + calculated.ohfilm_video_subtotal + calculated.ohdvd_subtotal;
      break;
      
    case 'unprocessed':
      calculated.ubtotal = parseNum(record.ubchinese) + parseNum(record.ubjapanese) + parseNum(record.ubkorean) + parseNum(record.ubnoncjk);
      break;
      
    case 'fiscal':
      calculated.fschinese_appropriations_subtotal = round2(parseNum(record.fschinese_appropriations_monographic) + parseNum(record.fschinese_appropriations_serial) + parseNum(record.fschinese_appropriations_other_material) + parseNum(record.fschinese_appropriations_electronic));
      calculated.fsjapanese_appropriations_subtotal = round2(parseNum(record.fsjapanese_appropriations_monographic) + parseNum(record.fsjapanese_appropriations_serial) + parseNum(record.fsjapanese_appropriations_other_material) + parseNum(record.fsjapanese_appropriations_electronic));
      calculated.fskorean_appropriations_subtotal = round2(parseNum(record.fskorean_appropriations_monographic) + parseNum(record.fskorean_appropriations_serial) + parseNum(record.fskorean_appropriations_other_material) + parseNum(record.fskorean_appropriations_electronic));
      calculated.fsnoncjk_appropriations_subtotal = round2(parseNum(record.fsnoncjk_appropriations_monographic) + parseNum(record.fsnoncjk_appropriations_serial) + parseNum(record.fsnoncjk_appropriations_other_material) + parseNum(record.fsnoncjk_appropriations_electronic));
      calculated.fstotal_appropriations = round2(calculated.fschinese_appropriations_subtotal + calculated.fsjapanese_appropriations_subtotal + calculated.fskorean_appropriations_subtotal + calculated.fsnoncjk_appropriations_subtotal);
      calculated.fsendowments_subtotal = round2(parseNum(record.fsendowments_chinese) + parseNum(record.fsendowments_japanese) + parseNum(record.fsendowments_korean) + parseNum(record.fsendowments_noncjk));
      calculated.fsgrants_subtotal = round2(parseNum(record.fsgrants_chinese) + parseNum(record.fsgrants_japanese) + parseNum(record.fsgrants_korean) + parseNum(record.fsgrants_noncjk));
      calculated.fseast_asian_program_support_subtotal = round2(parseNum(record.fseast_asian_program_support_chinese) + parseNum(record.fseast_asian_program_support_japanese) + parseNum(record.fseast_asian_program_support_korean) + parseNum(record.fseast_asian_program_support_noncjk));
      calculated.fstotal_acquisition_budget = round2(calculated.fstotal_appropriations + calculated.fsendowments_subtotal + calculated.fsgrants_subtotal + calculated.fseast_asian_program_support_subtotal);
      break;
      
    case 'personnel':
      calculated.psfprofessional_subtotal = round2(parseNum(record.psfprofessional_chinese) + parseNum(record.psfprofessional_japanese) + parseNum(record.psfprofessional_korean) + parseNum(record.psfprofessional_eastasian));
      calculated.psfsupport_staff_subtotal = round2(parseNum(record.psfsupport_staff_chinese) + parseNum(record.psfsupport_staff_japanese) + parseNum(record.psfsupport_staff_korean) + parseNum(record.psfsupport_staff_eastasian));
      calculated.psfstudent_assistants_subtotal = round2(parseNum(record.psfstudent_assistants_chinese) + parseNum(record.psfstudent_assistants_japanese) + parseNum(record.psfstudent_assistants_korean) + parseNum(record.psfstudent_assistants_eastasian));
      calculated.psftotal = round2(calculated.psfprofessional_subtotal + calculated.psfsupport_staff_subtotal + calculated.psfstudent_assistants_subtotal + parseNum(record.psfothers));
      break;
      
    case 'publicServices':
      // Public services fields are already calculated/stored as subtotals
      break;
      
    case 'electronic':
      // One-time Computer Files subtotals
      calculated.eonetime_computer_title_subtotal = parseNum(record.eonetime_computer_title_chinese) + parseNum(record.eonetime_computer_title_japanese) + parseNum(record.eonetime_computer_title_korean) + parseNum(record.eonetime_computer_title_noncjk);
      calculated.eonetime_computer_cd_subtotal = parseNum(record.eonetime_computer_cd_chinese) + parseNum(record.eonetime_computer_cd_japanese) + parseNum(record.eonetime_computer_cd_korean) + parseNum(record.eonetime_computer_cd_noncjk);
      // Accompanied Computer Files subtotals
      calculated.eaccompanied_computer_title_subtotal = parseNum(record.eaccompanied_computer_title_chinese) + parseNum(record.eaccompanied_computer_title_japanese) + parseNum(record.eaccompanied_computer_title_korean) + parseNum(record.eaccompanied_computer_title_noncjk);
      calculated.eaccompanied_computer_cd_subtotal = parseNum(record.eaccompanied_computer_cd_chinese) + parseNum(record.eaccompanied_computer_cd_japanese) + parseNum(record.eaccompanied_computer_cd_korean) + parseNum(record.eaccompanied_computer_cd_noncjk);
      // Gift Computer Files subtotals
      calculated.egift_computer_title_subtotal = parseNum(record.egift_computer_title_chinese) + parseNum(record.egift_computer_title_japanese) + parseNum(record.egift_computer_title_korean) + parseNum(record.egift_computer_title_noncjk);
      calculated.egift_computer_cd_subtotal = parseNum(record.egift_computer_cd_chinese) + parseNum(record.egift_computer_cd_japanese) + parseNum(record.egift_computer_cd_korean) + parseNum(record.egift_computer_cd_noncjk);
      // Total Computer Files (Current Year) subtotals
      calculated.etotal_computer_title_subtotal = parseNum(record.etotal_computer_title_chinese) + parseNum(record.etotal_computer_title_japanese) + parseNum(record.etotal_computer_title_korean) + parseNum(record.etotal_computer_title_noncjk);
      calculated.etotal_computer_cd_subtotal = parseNum(record.etotal_computer_cd_chinese) + parseNum(record.etotal_computer_cd_japanese) + parseNum(record.etotal_computer_cd_korean) + parseNum(record.etotal_computer_cd_noncjk);
      // Previous Year Totals subtotals
      calculated.eprevious_total_title_subtotal = parseNum(record.eprevious_total_title_chinese) + parseNum(record.eprevious_total_title_japanese) + parseNum(record.eprevious_total_title_korean) + parseNum(record.eprevious_total_title_noncjk);
      calculated.eprevious_total_cd_subtotal = parseNum(record.eprevious_total_cd_chinese) + parseNum(record.eprevious_total_cd_japanese) + parseNum(record.eprevious_total_cd_korean) + parseNum(record.eprevious_total_cd_noncjk);
      // Grand Totals subtotals
      calculated.egrand_total_title_subtotal = parseNum(record.egrand_total_title_chinese) + parseNum(record.egrand_total_title_japanese) + parseNum(record.egrand_total_title_korean) + parseNum(record.egrand_total_title_noncjk);
      calculated.egrand_total_cd_subtotal = parseNum(record.egrand_total_cd_chinese) + parseNum(record.egrand_total_cd_japanese) + parseNum(record.egrand_total_cd_korean) + parseNum(record.egrand_total_cd_noncjk);
      // Electronic Indexes subtotals
      calculated.eindex_electronic_title_subtotal = parseNum(record.eindex_electronic_title_chinese) + parseNum(record.eindex_electronic_title_japanese) + parseNum(record.eindex_electronic_title_korean) + parseNum(record.eindex_electronic_title_noncjk);
      // Full-text Electronic subtotals
      calculated.efulltext_electronic_title_subtotal = parseNum(record.efulltext_electronic_title_chinese) + parseNum(record.efulltext_electronic_title_japanese) + parseNum(record.efulltext_electronic_title_korean) + parseNum(record.efulltext_electronic_title_noncjk);
      // Total Electronic Titles subtotals
      calculated.etotal_electronic_title_subtotal = parseNum(record.etotal_electronic_title_chinese) + parseNum(record.etotal_electronic_title_japanese) + parseNum(record.etotal_electronic_title_korean) + parseNum(record.etotal_electronic_title_noncjk);
      break;
      
    case 'electronicBooks':
      calculated.ebooks_purchased_prev_titles_subtotal = parseNum(record.ebooks_purchased_prev_titles_chinese) + parseNum(record.ebooks_purchased_prev_titles_japanese) + parseNum(record.ebooks_purchased_prev_titles_korean) + parseNum(record.ebooks_purchased_prev_titles_noncjk);
      calculated.ebooks_purchased_add_titles_subtotal = parseNum(record.ebooks_purchased_add_titles_chinese) + parseNum(record.ebooks_purchased_add_titles_japanese) + parseNum(record.ebooks_purchased_add_titles_korean) + parseNum(record.ebooks_purchased_add_titles_noncjk);
      calculated.ebooks_purchased_titles_chinese = parseNum(record.ebooks_purchased_prev_titles_chinese) + parseNum(record.ebooks_purchased_add_titles_chinese);
      calculated.ebooks_purchased_titles_japanese = parseNum(record.ebooks_purchased_prev_titles_japanese) + parseNum(record.ebooks_purchased_add_titles_japanese);
      calculated.ebooks_purchased_titles_korean = parseNum(record.ebooks_purchased_prev_titles_korean) + parseNum(record.ebooks_purchased_add_titles_korean);
      calculated.ebooks_purchased_titles_noncjk = parseNum(record.ebooks_purchased_prev_titles_noncjk) + parseNum(record.ebooks_purchased_add_titles_noncjk);
      calculated.ebooks_purchased_titles_subtotal = calculated.ebooks_purchased_titles_chinese + calculated.ebooks_purchased_titles_japanese + calculated.ebooks_purchased_titles_korean + calculated.ebooks_purchased_titles_noncjk;
      calculated.ebooks_nonpurchased_titles_subtotal = parseNum(record.ebooks_nonpurchased_titles_chinese) + parseNum(record.ebooks_nonpurchased_titles_japanese) + parseNum(record.ebooks_nonpurchased_titles_korean) + parseNum(record.ebooks_nonpurchased_titles_noncjk);
      calculated.ebooks_subscription_titles_subtotal = parseNum(record.ebooks_subscription_titles_chinese) + parseNum(record.ebooks_subscription_titles_japanese) + parseNum(record.ebooks_subscription_titles_korean) + parseNum(record.ebooks_subscription_titles_noncjk);
      calculated.ebooks_purchased_prev_volumes_subtotal = parseNum(record.ebooks_purchased_prev_volumes_chinese) + parseNum(record.ebooks_purchased_prev_volumes_japanese) + parseNum(record.ebooks_purchased_prev_volumes_korean) + parseNum(record.ebooks_purchased_prev_volumes_noncjk);
      calculated.ebooks_purchased_add_volumes_subtotal = parseNum(record.ebooks_purchased_add_volumes_chinese) + parseNum(record.ebooks_purchased_add_volumes_japanese) + parseNum(record.ebooks_purchased_add_volumes_korean) + parseNum(record.ebooks_purchased_add_volumes_noncjk);
      calculated.ebooks_purchased_volumes_chinese = parseNum(record.ebooks_purchased_prev_volumes_chinese) + parseNum(record.ebooks_purchased_add_volumes_chinese);
      calculated.ebooks_purchased_volumes_japanese = parseNum(record.ebooks_purchased_prev_volumes_japanese) + parseNum(record.ebooks_purchased_add_volumes_japanese);
      calculated.ebooks_purchased_volumes_korean = parseNum(record.ebooks_purchased_prev_volumes_korean) + parseNum(record.ebooks_purchased_add_volumes_korean);
      calculated.ebooks_purchased_volumes_noncjk = parseNum(record.ebooks_purchased_prev_volumes_noncjk) + parseNum(record.ebooks_purchased_add_volumes_noncjk);
      calculated.ebooks_purchased_volumes_subtotal = calculated.ebooks_purchased_volumes_chinese + calculated.ebooks_purchased_volumes_japanese + calculated.ebooks_purchased_volumes_korean + calculated.ebooks_purchased_volumes_noncjk;
      calculated.ebooks_nonpurchased_volumes_subtotal = parseNum(record.ebooks_nonpurchased_volumes_chinese) + parseNum(record.ebooks_nonpurchased_volumes_japanese) + parseNum(record.ebooks_nonpurchased_volumes_korean) + parseNum(record.ebooks_nonpurchased_volumes_noncjk);
      calculated.ebooks_subscription_volumes_subtotal = parseNum(record.ebooks_subscription_volumes_chinese) + parseNum(record.ebooks_subscription_volumes_japanese) + parseNum(record.ebooks_subscription_volumes_korean) + parseNum(record.ebooks_subscription_volumes_noncjk);
      calculated.ebooks_total_titles = calculated.ebooks_purchased_titles_subtotal + calculated.ebooks_nonpurchased_titles_subtotal;
      calculated.ebooks_total_volumes = calculated.ebooks_purchased_volumes_subtotal + calculated.ebooks_nonpurchased_volumes_subtotal;
      break;
  }
  
  return calculated;
}

// Get grouped headers configuration for each form (EXACT COPY from year-end-reports)
function getGroupedHeaders(formType: string): { label: string; colspan: number }[] {
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
        { label: 'Previous Year Total', colspan: 5 },
        { label: 'Added (Gross)', colspan: 5 },
        { label: 'Withdrawn', colspan: 5 },
        { label: 'Grand Total', colspan: 1 }
      ];
    case 'serials':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'ELECTRONIC: Purchased', colspan: 5 },
        { label: 'PRINT: Purchased', colspan: 5 },
        { label: 'ELECTRONIC: Non-Purchased', colspan: 5 },
        { label: 'PRINT: Non-Purchased', colspan: 5 },
        { label: 'ELECTRONIC: Totals', colspan: 5 },
        { label: 'PRINT: Totals', colspan: 5 },
        { label: 'Overall Total', colspan: 1 }
      ];
    case 'otherHoldings':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Microform', colspan: 5 },
        { label: 'Cartographic/Graphic', colspan: 5 },
        { label: 'Audio', colspan: 5 },
        { label: 'Film/Video', colspan: 5 },
        { label: 'DVD', colspan: 5 },
        { label: 'Grand Total', colspan: 1 }
      ];
    case 'unprocessed':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Materials by Language', colspan: 5 }
      ];
    case 'fiscal':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'CHI Appropriations', colspan: 5 },
        { label: 'JPN Appropriations', colspan: 5 },
        { label: 'KOR Appropriations', colspan: 5 },
        { label: 'Non-CJK Appropriations', colspan: 5 },
        { label: 'Total Appropriations', colspan: 1 },
        { label: 'Endowments', colspan: 5 },
        { label: 'Grants', colspan: 5 },
        { label: 'East Asian Program Support', colspan: 5 },
        { label: 'Total Acquisition Budget', colspan: 1 }
      ];
    case 'personnel':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Professional', colspan: 5 },
        { label: 'Support Staff', colspan: 5 },
        { label: 'Student Assistants', colspan: 5 },
        { label: 'Others/Total', colspan: 2 },
        { label: 'Outsourcing', colspan: 2 }
      ];
    case 'publicServices':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Presentations', colspan: 2 },
        { label: 'Reference', colspan: 1 },
        { label: 'Circulation', colspan: 1 },
        { label: 'Inter-Library Loan', colspan: 4 }
      ];
    case 'electronic':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'One-time Computer Files', colspan: 10 },
        { label: 'Accompanied Computer Files', colspan: 10 },
        { label: 'Gift Computer Files', colspan: 10 },
        { label: 'Total Computer Files (Current Year)', colspan: 10 },
        { label: 'Previous Year Totals', colspan: 10 },
        { label: 'Grand Totals', colspan: 10 },
        { label: 'Electronic Indexes', colspan: 5 },
        { label: 'Full-text Electronic', colspan: 5 },
        { label: 'Total Electronic Titles', colspan: 5 },
        { label: 'Expenditure', colspan: 3 }
      ];
    case 'electronicBooks':
      return [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Titles (Previous)', colspan: 5 },
        { label: 'Purchased Titles (Added)', colspan: 5 },
        { label: 'Purchased Titles (Total)', colspan: 5 },
        { label: 'Non-Purchased Titles', colspan: 5 },
        { label: 'Subscription Titles', colspan: 5 },
        { label: 'Purchased Volumes (Previous)', colspan: 5 },
        { label: 'Purchased Volumes (Added)', colspan: 5 },
        { label: 'Purchased Volumes (Total)', colspan: 5 },
        { label: 'Non-Purchased Volumes', colspan: 5 },
        { label: 'Subscription Volumes', colspan: 5 },
        { label: 'Totals', colspan: 2 }
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

        await exporter.createWorksheet({
          title: title,
          fullTitle: `${fullTitle} (${years.join(', ')})`,
          year: firstYear,
          headers: headers,
          groupedHeaders: groupedHeaders.length > 0 ? [
            { label: '', colspan: 1 }, // Year column
            ...groupedHeaders.slice(1) // Skip the Institution header since we have Year instead
          ] : undefined,
          data: allYearsData,
          fieldMapping: extendedFieldMapping,
          notesField: (notesFields as any)[formType]
        });
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
