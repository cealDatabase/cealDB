// @ts-ignore - pdfmake CJS module
import PdfPrinterModule from 'pdfmake/js/Printer.js';
import type { TDocumentDefinitions, Content, TableCell, ContentTable } from 'pdfmake/interfaces';
import path from 'path';

const PdfPrinter = PdfPrinterModule.default || PdfPrinterModule;

// Font definitions for pdfmake server-side - use absolute paths for reliability
const fontDir = path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto');
const fonts = {
  Roboto: {
    normal: path.join(fontDir, 'Roboto-Regular.ttf'),
    bold: path.join(fontDir, 'Roboto-Medium.ttf'),
    italics: path.join(fontDir, 'Roboto-Italic.ttf'),
    bolditalics: path.join(fontDir, 'Roboto-MediumItalic.ttf'),
  }
};

export interface PdfTableConfig {
  tableNumber: string;       // e.g. "Table 1", "Table 3-1"
  title: string;             // e.g. "Monograph Additions"
  subtitle?: string;         // e.g. "Acquisitions of East Asian Materials from July 1, 2023 through June 30, 2024"
  headerTiers: HeaderTier[]; // multi-tier column headers (1-3 tiers)
  fieldKeys: string[];       // database field keys matching the bottom-tier headers
  data: any[];               // array of records
  notesField?: string;       // field name for notes
  formatAsCurrency?: boolean;
  fiscalYear: number;        // the selected year
  totalInstitutions?: number; // override institution count for split tables
  skipNotes?: boolean;        // true to suppress notes (used on non-last parts of split tables)
}

export interface HeaderTier {
  cells: HeaderCell[];
}

export interface HeaderCell {
  label: string;
  colspan: number;
  rowspan?: number;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function formatValue(value: any, asCurrency: boolean = false): string {
  if (value === null || value === undefined || value === '') return '';
  if (asCurrency && typeof value === 'number') {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (typeof value === 'number') {
    // Check if it's a decimal (FTE values)
    if (!Number.isInteger(value)) {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toLocaleString('en-US');
  }
  return String(value);
}

export class PdfExporter {
  private content: Content[] = [];
  private pageCount = 0;

  addTable(config: PdfTableConfig): void {
    const {
      tableNumber,
      title,
      subtitle,
      headerTiers,
      fieldKeys,
      data: rawData,
      notesField,
      formatAsCurrency = false,
    } = config;

    // Filter out institutions that have NO data for this form
    // (all numeric fields are null/undefined/empty)
    const data = rawData.filter(record => {
      for (let i = 1; i < fieldKeys.length; i++) {
        const val = getNestedValue(record, fieldKeys[i]);
        if (val !== null && val !== undefined && val !== '' && val !== 0) {
          return true;
        }
      }
      // Also keep if they have notes
      if (notesField) {
        const noteVal = record[notesField];
        if (noteVal && String(noteVal).trim()) return true;
      }
      return false;
    });

    // Skip table entirely if no participating institutions
    if (data.length === 0) return;

    // Page break before each table (except the first)
    if (this.pageCount > 0) {
      this.content.push({ text: '', pageBreak: 'before' });
    }
    this.pageCount++;

    // Table number
    this.content.push({
      text: tableNumber,
      style: 'tableNumber',
      alignment: 'center',
      margin: [0, 5, 0, 5],
    });

    // Title
    this.content.push({
      text: title,
      style: 'tableTitle',
      alignment: 'center',
      margin: [0, 0, 0, 2],
    });

    // Subtitle
    if (subtitle) {
      this.content.push({
        text: subtitle,
        style: 'tableSubtitle',
        alignment: 'center',
        margin: [0, 0, 0, 5],
      });
    }

    // Build table header rows
    const headerRows: TableCell[][] = [];
    for (const tier of headerTiers) {
      const row: TableCell[] = [];
      for (const cell of tier.cells) {
        const headerCell: TableCell = {
          text: cell.label,
          style: 'headerCell',
          alignment: 'center',
          colSpan: cell.colspan > 1 ? cell.colspan : undefined,
          rowSpan: cell.rowspan && cell.rowspan > 1 ? cell.rowspan : undefined,
        };
        row.push(headerCell);
        // Add empty cells for colspan
        for (let i = 1; i < cell.colspan; i++) {
          row.push({ text: '', style: 'headerCell' });
        }
      }
      headerRows.push(row);
    }

    // Build data rows
    const dataRows: TableCell[][] = [];
    const numCols = fieldKeys.length;
    const columnSums: (number | null)[] = new Array(numCols).fill(null);

    for (const record of data) {
      const row: TableCell[] = [];
      for (let i = 0; i < numCols; i++) {
        const key = fieldKeys[i];
        const value = getNestedValue(record, key);
        const isInstitution = i === 0;

        row.push({
          text: formatValue(value, !isInstitution && formatAsCurrency),
          style: isInstitution ? 'institutionCell' : 'dataCell',
          alignment: isInstitution ? 'left' : 'right',
        });

        // Accumulate sums for numeric columns (skip institution column)
        if (!isInstitution && value !== null && value !== undefined && value !== '') {
          const numVal = typeof value === 'number' ? value : parseFloat(value);
          if (!isNaN(numVal)) {
            columnSums[i] = (columnSums[i] ?? 0) + numVal;
          }
        }
      }
      dataRows.push(row);
    }

    // Build totals row
    const totalsRow: TableCell[] = [];
    const institutionCount = config.totalInstitutions ?? data.length;
    totalsRow.push({
      text: `${institutionCount} Total Records`,
      style: 'totalsCell',
      alignment: 'left',
    });
    for (let i = 1; i < numCols; i++) {
      totalsRow.push({
        text: columnSums[i] !== null
          ? formatValue(formatAsCurrency ? Math.round(columnSums[i]! * 100) / 100 : columnSums[i]!, formatAsCurrency)
          : '',
        style: 'totalsCell',
        alignment: 'right',
      });
    }

    // Calculate column widths - explicit numeric widths to guarantee fit
    const padH = numCols > 20 ? 1 : 2; // Reduce horizontal padding for wide tables
    const colWidths = this.calculateColumnWidths(numCols, padH);

    // Assemble table body
    const tableBody = [...headerRows, ...dataRows, totalsRow];

    const tableContent: ContentTable = {
      table: {
        headerRows: headerTiers.length,
        widths: colWidths,
        body: tableBody,
        dontBreakRows: true,
      },
      layout: {
        hLineWidth: (i: number, node: any) => {
          if (i === headerTiers.length || i === node.table.body.length - 1 || i === node.table.body.length) return 0.5;
          return 0.25;
        },
        vLineWidth: () => 0.25,
        hLineColor: (i: number, node: any) => {
          if (i === headerTiers.length || i === node.table.body.length - 1 || i === node.table.body.length) return '#000000';
          return '#CCCCCC';
        },
        vLineColor: () => '#CCCCCC',
        paddingLeft: () => padH,
        paddingRight: () => padH,
        paddingTop: () => 0.5,
        paddingBottom: () => 0.5,
        fillColor: (rowIndex: number) => {
          if (rowIndex < headerTiers.length) return '#E8E8E8';
          return null;
        },
      },
    };

    this.content.push(tableContent);

    // Add notes section (only on the last part of split tables)
    if (notesField && !config.skipNotes) {
      const notes: string[] = [];
      for (const record of data) {
        const noteValue = record[notesField];
        if (noteValue && String(noteValue).trim()) {
          const instName = getNestedValue(record, 'Library_Year.Library.library_name') || 'Unknown';
          notes.push(`${instName} (${config.fiscalYear} ${this.getFormNameFromTableNumber(tableNumber)}): ${String(noteValue).trim()}`);
        }
      }
      if (notes.length > 0) {
        this.content.push({
          text: '',
          margin: [0, 5, 0, 0],
        });
        for (const note of notes) {
          this.content.push({
            text: note,
            style: 'noteText',
            margin: [0, 1, 0, 1],
          });
        }
      }
    }
  }

  private getFormNameFromTableNumber(tableNumber: string): string {
    const map: Record<string, string> = {
      'Table 1': 'Monograph Additions Form',
      'Table 2': 'Volume Holdings Form',
      'Table 3-1': 'Serials Form',
      'Table 3-2': 'Serials Form',
      'Table 4-1': 'Other Holdings Form',
      'Table 4-2': 'Other Holdings Form',
      'Table 4-3': 'Other Holdings Form',
      'Table 5': 'Total Collections',
      'Table 6-1': 'Fiscal Support Form',
      'Table 6-2': 'Fiscal Support Form',
      'Table 7': 'Personnel Support Form',
      'Table 8': 'Public Services Form',
      'Table 9-1': 'Electronic Resources Form',
      'Table 9-2': 'Electronic Resources Form',
      'Table 10-1': 'Electronic Books Form',
      'Table 10-2': 'Electronic Books Form',
    };
    return map[tableNumber] || 'Form';
  }

  private calculateColumnWidths(numCols: number, padH: number): (string | number)[] {
    if (numCols <= 1) return ['*'];

    // Landscape Letter: 792pt width - 20pt left margin - 20pt right margin = 752pt
    // Subtract vertical line widths: (numCols + 1) * 0.25pt
    const lineWidth = 0.25;
    const pageContentWidth = 752 - (numCols + 1) * lineWidth;
    // Subtract cell padding: numCols * (padH left + padH right)
    const usableWidth = pageContentWidth - numCols * padH * 2;

    // Institution column: give it proportionally more space
    // For tables with many columns, institution gets less; for few columns, more
    const instRatio = numCols <= 10 ? 0.20 : numCols <= 20 ? 0.14 : numCols <= 26 ? 0.11 : 0.09;
    const instWidth = Math.max(40, Math.floor(usableWidth * instRatio));
    const dataColWidth = Math.floor((usableWidth - instWidth) / (numCols - 1));

    const widths: number[] = [instWidth];
    for (let i = 1; i < numCols; i++) {
      widths.push(dataColWidth);
    }
    return widths;
  }

  async generateBuffer(): Promise<Buffer> {
    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      pageMargins: [20, 20, 20, 20],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 5,
      },
      styles: {
        tableNumber: {
          fontSize: 7,
          bold: false,
          italics: true,
        },
        tableTitle: {
          fontSize: 7,
          bold: true,
        },
        tableSubtitle: {
          fontSize: 6,
          bold: true,
        },
        headerCell: {
          fontSize: 4.5,
          bold: true,
          fillColor: '#E8E8E8',
        },
        institutionCell: {
          fontSize: 4.5,
        },
        dataCell: {
          fontSize: 4.5,
        },
        totalsCell: {
          fontSize: 4.5,
          bold: true,
        },
        noteText: {
          fontSize: 4.5,
          italics: true,
          color: '#333333',
        },
      },
      content: this.content,
    };

    // pdfmake v0.3.x: createPdfKitDocument is async, returns a pdfkit document (stream)
    const pdfDoc = await printer.createPdfKitDocument(docDefinition);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
