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
  notesField?: string; // Field name containing notes (will be placed at bottom)
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

    // Add main title row without date range
    const mainTitle = config.fullTitle;
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

    // Add column header row (excluding notes field)
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

    // Determine if this form needs decimal formatting (fiscal and personnel only)
    const needsDecimals = config.title.includes('Fiscal') || config.title.includes('Personnel');
    
    // Helper to round numbers to 2 decimal places
    const round2 = (num: number): number => Math.round(num * 100) / 100;
    
    // Add data rows (excluding notes field)
    config.data.forEach((record) => {
      const rowData: any[] = [];
      Object.keys(config.fieldMapping).forEach((field) => {
        // Skip notes field - it will be added at the bottom
        if (config.notesField && field === config.notesField) {
          return;
        }
        
        const value = record[field];
        // Handle different data types
        if (value === null || value === undefined) {
          rowData.push('');
        } else if (typeof value === 'boolean') {
          // Convert boolean to yes/no
          rowData.push(value ? 'yes' : 'no');
        } else if (typeof value === 'number') {
          // Round to 2 decimals for Fiscal and Personnel forms to fix precision issues
          rowData.push(needsDecimals ? round2(value) : value);
        } else if (typeof value === 'string') {
          rowData.push(value);
        } else {
          rowData.push(String(value));
        }
      });
      const row = worksheet.addRow(rowData);
      
      // Format numeric cells based on form type
      row.eachCell((cell, colNumber) => {
        if (typeof cell.value === 'number') {
          // First column (Year) should always be integer format
          if (colNumber === 1) {
            cell.numFmt = '0';
          } else {
            // Fiscal and Personnel forms get 2 decimal places, others get 0
            cell.numFmt = needsDecimals ? '0.00' : '0';
          }
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
    const lastDataRow = worksheet.rowCount;
    const lastCol = config.headers.length;
    for (let row = headerStartRow; row <= lastDataRow; row++) {
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

    // Add notes section at the bottom if notesField is specified
    if (config.notesField) {
      // Add blank row for spacing
      worksheet.addRow([]);
      
      // Add "Notes" header row with Year column
      const notesHeaderRow = worksheet.addRow(['Year', 'Institution', 'Notes']);
      notesHeaderRow.font = { bold: true, size: 10 };
      notesHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD966' } // Yellow background for notes section
      };
      notesHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      notesHeaderRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add notes data rows
      config.data.forEach((record) => {
        const year = record['year'] || '';
        const institutionName = record['Library_Year.Library.library_name'] || '';
        const notes = config.notesField ? (record[config.notesField] || '') : '';
        
        // Only add row if there are notes
        if (notes && notes.trim() !== '') {
          const notesRow = worksheet.addRow([year, institutionName, notes]);
          notesRow.alignment = { vertical: 'top', wrapText: true };
          notesRow.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            // Format year column as integer
            if (colNumber === 1 && typeof cell.value === 'number') {
              cell.numFmt = '0';
            }
          });
        }
      });

      // Set notes column widths
      const notesStartCol = worksheet.rowCount > lastDataRow + 2 ? 1 : 1;
      worksheet.getColumn(notesStartCol).width = 8; // Year column
      worksheet.getColumn(notesStartCol + 1).width = 30; // Institution column
      worksheet.getColumn(notesStartCol + 2).width = 70; // Notes column
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

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
