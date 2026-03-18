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

const prisma = db;

interface UserContext {
  isAdminOrEditor: boolean;
  libraryId: number | null;
}

async function getUserContext(): Promise<UserContext> {
  const cookieStore = await cookies();
  const rawEmail = cookieStore.get('uinf')?.value;
  const roleData = cookieStore.get('role')?.value;

  const userEmail = rawEmail ? decodeURIComponent(rawEmail).toLowerCase() : undefined;

  let roleIds: string[] = [];
  try {
    roleIds = roleData ? JSON.parse(roleData) : [];
  } catch {
    roleIds = [];
  }

  const isAdminOrEditor = roleIds.includes('1') || roleIds.includes('3');

  let libraryId: number | null = null;
  if (!isAdminOrEditor && userEmail) {
    const user = await prisma.user.findFirst({
      where: { username: { equals: userEmail, mode: 'insensitive' } },
      include: { User_Library: true }
    });
    if (user?.User_Library && user.User_Library.length > 0) {
      libraryId = user.User_Library[0].library_id;
    }
  }

  return { isAdminOrEditor, libraryId };
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
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
    const userCtx = await getUserContext();

    if (reportType === 'batch') {
      return await exportBatchReportsWord(yearNum, userCtx);
    }

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type parameter is required' },
        { status: 400 }
      );
    }

    return await exportSingleReportWord(reportType, yearNum, userCtx);
  } catch (error) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { error: 'Failed to export Word report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportSingleReportWord(reportType: string, year: number, userCtx: UserContext) {
  let buffer: Buffer;
  let filename: string;

  switch (reportType) {
    case 'av':
      buffer = await generateAVDatabaseReportWord(year, userCtx);
      filename = `AudioVisual_Database-${year}.docx`;
      break;
    case 'ebook':
      buffer = await generateEBookDatabaseReportWord(year, userCtx);
      filename = `EBook_Database-${year}.docx`;
      break;
    case 'ejournal':
      buffer = await generateEJournalDatabaseReportWord(year, userCtx);
      filename = `EJournal_Database-${year}.docx`;
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

async function exportBatchReportsWord(year: number, userCtx: UserContext) {
  const av = await generateAVDatabaseReportWord(year, userCtx);
  const ebook = await generateEBookDatabaseReportWord(year, userCtx);
  const ejournal = await generateEJournalDatabaseReportWord(year, userCtx);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  archive.append(av, { name: `AudioVisual_Database-${year}.docx` });
  archive.append(ebook, { name: `EBook_Database-${year}.docx` });
  archive.append(ejournal, { name: `EJournal_Database-${year}.docx` });
  archive.finalize();

  const zipBuffer = await archivePromise;
  const uint8Array = new Uint8Array(zipBuffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Database_Collection_Reports_Word_${year}.zip"`
    }
  });
}

async function generateAVDatabaseReportWord(year: number, userCtx: UserContext): Promise<Buffer> {
  const avRecords = await prisma.list_AV.findMany({
    where: {
      is_global: true,
      List_AV_Counts: {
        some: {
          year: year
        }
      }
    },
    include: {
      List_AV_Counts: {
        where: {
          year: year,
          ishidden: false
        }
      },
      List_AV_Language: {
        include: {
          Language: true
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  const sections: any[] = [];

  // Sheet 1: Global Databases
  const globalChildren: any[] = [];

  globalChildren.push(
    new Paragraph({
      text: `Audio-Visual Database, ${year}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  const headers = ['Title', 'CJK Title', 'Romanized Title', 'Subtitle', 'Type', 'Chinese', 'Japanese', 'Korean', 'Non-CJK', 'Publisher', 'Description', 'Notes', 'AV Titles', 'Data Source'];
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
  let totalAVTitles = 0;
  avRecords.forEach((av) => {
    const languages = av.List_AV_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : '';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : '';
    const hasKorean = languages.includes('Korean') ? 'Yes' : '';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : '';
    const titles = av.List_AV_Counts[0]?.titles || 0;
    totalAVTitles += titles;

    const rowData = [
      av.title || '',
      av.cjk_title || '',
      av.romanized_title || '',
      av.subtitle || '',
      av.type || '',
      hasChinese,
      hasJapanese,
      hasKorean,
      hasNonCJK,
      av.publisher || '',
      av.description || '',
      av.notes || '',
      titles.toString(),
      av.data_source || ''
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
    let content = '';
    if (idx === 0) content = 'Total:';
    if (idx === 12) content = totalAVTitles.toString();
    
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: content, bold: idx === 0 || idx === 12 })], alignment: AlignmentType.CENTER })],
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

  globalChildren.push(mainTable);

  sections.push({
    properties: {
      page: {
        size: {
          orientation: PageOrientation.LANDSCAPE
        },
        margin: { top: 720, bottom: 720, left: 720, right: 720 }
      }
    },
    children: globalChildren
  });

  const document = new Document({
    creator: 'CEAL Statistics System',
    title: `Audio-Visual Database ${year}`,
    sections: sections
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}

async function generateEBookDatabaseReportWord(year: number, userCtx: UserContext): Promise<Buffer> {
  const ebookRecords = await prisma.list_EBook.findMany({
    where: {
      is_global: true,
      List_EBook_Counts: {
        some: {
          year: year
        }
      }
    },
    include: {
      List_EBook_Counts: {
        where: {
          year: year,
          ishidden: false
        }
      },
      List_EBook_Language: {
        include: {
          Language: true
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  const sections: any[] = [];
  const globalChildren: any[] = [];

  globalChildren.push(
    new Paragraph({
      text: `E-Book Database, ${year}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  const headers = ['Title', 'CJK Title', 'Romanized Title', 'Subtitle', 'Chinese', 'Japanese', 'Korean', 'Non-CJK', 'Sub-series number', 'Publisher', 'Description', 'Notes', 'Ebook Titles', 'Ebook Volumes', 'Data Source'];
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
  let totalEbookTitles = 0;
  let totalEbookVolumes = 0;
  ebookRecords.forEach((ebook) => {
    const languages = ebook.List_EBook_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : '';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : '';
    const hasKorean = languages.includes('Korean') ? 'Yes' : '';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : '';
    const titles = ebook.List_EBook_Counts[0]?.titles || 0;
    const volumes = ebook.List_EBook_Counts[0]?.volumes || 0;
    totalEbookTitles += titles;
    totalEbookVolumes += volumes;

    const rowData = [
      ebook.title || '',
      ebook.cjk_title || '',
      ebook.romanized_title || '',
      ebook.subtitle || '',
      hasChinese,
      hasJapanese,
      hasKorean,
      hasNonCJK,
      ebook.sub_series_number || '',
      ebook.publisher || '',
      ebook.description || '',
      ebook.notes || '',
      titles.toString(),
      volumes.toString(),
      ebook.data_source || ''
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
    let content = '';
    if (idx === 0) content = 'Total:';
    if (idx === 12) content = totalEbookTitles.toString();
    if (idx === 13) content = totalEbookVolumes.toString();
    
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: content, bold: idx === 0 || idx === 12 || idx === 13 })], alignment: AlignmentType.CENTER })],
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

  globalChildren.push(mainTable);

  sections.push({
    properties: {
      page: {
        size: {
          orientation: PageOrientation.LANDSCAPE
        },
        margin: { top: 720, bottom: 720, left: 720, right: 720 }
      }
    },
    children: globalChildren
  });

  const document = new Document({
    creator: 'CEAL Statistics System',
    title: `E-Book Database ${year}`,
    sections: sections
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}

async function generateEJournalDatabaseReportWord(year: number, userCtx: UserContext): Promise<Buffer> {
  const ejournalRecords = await prisma.list_EJournal.findMany({
    where: {
      is_global: true,
      List_EJournal_Counts: {
        some: {
          year: year
        }
      }
    },
    include: {
      List_EJournal_Counts: {
        where: {
          year: year,
          ishidden: false
        }
      },
      List_EJournal_Language: {
        include: {
          Language: true
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  const sections: any[] = [];
  const globalChildren: any[] = [];

  globalChildren.push(
    new Paragraph({
      text: `E-Journal Database, ${year}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  const headers = ['Title', 'CJK Title', 'Romanized Title', 'Subtitle', 'Chinese', 'Japanese', 'Korean', 'Non-CJK', 'Publisher', 'Description', 'Notes', 'EJournal Titles', 'Data Source'];
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
  let totalEJournalTitles = 0;
  ejournalRecords.forEach((ejournal) => {
    const languages = ejournal.List_EJournal_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : '';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : '';
    const hasKorean = languages.includes('Korean') ? 'Yes' : '';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : '';
    const titles = ejournal.List_EJournal_Counts[0]?.journals || 0;
    totalEJournalTitles += titles;

    const rowData = [
      ejournal.title || '',
      ejournal.cjk_title || '',
      ejournal.romanized_title || '',
      ejournal.subtitle || '',
      hasChinese,
      hasJapanese,
      hasKorean,
      hasNonCJK,
      ejournal.publisher || '',
      ejournal.description || '',
      ejournal.notes || '',
      titles.toString(),
      ejournal.data_source || ''
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
    let content = '';
    if (idx === 0) content = 'Total:';
    if (idx === 11) content = totalEJournalTitles.toString();
    
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: content, bold: idx === 0 || idx === 11 })], alignment: AlignmentType.CENTER })],
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

  globalChildren.push(mainTable);

  sections.push({
    properties: {
      page: {
        size: {
          orientation: PageOrientation.LANDSCAPE
        },
        margin: { top: 720, bottom: 720, left: 720, right: 720 }
      }
    },
    children: globalChildren
  });

  const document = new Document({
    creator: 'CEAL Statistics System',
    title: `E-Journal Database ${year}`,
    sections: sections
  });

  const buffer = await Packer.toBuffer(document);
  return Buffer.from(buffer);
}
