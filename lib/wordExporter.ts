import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  AlignmentType,
  VerticalAlign,
  BorderStyle,
  TextRun,
  HeadingLevel,
  PageOrientation
} from 'docx';
import { Buffer } from 'node:buffer';

export interface WordExportConfig {
  title: string;
  fullTitle: string;
  year: number;
  headers: string[];
  groupedHeaders?: { label: string; colspan: number }[];
  multiTierHeaders?: {
    tier1?: { label: string; colspan: number }[];
    tier2?: { label: string; colspan: number }[];
  };
  data: any[];
  fieldMapping: { [key: string]: string };
  notesField?: string;
}

export class WordExporter {
  private document: Document;
  private sections: any[] = [];

  constructor() {
    this.document = new Document({
      creator: 'CEAL Statistics System',
      title: 'CEAL Statistics Report',
      sections: []
    });
  }

  async createDocument(config: WordExportConfig): Promise<void> {
    const children: any[] = [];

    // Add main title
    children.push(
      new Paragraph({
        text: config.fullTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Calculate column widths based on number of columns
    const numColumns = config.headers.length;
    const totalWidth = 14400; // Total width in DXA units (for landscape)
    const columnWidth = Math.floor(totalWidth / numColumns);

    // Build table with headers and data
    const tableRows: TableRow[] = [];

    // Add multi-tier headers if provided
    if (config.multiTierHeaders) {
      // Add Tier 1 headers
      if (config.multiTierHeaders.tier1 && config.multiTierHeaders.tier1.length > 0) {
        const tier1Cells: TableCell[] = [];
        config.multiTierHeaders.tier1.forEach((group) => {
          tier1Cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: group.label,
                  alignment: AlignmentType.CENTER,
                  bold: true
                })
              ],
              columnSpan: group.colspan,
              width: { size: columnWidth * group.colspan, type: WidthType.DXA },
              shading: { fill: 'D9E1F2' },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 50, right: 50 }
            })
          );
        });
        tableRows.push(new TableRow({ children: tier1Cells, height: { value: 400, rule: 0 } }));
      }

      // Add Tier 2 headers
      if (config.multiTierHeaders.tier2 && config.multiTierHeaders.tier2.length > 0) {
        const tier2Cells: TableCell[] = [];
        config.multiTierHeaders.tier2.forEach((group) => {
          tier2Cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  text: group.label,
                  alignment: AlignmentType.CENTER,
                  bold: true
                })
              ],
              columnSpan: group.colspan,
              width: { size: columnWidth * group.colspan, type: WidthType.DXA },
              shading: { fill: 'FCE4D6' },
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 50, right: 50 }
            })
          );
        });
        tableRows.push(new TableRow({ children: tier2Cells, height: { value: 350, rule: 0 } }));
      }
    } else if (config.groupedHeaders && config.groupedHeaders.length > 0) {
      // Add single-tier grouped headers
      const groupCells: TableCell[] = [];
      config.groupedHeaders.forEach((group) => {
        groupCells.push(
          new TableCell({
            children: [
              new Paragraph({
                text: group.label,
                alignment: AlignmentType.CENTER,
                bold: true
              })
            ],
            columnSpan: group.colspan,
            width: { size: columnWidth * group.colspan, type: WidthType.DXA },
            shading: { fill: 'E7E6E6' },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 100, bottom: 100, left: 50, right: 50 }
          })
        );
      });
      tableRows.push(new TableRow({ children: groupCells, height: { value: 350, rule: 0 } }));
    }

    // Add column headers
    const headerCells: TableCell[] = config.headers.map(header => 
      new TableCell({
        children: [
          new Paragraph({
            text: header,
            alignment: AlignmentType.CENTER,
            bold: true
          })
        ],
        width: { size: columnWidth, type: WidthType.DXA },
        shading: { fill: 'D9E1F2' },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 50, right: 50 }
      })
    );
    tableRows.push(new TableRow({ children: headerCells, height: { value: 500, rule: 0 } }));

    // Determine if this form needs decimal formatting
    const needsDecimals = config.title.includes('Fiscal') || config.title.includes('Personnel');
    const round2 = (num: number): number => Math.round(num * 100) / 100;

    // Add data rows
    config.data.forEach((record) => {
      const dataCells: TableCell[] = [];
      
      Object.keys(config.fieldMapping).forEach((field) => {
        // Skip notes field - it will be added at the bottom
        if (config.notesField && field === config.notesField) {
          return;
        }

        const value = record[field];
        let displayValue = '';

        if (value === null || value === undefined) {
          displayValue = '';
        } else if (typeof value === 'boolean') {
          displayValue = value ? 'yes' : 'no';
        } else if (typeof value === 'number') {
          const formattedValue = needsDecimals ? round2(value) : value;
          displayValue = needsDecimals ? formattedValue.toFixed(2) : formattedValue.toString();
        } else {
          displayValue = String(value);
        }

        dataCells.push(
          new TableCell({
            children: [
              new Paragraph({
                text: displayValue,
                alignment: AlignmentType.CENTER
              })
            ],
            width: { size: columnWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
          })
        );
      });

      tableRows.push(new TableRow({ children: dataCells }));
    });

    // Create the main data table
    const mainTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    });

    children.push(mainTable);

    // Add notes section if specified
    if (config.notesField) {
      children.push(
        new Paragraph({
          text: '',
          spacing: { before: 400 }
        })
      );

      children.push(
        new Paragraph({
          text: 'Notes',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        })
      );

      const notesRows: TableRow[] = [];
      
      // Add notes header
      notesRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Year', bold: true, alignment: AlignmentType.CENTER })],
              width: { size: 1000, type: WidthType.DXA },
              shading: { fill: 'FFD966' },
              verticalAlign: VerticalAlign.CENTER
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Institution', bold: true, alignment: AlignmentType.CENTER })],
              width: { size: 4000, type: WidthType.DXA },
              shading: { fill: 'FFD966' },
              verticalAlign: VerticalAlign.CENTER
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Notes', bold: true, alignment: AlignmentType.CENTER })],
              width: { size: 9400, type: WidthType.DXA },
              shading: { fill: 'FFD966' },
              verticalAlign: VerticalAlign.CENTER
            })
          ]
        })
      );

      // Add notes data
      config.data.forEach((record) => {
        const year = record['year'] || '';
        const institutionName = record['Library_Year.Library.library_name'] || '';
        const notes = config.notesField ? (record[config.notesField] || '') : '';

        if (notes && notes.trim() !== '') {
          notesRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: String(year), alignment: AlignmentType.CENTER })],
                  width: { size: 1000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP
                }),
                new TableCell({
                  children: [new Paragraph({ text: String(institutionName) })],
                  width: { size: 4000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP
                }),
                new TableCell({
                  children: [new Paragraph({ text: String(notes) })],
                  width: { size: 9400, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP
                })
              ]
            })
          );
        }
      });

      if (notesRows.length > 1) {
        const notesTable = new Table({
          rows: notesRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
          }
        });

        children.push(notesTable);
      }
    }

    // Add section with landscape orientation
    this.sections.push({
      properties: {
        page: {
          orientation: PageOrientation.LANDSCAPE,
          margin: {
            top: 720,
            bottom: 720,
            left: 720,
            right: 720
          }
        }
      },
      children: children
    });

    // Update the document with sections
    this.document = new Document({
      creator: 'CEAL Statistics System',
      title: config.fullTitle,
      sections: this.sections
    });
  }

  async generateBuffer(): Promise<Buffer> {
    const buffer = await Packer.toBuffer(this.document);
    return Buffer.from(buffer);
  }

  getDocument(): Document {
    return this.document;
  }
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
