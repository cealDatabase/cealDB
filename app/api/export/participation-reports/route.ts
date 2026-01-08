import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import ExcelJS from 'exceljs';
import { Buffer } from 'node:buffer';
import archiver from 'archiver';
import { Readable } from 'stream';

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
    case 'characteristics':
      buffer = await generateLibraryCharacteristicsReport(year);
      filename = `Library_Characteristics-${year}.xlsx`;
      break;
    case 'completion':
      buffer = await generateStatisticsCompletionReport(year);
      filename = `Statistics_Completion-${year}.xlsx`;
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
  const characteristics = await generateLibraryCharacteristicsReport(year);
  const completion = await generateStatisticsCompletionReport(year);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));

  const archivePromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  archive.append(characteristics, { name: `Library_Characteristics-${year}.xlsx` });
  archive.append(completion, { name: `Statistics_Completion-${year}.xlsx` });
  archive.finalize();

  const zipBuffer = await archivePromise;
  const uint8Array = new Uint8Array(zipBuffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Participation_Reports_${year}.zip"`
    }
  });
}

async function generateLibraryCharacteristicsReport(year: number): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Library Characteristics');

  const titleRow = worksheet.addRow([`Participating Library Characteristics and Contact Information, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 12);
  titleRow.height = 25;

  const headers = [
    'Lib. Num.',
    'Library Name',
    'Type',
    'Region',
    'Law',
    'Med',
    'Submitted by (Name)',
    ',',
    'Position Title',
    'Phone',
    'E-mail',
    'Fax',
    'Sys. Vendor'
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

    const row = worksheet.addRow(rowData);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const totalRow = worksheet.addRow([`${libraries.length} Total`, '', '', '', '', '', '', '', '', '', '', '', '']);
  totalRow.font = { bold: true };
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  const recordsRow = worksheet.addRow(['Records']);
  recordsRow.font = { bold: true };

  worksheet.columns = [
    { width: 10 },
    { width: 35 },
    { width: 20 },
    { width: 15 },
    { width: 8 },
    { width: 8 },
    { width: 20 },
    { width: 20 },
    { width: 25 },
    { width: 15 },
    { width: 30 },
    { width: 15 },
    { width: 20 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}

async function generateStatisticsCompletionReport(year: number): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Statistics Completion');

  const titleRow = worksheet.addRow([`CEAL Statistics Table Completion, 2016, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 11);
  titleRow.height = 25;

  const headers = [
    'Library Name',
    'Fiscal Support',
    'Monographic',
    'Other Holdings',
    'Personnel Support',
    'Public Services',
    'Serials',
    'Backlog Materials',
    'Volume Holdings',
    'Electronic',
    'Electronic Books'
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

  libraryYears.forEach((ly) => {
    const rowData = [
      ly.Library?.library_name || '',
      ly.Fiscal_Support ? 'Yes' : '',
      ly.Monographic_Acquisitions ? 'Yes' : '',
      ly.Other_Holdings ? 'Yes' : '',
      ly.Personnel_Support ? 'Yes' : '',
      ly.Public_Services ? 'Yes' : '',
      ly.Serials ? 'Yes' : '',
      ly.Unprocessed_Backlog_Materials ? 'Yes' : '',
      ly.Volume_Holdings ? 'Yes' : '',
      ly.Electronic ? 'Yes' : '',
      ly.Electronic_Books ? 'Yes' : ''
    ];

    const row = worksheet.addRow(rowData);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  const totalRow = worksheet.addRow([`${libraryYears.length} Total Records`, '', '', '', '', '', '', '', '', '', '']);
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
    { width: 35 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 15 },
    { width: 12 },
    { width: 18 },
    { width: 18 },
    { width: 15 },
    { width: 18 }
  ];

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}
