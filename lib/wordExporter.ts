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
        children: [
          new TextRun({
            text: config.fullTitle,
            size: 8,
            bold: true
          })
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Calculate column widths based on number of columns
    const numColumns = config.headers.length;
    const MAX_COLUMNS = 63;
    
    // Word has a hard limit of 63 columns per table - split into multiple tables if needed
    if (numColumns > MAX_COLUMNS) {
      this.createSplitTables(config, children);
      
      // Add section with landscape orientation and legal page size
      this.sections.push({
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 20160,  // Legal: 14" * 1440 twips/inch
              height: 12240  // Legal: 8.5" * 1440 twips/inch
            },
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
      return;
    }
    
    const isWideTable = numColumns > 40;
    const totalWidth = 19000; // Legal landscape width
    const columnWidth = Math.floor(totalWidth / numColumns);

    // Build table with headers and data
    const tableRows: TableRow[] = [];

    // Skip multi-tier headers for very wide tables
    const useSimplifiedHeaders = isWideTable;
    
    // Add multi-tier headers if provided
    if (config.multiTierHeaders && !useSimplifiedHeaders) {
      // Add Tier 1 headers
      if (config.multiTierHeaders.tier1 && config.multiTierHeaders.tier1.length > 0) {
        const tier1Cells: TableCell[] = [];
        config.multiTierHeaders.tier1.forEach((group) => {
          tier1Cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: group.label,
                      size: 8,
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
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
        tableRows.push(new TableRow({ children: tier1Cells }));
      }

      // Add Tier 2 headers
      if (config.multiTierHeaders.tier2 && config.multiTierHeaders.tier2.length > 0) {
        const tier2Cells: TableCell[] = [];
        config.multiTierHeaders.tier2.forEach((group) => {
          tier2Cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: group.label,
                      size: 8,
                      bold: true
                    })
                  ],
                  alignment: AlignmentType.CENTER
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
        tableRows.push(new TableRow({ children: tier2Cells }));
      }
    } else if (config.groupedHeaders && config.groupedHeaders.length > 0) {
      // Add single-tier grouped headers
      const groupCells: TableCell[] = [];
      config.groupedHeaders.forEach((group) => {
        groupCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: group.label,
                    size: 8,
                    bold: true
                  })
                ],
                alignment: AlignmentType.CENTER
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
      tableRows.push(new TableRow({ children: groupCells }));
    }

    // Add column headers
    const headerCells: TableCell[] = config.headers.map(header => 
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: header,
                size: 8,
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER
          })
        ],
        width: { size: columnWidth, type: WidthType.DXA },
        shading: { fill: 'D9E1F2' },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 50, right: 50 }
      })
    );
    tableRows.push(new TableRow({ children: headerCells }));

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
                children: [
                  new TextRun({
                    text: displayValue,
                    size: 8
                  })
                ],
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
          children: [
            new TextRun({
              text: 'Notes',
              size: 8,
              bold: true
            })
          ],
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
              children: [new Paragraph({ children: [new TextRun({ text: 'Year', size: 8, bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 1000, type: WidthType.DXA },
              shading: { fill: 'FFD966' },
              verticalAlign: VerticalAlign.CENTER
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Institution', size: 8, bold: true })], alignment: AlignmentType.CENTER })],
              width: { size: 4000, type: WidthType.DXA },
              shading: { fill: 'FFD966' },
              verticalAlign: VerticalAlign.CENTER
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Notes', size: 8, bold: true })], alignment: AlignmentType.CENTER })],
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
                  children: [new Paragraph({ children: [new TextRun({ text: String(year), size: 8 })], alignment: AlignmentType.CENTER })],
                  width: { size: 1000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: String(institutionName), size: 8 })] })],
                  width: { size: 4000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.TOP
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: String(notes), size: 8 })] })],
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
          size: {
            orientation: PageOrientation.LANDSCAPE,
            width: 20160,  // Legal: 14" * 1440 twips/inch
            height: 12240  // Legal: 8.5" * 1440 twips/inch
          },
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

  }

  private createSplitTables(config: WordExportConfig, children: any[]): void {
    const MAX_COLUMNS = 63;
    const fieldKeys = Object.keys(config.fieldMapping);
    const institutionKey = fieldKeys[0]; // First field is always institution
    const dataKeys = fieldKeys.slice(1); // All other fields
    
    // Split into 2 tables: each with institution column + half the data columns
    const columnsPerTable = Math.ceil(dataKeys.length / 2);
    
    for (let tableIndex = 0; tableIndex < 2; tableIndex++) {
      const startIdx = tableIndex * columnsPerTable;
      const endIdx = Math.min(startIdx + columnsPerTable, dataKeys.length);
      const keysForThisTable = [institutionKey, ...dataKeys.slice(startIdx, endIdx)];
      const headersForThisTable = keysForThisTable.map(key => config.fieldMapping[key]);
      
      // Add subtitle for part 2
      if (tableIndex === 1) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${config.fullTitle} (Part 2)`,
                size: 8,
                bold: true
              })
            ],
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 }
          })
        );
      }
      
      // Create table for this subset
      const numCols = headersForThisTable.length;
      const totalWidth = 19000;
      const columnWidth = Math.floor(totalWidth / numCols);
      const tableRows: TableRow[] = [];
      
      // Add column headers
      const headerCells: TableCell[] = headersForThisTable.map(header => 
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  size: 8,
                  bold: true
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ],
          width: { size: columnWidth, type: WidthType.DXA },
          shading: { fill: 'D9E1F2' },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100, left: 50, right: 50 }
        })
      );
      tableRows.push(new TableRow({ children: headerCells }));
      
      // Determine if this form needs decimal formatting
      const needsDecimals = config.title.includes('Fiscal') || config.title.includes('Personnel');
      const round2 = (num: number): number => Math.round(num * 100) / 100;
      
      // Add data rows
      config.data.forEach((record) => {
        const dataCells: TableCell[] = [];
        
        keysForThisTable.forEach((field) => {
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
                  children: [
                    new TextRun({
                      text: displayValue,
                      size: 8
                    })
                  ],
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
      
      // Create the table
      const table = new Table({
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
      
      children.push(table);
    }
  }

  finalize(): void {
    // Create the final document with all accumulated sections
    this.document = new Document({
      creator: 'CEAL Statistics System',
      title: 'CEAL Statistics Report',
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
