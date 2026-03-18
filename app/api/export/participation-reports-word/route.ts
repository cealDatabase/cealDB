import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
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
  HeadingLevel,
  PageOrientation,
  TextRun
} from 'docx';
import { Buffer } from 'node:buffer';
import archiver from 'archiver';
import {
  hasValidFiscalData,
  hasValidMonographicData,
  hasValidOtherHoldingsData,
  hasValidPersonnelData,
  hasValidPublicServicesData,
  hasValidSerialsData,
  hasValidUnprocessedData,
  hasValidVolumeHoldingsData,
  hasValidElectronicData,
  hasValidElectronicBooksData
} from '@/lib/formValidation';

const prisma = db;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;
    const roleData = cookieStore.get('role')?.value;

    if (!userEmail || !roleData) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    let userRoles: string[] = [];
    try {
      userRoles = JSON.parse(roleData);
    } catch {
      userRoles = [roleData];
    }

    const hasAccess = userRoles.includes('1') || userRoles.includes('3');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin or E-Resource Editor role required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const reportType = searchParams.get('reportType');

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);

    if (reportType === 'batch') {
      return await exportBatchReportsWord(yearNum);
    }

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type parameter is required' },
        { status: 400 }
      );
    }

    return await exportSingleReportWord(reportType, yearNum);
  } catch (error) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { error: 'Failed to export Word report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportSingleReportWord(reportType: string, year: number) {
  let buffer: Buffer;
  let filename: string;

  switch (reportType) {
    case 'characteristics':
      buffer = await generateLibraryCharacteristicsReportWord(year);
      filename = `Library_Characteristics-${year}.docx`;
      break;
    case 'completion':
      buffer = await generateStatisticsCompletionReportWord(year);
      filename = `Statistics_Completion-${year}.docx`;
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
  }

  const uint8Array = new Uint8Array(buffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

async function exportBatchReportsWord(year: number) {
  const characteristics = await generateLibraryCharacteristicsReportWord(year);
  const completion = await generateStatisticsCompletionReportWord(year);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  archive.append(characteristics, { name: `Library_Characteristics-${year}.docx` });
  archive.append(completion, { name: `Statistics_Completion-${year}.docx` });
  archive.finalize();

  const zipBuffer = await archivePromise;
  const uint8Array = new Uint8Array(zipBuffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Participation_Reports_Word_${year}.zip"`
    }
  });
}

async function generateLibraryCharacteristicsReportWord(year: number): Promise<Buffer> {
  const libraries = await prisma.library.findMany({
    where: {
      hideinlibrarylist: false,
      Library_Year: {
        some: {
          year: year
        }
      }
    },
    include: {
      libraryType: true,
      libraryRegion: true
    },
    orderBy: {
      library_number: 'asc'
    }
  });

  const children: any[] = [];

  children.push(
    new Paragraph({
      text: `Participating Library Characteristics and Contact Information, ${year}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  const headers = ['Lib. Num.', 'Library Name', 'Type', 'Region', 'Law', 'Med', 'Submitted by (First Name)', 'Submitted by (Last Name)', 'Position Title', 'Phone', 'E-mail', 'Fax', 'Sys. Vendor'];
  const columnWidth = Math.floor(14400 / headers.length);

  const tableRows: TableRow[] = [];

  // Add header row
  const headerCells: TableCell[] = headers.map(header =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })], alignment: AlignmentType.CENTER })],
      width: { size: columnWidth, type: WidthType.DXA },
      shading: { fill: 'D9E1F2' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 50, right: 50 }
    })
  );
  tableRows.push(new TableRow({ children: headerCells }));

  // Add data rows
  libraries.forEach((library) => {
    const rowData = [
      library.library_number || '',
      library.library_name || '',
      library.libraryType?.librarytype || '',
      library.libraryRegion?.libraryregion || '',
      library.plilaw ? 'Yes' : 'No',
      library.plimed ? 'Yes' : 'No',
      library.plisubmitter_first_name || '',
      library.plisubmitter_last_name || '',
      library.pliposition_title || '',
      library.pliwork_phone || '',
      library.plie_mail || '',
      library.plifax_number || '',
      library.plisystem_vendor || ''
    ];

    const dataCells: TableCell[] = rowData.map(value =>
      new TableCell({
        children: [new Paragraph({ text: String(value), alignment: AlignmentType.CENTER })],
        width: { size: columnWidth, type: WidthType.DXA },
        verticalAlign: VerticalAlign.TOP,
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })
    );
    tableRows.push(new TableRow({ children: dataCells }));
  });

  // Add total row
  const totalCells: TableCell[] = headers.map((_, idx) => {
    const content = idx === 0 ? `${libraries.length} Total` : '';
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: content, bold: true })], alignment: AlignmentType.LEFT })],
      width: { size: columnWidth, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
  });
  tableRows.push(new TableRow({ children: totalCells }));

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

  const document = new Document({
    creator: 'CEAL Statistics System',
    title: `Library Characteristics ${year}`,
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE
          },
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      },
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}

async function generateStatisticsCompletionReportWord(year: number): Promise<Buffer> {
  const libraryYears = await prisma.library_Year.findMany({
    where: {
      year: year
    },
    include: {
      Library: true,
      Fiscal_Support: true,
      Monographic_Acquisitions: true,
      Other_Holdings: true,
      Personnel_Support: true,
      Public_Services: true,
      Serials: true,
      Unprocessed_Backlog_Materials: true,
      Volume_Holdings: true,
      Electronic: true,
      Electronic_Books: true
    },
    orderBy: {
      Library: {
        library_name: 'asc'
      }
    }
  });

  const children: any[] = [];

  children.push(
    new Paragraph({
      text: `CEAL Statistics Table Completion, ${year}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  const headers = [
    'Library Name',
    '1. Monographs',
    '2. Volume Holdings',
    '3. Serials',
    '4. Other Holdings',
    '5. Unprocessed',
    '6. Fiscal',
    '7. Personnel',
    '8. Public Services',
    '9. Electronic',
    '10. Electronic Books'
  ];
  const columnWidth = Math.floor(14400 / headers.length);

  const tableRows: TableRow[] = [];

  // Add header row
  const headerCells: TableCell[] = headers.map(header =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })], alignment: AlignmentType.CENTER })],
      width: { size: columnWidth, type: WidthType.DXA },
      shading: { fill: 'D9E1F2' },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 50, right: 50 }
    })
  );
  tableRows.push(new TableRow({ children: headerCells }));

  // Add data rows
  libraryYears.forEach((ly) => {
    const rowData = [
      ly.Library?.library_name || '',
      hasValidMonographicData(ly.Monographic_Acquisitions) ? 'Yes' : 'No',
      hasValidVolumeHoldingsData(ly.Volume_Holdings) ? 'Yes' : 'No',
      hasValidSerialsData(ly.Serials) ? 'Yes' : 'No',
      hasValidOtherHoldingsData(ly.Other_Holdings) ? 'Yes' : 'No',
      hasValidUnprocessedData(ly.Unprocessed_Backlog_Materials) ? 'Yes' : 'No',
      hasValidFiscalData(ly.Fiscal_Support) ? 'Yes' : 'No',
      hasValidPersonnelData(ly.Personnel_Support) ? 'Yes' : 'No',
      hasValidPublicServicesData(ly.Public_Services) ? 'Yes' : 'No',
      hasValidElectronicData(ly.Electronic) ? 'Yes' : 'No',
      hasValidElectronicBooksData(ly.Electronic_Books) ? 'Yes' : 'No'
    ];

    const dataCells: TableCell[] = rowData.map((value, idx) => {
      const isYes = value === 'Yes';
      return new TableCell({
        children: [new Paragraph({ text: String(value), alignment: AlignmentType.CENTER })],
        width: { size: columnWidth, type: WidthType.DXA },
        shading: idx > 0 && isYes ? { fill: 'C6E0B4' } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
    });
    tableRows.push(new TableRow({ children: dataCells }));
  });

  // Add total row
  const totalCells: TableCell[] = headers.map((_, idx) => {
    const content = idx === 0 ? `${libraryYears.length} Total Libraries` : '';
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: content, bold: true })], alignment: AlignmentType.LEFT })],
      width: { size: columnWidth, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
  });
  tableRows.push(new TableRow({ children: totalCells }));

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

  const document = new Document({
    creator: 'CEAL Statistics System',
    title: `Statistics Completion ${year}`,
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE
          },
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      },
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}
