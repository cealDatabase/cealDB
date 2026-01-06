import ExcelJS from 'exceljs';
import { Buffer } from "node:buffer";

export interface ExportConfig {
  title: string;
  fullTitle: string; // Full descriptive title
  year: number;
  headers: string[];
  groupedHeaders?: { label: string; colspan: number }[]; // Optional grouped headers
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

    // Calculate academic year dates (July 1 to June 30)
    const startDate = `July 1, ${config.year}`;
    const endDate = `June 30, ${config.year + 1}`;

    // Add main title row with date range
    const mainTitle = `${config.fullTitle} from ${startDate} through ${endDate}`;
    const titleRow = worksheet.addRow([mainTitle]);
    titleRow.font = { bold: true, size: 12 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(1, 1, 1, config.headers.length);
    titleRow.height = 25;

    // Add grouped headers if provided
    let headerStartRow = 2;
    if (config.groupedHeaders && config.groupedHeaders.length > 0) {
      const groupedRow = worksheet.addRow([]);
      let colIndex = 1;
      
      config.groupedHeaders.forEach((group) => {
        if (group.colspan > 1) {
          worksheet.mergeCells(2, colIndex, 2, colIndex + group.colspan - 1);
        }
        const cell = worksheet.getCell(2, colIndex);
        cell.value = group.label;
        cell.font = { bold: true, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE7E6E6' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Apply border to all cells in the merged range
        for (let i = colIndex; i < colIndex + group.colspan; i++) {
          const mergedCell = worksheet.getCell(2, i);
          mergedCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        colIndex += group.colspan;
      });
      
      groupedRow.height = 20;
      headerStartRow = 3;
    }

    // Add column header row
    const headerRow = worksheet.addRow(config.headers);
    headerRow.font = { bold: true, size: 10 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 30;
    
    // Add borders to header cells
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

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
    'mapurchased_titles_chinese': 'CHN',
    'mapurchased_titles_japanese': 'JPN',
    'mapurchased_titles_korean': 'KOR',
    'mapurchased_titles_noncjk': 'N-CJK',
    'mapurchased_titles_subtotal': 'TOTAL',
    'mapurchased_volumes_chinese': 'CHN',
    'mapurchased_volumes_japanese': 'JPN',
    'mapurchased_volumes_korean': 'KOR',
    'mapurchased_volumes_noncjk': 'N-CJK',
    'mapurchased_volumes_subtotal': 'TOTAL',
    'manonpurchased_titles_chinese': 'CHN',
    'manonpurchased_titles_japanese': 'JPN',
    'manonpurchased_titles_korean': 'KOR',
    'manonpurchased_titles_noncjk': 'N-CJK',
    'manonpurchased_titles_subtotal': 'TOTAL',
    'manonpurchased_volumes_chinese': 'CHN',
    'manonpurchased_volumes_japanese': 'JPN',
    'manonpurchased_volumes_korean': 'KOR',
    'manonpurchased_volumes_noncjk': 'N-CJK',
    'manonpurchased_volumes_subtotal': 'TOTAL',
    'matotal_titles': 'Total Titles',
    'matotal_volumes': 'Total Volumes',
    'manotes': 'Notes'
  },
  volumeHoldings: {
    'Library_Year.Library.library_name': 'Institution',
    'vhprevious_year_chinese': 'CHN',
    'vhprevious_year_japanese': 'JPN',
    'vhprevious_year_korean': 'KOR',
    'vhprevious_year_noncjk': 'N-CJK',
    'vhprevious_year_subtotal': 'TOTAL',
    'vhadded_gross_chinese': 'CHN',
    'vhadded_gross_japanese': 'JPN',
    'vhadded_gross_korean': 'KOR',
    'vhadded_gross_noncjk': 'N-CJK',
    'vhadded_gross_subtotal': 'TOTAL',
    'vhwithdrawn_chinese': 'CHN',
    'vhwithdrawn_japanese': 'JPN',
    'vhwithdrawn_korean': 'KOR',
    'vhwithdrawn_noncjk': 'N-CJK',
    'vhwithdrawn_subtotal': 'TOTAL',
    'vhgrandtotal': 'Grand Total',
    'vhnotes': 'Notes'
  },
  serials: {
    'Library_Year.Library.library_name': 'Institution',
    'spurchased_chinese': 'CHN',
    'spurchased_japanese': 'JPN',
    'spurchased_korean': 'KOR',
    'spurchased_noncjk': 'N-CJK',
    'spurchased_subtotal': 'TOTAL',
    'snonpurchased_chinese': 'CHN',
    'snonpurchased_japanese': 'JPN',
    'snonpurchased_korean': 'KOR',
    'snonpurchased_noncjk': 'N-CJK',
    'snonpurchased_subtotal': 'TOTAL',
    'stotal_chinese': 'CHN',
    'stotal_japanese': 'JPN',
    'stotal_korean': 'KOR',
    'stotal_noncjk': 'N-CJK',
    'sgrandtotal': 'TOTAL',
    'snotes': 'Notes'
  },
  otherHoldings: {
    'Library_Year.Library.library_name': 'Institution',
    'ohaudio_chinese': 'CHN',
    'ohaudio_japanese': 'JPN',
    'ohaudio_korean': 'KOR',
    'ohaudio_noncjk': 'N-CJK',
    'ohaudio_subtotal': 'TOTAL',
    'ohfilm_video_chinese': 'CHN',
    'ohfilm_video_japanese': 'JPN',
    'ohfilm_video_korean': 'KOR',
    'ohfilm_video_noncjk': 'N-CJK',
    'ohfilm_video_subtotal': 'TOTAL',
    'ohmicroform_chinese': 'CHN',
    'ohmicroform_japanese': 'JPN',
    'ohmicroform_korean': 'KOR',
    'ohmicroform_noncjk': 'N-CJK',
    'ohmicroform_subtotal': 'TOTAL',
    'ohcdrom_chinese': 'CHN',
    'ohcdrom_japanese': 'JPN',
    'ohcdrom_korean': 'KOR',
    'ohcdrom_noncjk': 'N-CJK',
    'ohcdrom_subtotal': 'TOTAL',
    'ohdvd_chinese': 'CHN',
    'ohdvd_japanese': 'JPN',
    'ohdvd_korean': 'KOR',
    'ohdvd_noncjk': 'N-CJK',
    'ohdvd_subtotal': 'TOTAL',
    'ohgrandtotal': 'TOTAL',
    'ohnotes': 'Notes'
  },
  unprocessed: {
    'Library_Year.Library.library_name': 'Institution',
    'ubchinese': 'CHN',
    'ubjapanese': 'JPN',
    'ubkorean': 'KOR',
    'ubnoncjk': 'N-CJK',
    'ubtotal': 'TOTAL',
    'ubnotes': 'Notes'
  },
  fiscal: {
    'Library_Year.Library.library_name': 'Institution',
    'fschinese_appropriations_monographic': 'Mono',
    'fschinese_appropriations_serial': 'Serial',
    'fschinese_appropriations_other_material': 'Other',
    'fschinese_appropriations_electronic': 'Elec',
    'fschinese_appropriations_subtotal': 'TOTAL',
    'fsjapanese_appropriations_monographic': 'Mono',
    'fsjapanese_appropriations_serial': 'Serial',
    'fsjapanese_appropriations_other_material': 'Other',
    'fsjapanese_appropriations_electronic': 'Elec',
    'fsjapanese_appropriations_subtotal': 'TOTAL',
    'fskorean_appropriations_monographic': 'Mono',
    'fskorean_appropriations_serial': 'Serial',
    'fskorean_appropriations_other_material': 'Other',
    'fskorean_appropriations_electronic': 'Elec',
    'fskorean_appropriations_subtotal': 'TOTAL',
    'fsnoncjk_appropriations_monographic': 'Mono',
    'fsnoncjk_appropriations_serial': 'Serial',
    'fsnoncjk_appropriations_other_material': 'Other',
    'fsnoncjk_appropriations_electronic': 'Elec',
    'fsnoncjk_appropriations_subtotal': 'TOTAL',
    'fstotal_appropriations': 'TOTAL',
    'fsnotes': 'Notes'
  },
  personnel: {
    'Library_Year.Library.library_name': 'Institution',
    'psfprofessional_chinese': 'CHN',
    'psfprofessional_japanese': 'JPN',
    'psfprofessional_korean': 'KOR',
    'psfprofessional_eastasian': 'E-ASIA',
    'psfprofessional_subtotal': 'TOTAL',
    'psfsupport_staff_chinese': 'CHN',
    'psfsupport_staff_japanese': 'JPN',
    'psfsupport_staff_korean': 'KOR',
    'psfsupport_staff_eastasian': 'E-ASIA',
    'psfsupport_staff_subtotal': 'TOTAL',
    'psfstudent_assistants_chinese': 'CHN',
    'psfstudent_assistants_japanese': 'JPN',
    'psfstudent_assistants_korean': 'KOR',
    'psfstudent_assistants_eastasian': 'E-ASIA',
    'psfstudent_assistants_subtotal': 'TOTAL',
    'psftotal': 'TOTAL',
    'psfnotes': 'Notes'
  },
  publicServices: {
    'Library_Year.Library.library_name': 'Institution',
    'pspresentations_chinese': 'CHN',
    'pspresentations_japanese': 'JPN',
    'pspresentations_korean': 'KOR',
    'pspresentations_noncjk': 'N-CJK',
    'pspresentations_subtotal': 'TOTAL',
    'psreference_transactions_chinese': 'CHN',
    'psreference_transactions_japanese': 'JPN',
    'psreference_transactions_korean': 'KOR',
    'psreference_transactions_noncjk': 'N-CJK',
    'psreference_transactions_subtotal': 'TOTAL',
    'pspresentation_participants_subtotal': 'Total',
    'psnotes': 'Notes'
  },
  electronic: {
    'Library_Year.Library.library_name': 'Institution',
    'efulltext_electronic_title_chinese': 'CHN',
    'efulltext_electronic_title_japanese': 'JPN',
    'efulltext_electronic_title_korean': 'KOR',
    'efulltext_electronic_title_noncjk': 'N-CJK',
    'efulltext_electronic_title_subtotal': 'TOTAL',
    'eaggregated_databases': 'Total',
    'etotal_ejournals': 'Total',
    'etotal_ebooks': 'Total',
    'etotal_electronic_expenditure_chinese': 'CHN',
    'etotal_electronic_expenditure_japanese': 'JPN',
    'etotal_electronic_expenditure_korean': 'KOR',
    'etotal_electronic_expenditure_noncjk': 'N-CJK',
    'etotal_electronic_expenditure_subtotal': 'TOTAL',
    'enotes': 'Notes'
  },
  electronicBooks: {
    'Library_Year.Library.library_name': 'Institution',
    'ebooks_purchased_volumes_chinese': 'CHN',
    'ebooks_purchased_volumes_japanese': 'JPN',
    'ebooks_purchased_volumes_korean': 'KOR',
    'ebooks_purchased_volumes_noncjk': 'N-CJK',
    'ebooks_purchased_volumes_subtotal': 'TOTAL',
    'ebooks_purchased_titles_chinese': 'CHN',
    'ebooks_purchased_titles_japanese': 'JPN',
    'ebooks_purchased_titles_korean': 'KOR',
    'ebooks_purchased_titles_noncjk': 'N-CJK',
    'ebooks_purchased_titles_subtotal': 'TOTAL',
    'ebooks_subscription_volumes_chinese': 'CHN',
    'ebooks_subscription_volumes_japanese': 'JPN',
    'ebooks_subscription_volumes_korean': 'KOR',
    'ebooks_subscription_volumes_noncjk': 'N-CJK',
    'ebooks_subscription_volumes_subtotal': 'TOTAL',
    'ebooks_subscription_titles_chinese': 'CHN',
    'ebooks_subscription_titles_japanese': 'JPN',
    'ebooks_subscription_titles_korean': 'KOR',
    'ebooks_subscription_titles_noncjk': 'N-CJK',
    'ebooks_subscription_titles_subtotal': 'TOTAL',
    'ebooks_total_volumes': 'Total Volumes',
    'ebooks_total_titles': 'Total Titles',
    'ebooks_notes': 'Notes'
  }
};

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
