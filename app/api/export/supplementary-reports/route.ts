import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import ExcelJS from 'exceljs';
import { Buffer } from 'node:buffer';
import archiver from 'archiver';

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
      return await exportBatchReports(yearNum);
    }

    if (!reportType) {
      return NextResponse.json(
        { error: 'Report type parameter is required' },
        { status: 400 }
      );
    }

    return await exportSingleReport(reportType, yearNum);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportSingleReport(reportType: string, year: number) {
  let buffer: Buffer;
  let filename: string;

  switch (reportType) {
    case 'organizational':
      buffer = await generateOrganizationalStructureReport(year);
      filename = `Organizational_Structure-${year}.xlsx`;
      break;
    case 'av':
      buffer = await generateAVDatabaseReport(year);
      filename = `AudioVisual_Database-${year}.xlsx`;
      break;
    case 'ebook':
      buffer = await generateEBookDatabaseReport(year);
      filename = `EBook_Database-${year}.xlsx`;
      break;
    case 'ejournal':
      buffer = await generateEJournalDatabaseReport(year);
      filename = `EJournal_Database-${year}.xlsx`;
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
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

async function exportBatchReports(year: number) {
  const organizational = await generateOrganizationalStructureReport(year);
  const av = await generateAVDatabaseReport(year);
  const ebook = await generateEBookDatabaseReport(year);
  const ejournal = await generateEJournalDatabaseReport(year);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  archive.append(organizational, { name: `Organizational_Structure-${year}.xlsx` });
  archive.append(av, { name: `AudioVisual_Database-${year}.xlsx` });
  archive.append(ebook, { name: `EBook_Database-${year}.xlsx` });
  archive.append(ejournal, { name: `EJournal_Database-${year}.xlsx` });
  archive.finalize();

  const zipBuffer = await archivePromise;
  const uint8Array = new Uint8Array(zipBuffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Supplementary_Reports_${year}.zip"`
    }
  });
}

async function generateOrganizationalStructureReport(year: number): Promise<Buffer> {
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
      library_name: 'asc'
    }
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Organizational Structure');

  const titleRow = worksheet.addRow([`Participating Libraries Organizational Structure and Operation Status, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 23);
  titleRow.height = 25;

  const sectionLabelRow = worksheet.addRow([
    'Collection Administration', '', '', '', '', '', '', '', '',
    'Collection Building and Services', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  sectionLabelRow.font = { bold: true, size: 11 };
  sectionLabelRow.alignment = { horizontal: 'center', vertical: 'middle' };
  sectionLabelRow.height = 20;
  
  worksheet.mergeCells(2, 1, 2, 9);
  worksheet.mergeCells(2, 10, 2, 23);

  const headers = [
    'Library',
    'Institutional Affiliation',
    'Collection Name',
    'Collection Organized Under',
    'Head Position Title',
    'Collection Head Reports To',
    'Top Department/Organizational Unit',
    'Next Formal Position (Title)',
    'Other Departments Directly Contributing',
    'Collection Librarians or Groups Reporting to Head',
    'Collection Type',
    'Shelving Type',
    'Consultation Type',
    'Teaching Type',
    'Online Catalog URL',
    'Language Expertise Available',
    'Language Expertise Available (If yes)',
    'Bibliographic Utilities Used',
    'Consortia Membership',
    'Acquisition Type',
    'Cataloging Type',
    'Circulation Type',
    'Notes'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 9 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 50;

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  libraries.forEach((library) => {
    const rowData = [
      library.library_name || '',
      library.libraryType?.librarytype || '',
      library.collection_title || '',
      library.collection_organized_under || '',
      library.collection_incharge_title || '',
      library.collection_head_reports_to || '',
      library.collection_top_department || '',
      library.collection_next_position_title || '',
      library.collection_other_departments || '',
      library.collection_librarians_groups || '',
      library.collection_type || '',
      library.shelving_type || '',
      library.consultation_type || '',
      library.teaching_type || '',
      library.plionline_catalog || '',
      library.plilaw || library.plimed ? 'Yes' : 'No',
      `${library.plilaw ? 'Law' : ''}${library.plilaw && library.plimed ? ', ' : ''}${library.plimed ? 'Medicine' : ''}`,
      library.plibibliographic || '',
      library.pliconsortia || '',
      library.acquisition_type || '',
      library.cataloging_type || '',
      library.circulation_type || '',
      library.notes || ''
    ];

    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const totalRow = worksheet.addRow([`${libraries.length} Total Libraries`]);
  totalRow.font = { bold: true };
  worksheet.mergeCells(totalRow.number, 1, totalRow.number, 23);
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 25 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 25 },
    { width: 20 },
    { width: 30 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 30 },
    { width: 12 },
    { width: 20 },
    { width: 25 },
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 30 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}

async function generateAVDatabaseReport(year: number): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Audio-Visual Database');

  const titleRow = worksheet.addRow([`Audio-Visual Database, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 11);
  titleRow.height = 25;

  const headers = [
    'Title',
    'CJK Title',
    'Romanized Title',
    'Subtitle',
    'Type',
    'Chinese',
    'Japanese',
    'Korean',
    'Non-CJK',
    'Publisher',
    'Description',
    'Notes',
    'AV Titles',
    'Data Source'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  const dataStartRow = 3;

  avRecords.forEach((av) => {
    const languages = av.List_AV_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : 'No';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : 'No';
    const hasKorean = languages.includes('Korean') ? 'Yes' : 'No';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : 'No';

    const titles = av.List_AV_Counts[0]?.titles || 0;

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
      titles,
      av.data_source || ''
    ];

    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const lastDataRow = dataStartRow + avRecords.length - 1;
  const totalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', { formula: `SUM(M${dataStartRow}:M${lastDataRow})` }, '']);
  totalRow.font = { bold: true };
  totalRow.getCell(1).value = 'Total:';
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns = [
    { width: 30 },
    { width: 30 },
    { width: 30 },
    { width: 25 },
    { width: 15 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 25 },
    { width: 40 },
    { width: 30 },
    { width: 12 },
    { width: 20 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}

async function generateEBookDatabaseReport(year: number): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('E-Book Database');

  const titleRow = worksheet.addRow([`E-Book Database, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 14);
  titleRow.height = 25;

  const headers = [
    'Title',
    'CJK Title',
    'Romanized Title',
    'Subtitle',
    'Chinese',
    'Japanese',
    'Korean',
    'Non-CJK',
    'Sub-series number',
    'Publisher',
    'Description',
    'Notes',
    'Ebook Titles',
    'Ebook Volumes',
    'Data Source'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  const dataStartRow = 3;

  ebookRecords.forEach((ebook) => {
    const languages = ebook.List_EBook_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : 'No';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : 'No';
    const hasKorean = languages.includes('Korean') ? 'Yes' : 'No';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : 'No';

    const titles = ebook.List_EBook_Counts[0]?.titles || 0;
    const volumes = ebook.List_EBook_Counts[0]?.volumes || 0;

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
      titles,
      volumes,
      ebook.data_source || ''
    ];

    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const lastDataRow = dataStartRow + ebookRecords.length - 1;
  const totalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', 'Total:', { formula: `SUM(M${dataStartRow}:M${lastDataRow})` }, { formula: `SUM(N${dataStartRow}:N${lastDataRow})` }, '']);
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns = [
    { width: 30 },
    { width: 30 },
    { width: 30 },
    { width: 25 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 20 },
    { width: 25 },
    { width: 40 },
    { width: 30 },
    { width: 12 },
    { width: 12 },
    { width: 20 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}

async function generateEJournalDatabaseReport(year: number): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('E-Journal Database');

  const titleRow = worksheet.addRow([`E-Journal Database, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 16);
  titleRow.height = 25;

  const headers = [
    'Title',
    'CJK Title',
    'Romanized Title',
    'Subtitle/Other Edition',
    'Series',
    'Vendor',
    'Chinese',
    'Japanese',
    'Korean',
    'Non-CJK',
    'Sub-series number',
    'Publisher',
    'Description',
    'Notes',
    'Current EJournal Titles',
    'EJournal Databases',
    'Data Source'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 10 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9E1F2' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  const dataStartRow = 3;

  ejournalRecords.forEach((ejournal) => {
    const languages = ejournal.List_EJournal_Language.map(l => l.Language.full);
    const hasChinese = languages.includes('Chinese') ? 'Yes' : 'No';
    const hasJapanese = languages.includes('Japanese') ? 'Yes' : 'No';
    const hasKorean = languages.includes('Korean') ? 'Yes' : 'No';
    const hasNonCJK = languages.some(l => !['Chinese', 'Japanese', 'Korean'].includes(l)) ? 'Yes' : 'No';

    const journals = ejournal.List_EJournal_Counts[0]?.journals || 0;
    const dbs = ejournal.List_EJournal_Counts[0]?.dbs || 0;

    const rowData = [
      ejournal.title || '',
      ejournal.cjk_title || '',
      ejournal.romanized_title || '',
      ejournal.subtitle || '',
      ejournal.series || '',
      ejournal.vendor || '',
      hasChinese,
      hasJapanese,
      hasKorean,
      hasNonCJK,
      ejournal.sub_series_number || '',
      ejournal.publisher || '',
      ejournal.description || '',
      ejournal.notes || '',
      journals,
      dbs,
      ejournal.data_source || ''
    ];

    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const lastDataRow = dataStartRow + ejournalRecords.length - 1;
  const totalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '', '', '', 'Total:', { formula: `SUM(O${dataStartRow}:O${lastDataRow})` }, { formula: `SUM(P${dataStartRow}:P${lastDataRow})` }, '']);
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns = [
    { width: 30 },
    { width: 30 },
    { width: 30 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 20 },
    { width: 25 },
    { width: 40 },
    { width: 30 },
    { width: 12 },
    { width: 12 },
    { width: 20 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}
