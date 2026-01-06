import ExcelJS from 'exceljs';
import { Buffer } from "node:buffer";

export interface ExportConfig {
  title: string;
  year: number;
  headers: string[];
  data: any[];
  fieldMapping: { [key: string]: string };
  includeNotes?: boolean;
  notesField?: string;
}

export class ExcelExporter {
  private workbook: ExcelJS.Workbook;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'CEAL Statistics System';
    this.workbook.created = new Date();
  }

  async createWorksheet(config: ExportConfig): Promise<void> {
    const worksheet = this.workbook.addWorksheet(config.title);

    // Add title row
    const titleRow = worksheet.addRow([`${config.title} - ${config.year}`]);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(1, 1, 1, config.headers.length);

    // Add empty row
    worksheet.addRow([]);

    // Add header row
    const headerRow = worksheet.addRow(config.headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    config.data.forEach((record) => {
      const rowData: any[] = [];
      Object.keys(config.fieldMapping).forEach((field) => {
        const value = record[field];
        // Handle different data types
        if (value === null || value === undefined) {
          rowData.push('');
        } else if (typeof value === 'number') {
          rowData.push(value);
        } else if (typeof value === 'string') {
          rowData.push(value);
        } else {
          rowData.push(String(value));
        }
      });
      const row = worksheet.addRow(rowData);
      
      // Format all numeric cells to 2 decimal places
      row.eachCell((cell, colNumber) => {
        if (typeof cell.value === 'number') {
          cell.numFmt = '0.00';
        }
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = config.headers[index]?.length || 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Add borders to all cells with data
    const lastRow = worksheet.rowCount;
    const lastCol = config.headers.length;
    for (let row = 3; row <= lastRow; row++) {
      for (let col = 1; col <= lastCol; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  }

  async generateBuffer(): Promise<Buffer> {
    const data = await this.workbook.xlsx.writeBuffer(); // Buffer | ArrayBuffer (depending on env/types)
    return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
  }

  getWorkbook(): ExcelJS.Workbook {
    return this.workbook;
  }
}

// Form-specific field mappings
export const formFieldMappings = {
  monographic: {
    'Library_Year.Library.library_name': 'Institution',
    'mapurchased_titles_chinese': 'Purchased Titles - Chinese',
    'mapurchased_titles_japanese': 'Purchased Titles - Japanese',
    'mapurchased_titles_korean': 'Purchased Titles - Korean',
    'mapurchased_titles_noncjk': 'Purchased Titles - Non-CJK',
    'mapurchased_titles_subtotal': 'Purchased Titles - Subtotal',
    'mapurchased_volumes_chinese': 'Purchased Volumes - Chinese',
    'mapurchased_volumes_japanese': 'Purchased Volumes - Japanese',
    'mapurchased_volumes_korean': 'Purchased Volumes - Korean',
    'mapurchased_volumes_noncjk': 'Purchased Volumes - Non-CJK',
    'mapurchased_volumes_subtotal': 'Purchased Volumes - Subtotal',
    'manonpurchased_titles_chinese': 'Non-Purchased Titles - Chinese',
    'manonpurchased_titles_japanese': 'Non-Purchased Titles - Japanese',
    'manonpurchased_titles_korean': 'Non-Purchased Titles - Korean',
    'manonpurchased_titles_noncjk': 'Non-Purchased Titles - Non-CJK',
    'manonpurchased_titles_subtotal': 'Non-Purchased Titles - Subtotal',
    'manonpurchased_volumes_chinese': 'Non-Purchased Volumes - Chinese',
    'manonpurchased_volumes_japanese': 'Non-Purchased Volumes - Japanese',
    'manonpurchased_volumes_korean': 'Non-Purchased Volumes - Korean',
    'manonpurchased_volumes_noncjk': 'Non-Purchased Volumes - Non-CJK',
    'manonpurchased_volumes_subtotal': 'Non-Purchased Volumes - Subtotal',
    'matotal_titles': 'Total Titles',
    'matotal_volumes': 'Total Volumes',
    'manotes': 'Notes'
  },
  volumeHoldings: {
    'Library_Year.Library.library_name': 'Institution',
    'vhprevious_year_chinese': 'Previous Year - Chinese',
    'vhprevious_year_japanese': 'Previous Year - Japanese',
    'vhprevious_year_korean': 'Previous Year - Korean',
    'vhprevious_year_noncjk': 'Previous Year - Non-CJK',
    'vhprevious_year_subtotal': 'Previous Year - Subtotal',
    'vhadded_gross_chinese': 'Added Gross - Chinese',
    'vhadded_gross_japanese': 'Added Gross - Japanese',
    'vhadded_gross_korean': 'Added Gross - Korean',
    'vhadded_gross_noncjk': 'Added Gross - Non-CJK',
    'vhadded_gross_subtotal': 'Added Gross - Subtotal',
    'vhwithdrawn_chinese': 'Withdrawn - Chinese',
    'vhwithdrawn_japanese': 'Withdrawn - Japanese',
    'vhwithdrawn_korean': 'Withdrawn - Korean',
    'vhwithdrawn_noncjk': 'Withdrawn - Non-CJK',
    'vhwithdrawn_subtotal': 'Withdrawn - Subtotal',
    'vhgrandtotal': 'Grand Total',
    'vhnotes': 'Notes'
  },
  serials: {
    'Library_Year.Library.library_name': 'Institution',
    'spurchased_chinese': 'Purchased - Chinese',
    'spurchased_japanese': 'Purchased - Japanese',
    'spurchased_korean': 'Purchased - Korean',
    'spurchased_noncjk': 'Purchased - Non-CJK',
    'spurchased_subtotal': 'Purchased - Subtotal',
    'snonpurchased_chinese': 'Non-Purchased - Chinese',
    'snonpurchased_japanese': 'Non-Purchased - Japanese',
    'snonpurchased_korean': 'Non-Purchased - Korean',
    'snonpurchased_noncjk': 'Non-Purchased - Non-CJK',
    'snonpurchased_subtotal': 'Non-Purchased - Subtotal',
    'stotal_chinese': 'Total - Chinese',
    'stotal_japanese': 'Total - Japanese',
    'stotal_korean': 'Total - Korean',
    'stotal_noncjk': 'Total - Non-CJK',
    'sgrandtotal': 'Grand Total',
    'snotes': 'Notes'
  },
  otherHoldings: {
    'Library_Year.Library.library_name': 'Institution',
    'ohaudio_chinese': 'Audio - Chinese',
    'ohaudio_japanese': 'Audio - Japanese',
    'ohaudio_korean': 'Audio - Korean',
    'ohaudio_noncjk': 'Audio - Non-CJK',
    'ohaudio_subtotal': 'Audio - Subtotal',
    'ohdvd_chinese': 'DVD - Chinese',
    'ohdvd_japanese': 'DVD - Japanese',
    'ohdvd_korean': 'DVD - Korean',
    'ohdvd_noncjk': 'DVD - Non-CJK',
    'ohdvd_subtotal': 'DVD - Subtotal',
    'ohfilm_video_chinese': 'Film/Video - Chinese',
    'ohfilm_video_japanese': 'Film/Video - Japanese',
    'ohfilm_video_korean': 'Film/Video - Korean',
    'ohfilm_video_noncjk': 'Film/Video - Non-CJK',
    'ohfilm_video_subtotal': 'Film/Video - Subtotal',
    'ohmicroform_chinese': 'Microform - Chinese',
    'ohmicroform_japanese': 'Microform - Japanese',
    'ohmicroform_korean': 'Microform - Korean',
    'ohmicroform_noncjk': 'Microform - Non-CJK',
    'ohmicroform_subtotal': 'Microform - Subtotal',
    'ohgrandtotal': 'Grand Total',
    'ohnotes': 'Notes'
  },
  unprocessed: {
    'Library_Year.Library.library_name': 'Institution',
    'ubchinese': 'Chinese',
    'ubjapanese': 'Japanese',
    'ubkorean': 'Korean',
    'ubnoncjk': 'Non-CJK',
    'ubtotal': 'Total',
    'ubcatalog_title': 'Catalog Title',
    'ubcatalog_volume': 'Catalog Volume',
    'ub_title': 'Title',
    'ub_volume': 'Volume',
    'ubnotes': 'Notes'
  },
  fiscal: {
    'Library_Year.Library.library_name': 'Institution',
    'fschinese_appropriations_monographic': 'Chinese Appropriations - Monographic',
    'fschinese_appropriations_serial': 'Chinese Appropriations - Serial',
    'fschinese_appropriations_other_material': 'Chinese Appropriations - Other Material',
    'fschinese_appropriations_electronic': 'Chinese Appropriations - Electronic',
    'fschinese_appropriations_subtotal': 'Chinese Appropriations - Subtotal',
    'fsjapanese_appropriations_monographic': 'Japanese Appropriations - Monographic',
    'fsjapanese_appropriations_serial': 'Japanese Appropriations - Serial',
    'fsjapanese_appropriations_other_material': 'Japanese Appropriations - Other Material',
    'fsjapanese_appropriations_electronic': 'Japanese Appropriations - Electronic',
    'fsjapanese_appropriations_subtotal': 'Japanese Appropriations - Subtotal',
    'fskorean_appropriations_monographic': 'Korean Appropriations - Monographic',
    'fskorean_appropriations_serial': 'Korean Appropriations - Serial',
    'fskorean_appropriations_other_material': 'Korean Appropriations - Other Material',
    'fskorean_appropriations_electronic': 'Korean Appropriations - Electronic',
    'fskorean_appropriations_subtotal': 'Korean Appropriations - Subtotal',
    'fstotal_appropriations': 'Total Appropriations',
    'fsnotes': 'Notes'
  },
  personnel: {
    'Library_Year.Library.library_name': 'Institution',
    'psfprofessional_chinese': 'Professional - Chinese',
    'psfprofessional_japanese': 'Professional - Japanese',
    'psfprofessional_korean': 'Professional - Korean',
    'psfprofessional_eastasian': 'Professional - East Asian',
    'psfprofessional_subtotal': 'Professional - Subtotal',
    'psfsupport_staff_chinese': 'Support Staff - Chinese',
    'psfsupport_staff_japanese': 'Support Staff - Japanese',
    'psfsupport_staff_korean': 'Support Staff - Korean',
    'psfsupport_staff_eastasian': 'Support Staff - East Asian',
    'psfsupport_staff_subtotal': 'Support Staff - Subtotal',
    'psfstudent_assistants_chinese': 'Student Assistants - Chinese',
    'psfstudent_assistants_japanese': 'Student Assistants - Japanese',
    'psfstudent_assistants_korean': 'Student Assistants - Korean',
    'psfstudent_assistants_eastasian': 'Student Assistants - East Asian',
    'psfstudent_assistants_subtotal': 'Student Assistants - Subtotal',
    'psftotal': 'Total',
    'psfnotes': 'Notes'
  },
  publicServices: {
    'Library_Year.Library.library_name': 'Institution',
    'pspresentations_subtotal': 'Presentations',
    'pspresentation_participants_subtotal': 'Presentation Participants',
    'psreference_transactions_subtotal': 'Reference Transactions',
    'pstotal_circulations_subtotal': 'Total Circulations',
    'pslending_requests_filled_subtotal': 'Lending Requests Filled',
    'pslending_requests_unfilled_subtotal': 'Lending Requests Unfilled',
    'psborrowing_requests_filled_subtotal': 'Borrowing Requests Filled',
    'psborrowing_requests_unfilled_subtotal': 'Borrowing Requests Unfilled',
    'psnotes': 'Notes'
  },
  electronic: {
    'Library_Year.Library.library_name': 'Institution',
    'efulltext_electronic_title_chinese': 'Full-text Electronic Title - Chinese',
    'efulltext_electronic_title_japanese': 'Full-text Electronic Title - Japanese',
    'efulltext_electronic_title_korean': 'Full-text Electronic Title - Korean',
    'efulltext_electronic_title_noncjk': 'Full-text Electronic Title - Non-CJK',
    'efulltext_electronic_title_subtotal': 'Full-text Electronic Title - Subtotal',
    'eindex_electronic_title_chinese': 'Index Electronic Title - Chinese',
    'eindex_electronic_title_japanese': 'Index Electronic Title - Japanese',
    'eindex_electronic_title_korean': 'Index Electronic Title - Korean',
    'eindex_electronic_title_noncjk': 'Index Electronic Title - Non-CJK',
    'eindex_electronic_title_subtotal': 'Index Electronic Title - Subtotal',
    'etotal_expenditure_grandtotal': 'Total Expenditure Grand Total',
    'enotes': 'Notes'
  },
  electronicBooks: {
    'Library_Year.Library.library_name': 'Institution',
    'ebooks_purchased_titles_chinese': 'Purchased Titles - Chinese',
    'ebooks_purchased_titles_japanese': 'Purchased Titles - Japanese',
    'ebooks_purchased_titles_korean': 'Purchased Titles - Korean',
    'ebooks_purchased_titles_noncjk': 'Purchased Titles - Non-CJK',
    'ebooks_purchased_titles_subtotal': 'Purchased Titles - Subtotal',
    'ebooks_purchased_volumes_chinese': 'Purchased Volumes - Chinese',
    'ebooks_purchased_volumes_japanese': 'Purchased Volumes - Japanese',
    'ebooks_purchased_volumes_korean': 'Purchased Volumes - Korean',
    'ebooks_purchased_volumes_noncjk': 'Purchased Volumes - Non-CJK',
    'ebooks_purchased_volumes_subtotal': 'Purchased Volumes - Subtotal',
    'ebooks_nonpurchased_titles_chinese': 'Non-Purchased Titles - Chinese',
    'ebooks_nonpurchased_titles_japanese': 'Non-Purchased Titles - Japanese',
    'ebooks_nonpurchased_titles_korean': 'Non-Purchased Titles - Korean',
    'ebooks_nonpurchased_titles_noncjk': 'Non-Purchased Titles - Non-CJK',
    'ebooks_nonpurchased_titles_subtotal': 'Non-Purchased Titles - Subtotal',
    'ebooks_total_titles': 'Total Titles',
    'ebooks_total_volumes': 'Total Volumes',
    'ebooks_notes': 'Notes'
  }
};

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
