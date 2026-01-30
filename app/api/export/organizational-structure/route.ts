import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import ExcelJS from 'exceljs';
import { Buffer } from 'node:buffer';

const prisma = db;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    
    if (isNaN(yearNum)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    const buffer = await generateOrganizationalStructureReport(yearNum);
    const uint8Array = new Uint8Array(buffer);
    const filename = `Organizational_Structure-${year}.xlsx`;

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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
