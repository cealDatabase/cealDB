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
  // Get Library_Year records with is_active flag and Entry_Status to match participation status logic
  const libraryYearRecords = await prisma.library_Year.findMany({
    where: {
      year: year,
      is_active: true,
    },
    include: {
      Library: {
        include: {
          libraryType: true,
          libraryRegion: true
        }
      },
      Entry_Status: true
    },
    orderBy: {
      Library: {
        library_name: 'asc'
      }
    }
  });

  // Filter to only include libraries that have submitted at least one form
  const libraries = libraryYearRecords
    .filter(ly => {
      const status = ly.Entry_Status;
      // Include if any form was submitted
      return status && (
        status.fiscal_support ||
        status.monographic_acquisitions ||
        status.other_holdings ||
        status.personnel_support_fte ||
        status.public_services ||
        status.serials ||
        status.unprocessed_backlog_materials ||
        status.volume_holdings ||
        status.electronic ||
        status.electronic_books
      );
    })
    .map(ly => ly.Library)
    .filter((lib): lib is NonNullable<typeof lib> => lib !== null && !lib.hideinlibrarylist);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CEAL Statistics System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Organizational Structure');

  const titleRow = worksheet.addRow([`Participating Libraries Organizational Structure and Operation Status, ${year}`]);
  titleRow.font = { bold: true, size: 12 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, 22);
  titleRow.height = 25;

  const sectionLabelRow = worksheet.addRow([
    'Collection Administration', '', '', '', '', '', '', '', '',
    'Collection Building and Services', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  sectionLabelRow.font = { bold: true, size: 11 };
  sectionLabelRow.alignment = { horizontal: 'center', vertical: 'middle' };
  sectionLabelRow.height = 20;
  
  worksheet.mergeCells(2, 1, 2, 9);
  worksheet.mergeCells(2, 10, 2, 22);

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
    'Circulation Type'
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

  // Store library data for main table and notes separately
  const libraryDataWithNotes: Array<{ library: typeof libraries[0], hasNotes: boolean }> = [];

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
      library.circulation_type || ''
    ];

    // Track if library has notes
    libraryDataWithNotes.push({
      library,
      hasNotes: !!(library.notes && library.notes.trim())
    });

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
  worksheet.mergeCells(totalRow.number, 1, totalRow.number, 22);
  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add Notes section at bottom (only for libraries with notes)
  const librariesWithNotes = libraryDataWithNotes.filter(item => item.hasNotes);
  
  if (librariesWithNotes.length > 0) {
    // Add empty row for spacing
    worksheet.addRow([]);

    // Add Notes section header
    const notesHeaderRow = worksheet.addRow(['Library', 'Notes']);
    notesHeaderRow.font = { bold: true, size: 10 };
    notesHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD966' }
    };
    notesHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    notesHeaderRow.height = 25;
    notesHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add notes rows
    librariesWithNotes.forEach(({ library }) => {
      const notesRow = worksheet.addRow([
        library.library_name || '',
        library.notes || ''
      ]);
      notesRow.alignment = { vertical: 'top', wrapText: true };
      notesRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }

  worksheet.columns = [
    { width: 30 },  // Library
    { width: 20 },  // Institutional Affiliation
    { width: 25 },  // Collection Name
    { width: 25 },  // Collection Organized Under
    { width: 20 },  // Head Position Title
    { width: 20 },  // Collection Head Reports To
    { width: 25 },  // Top Department
    { width: 20 },  // Next Formal Position
    { width: 30 },  // Other Departments
    { width: 30 },  // Collection Librarians/Groups
    { width: 15 },  // Collection Type
    { width: 15 },  // Shelving Type
    { width: 15 },  // Consultation Type
    { width: 15 },  // Teaching Type
    { width: 30 },  // Online Catalog URL
    { width: 12 },  // Language Expertise Available
    { width: 20 },  // Language Expertise (If yes)
    { width: 25 },  // Bibliographic Utilities
    { width: 25 },  // Consortia Membership
    { width: 15 },  // Acquisition Type
    { width: 15 },  // Cataloging Type
    { width: 15 }   // Circulation Type
  ];
  
  // Set column widths for notes section (reusing column 1 and 2)
  // Column 1 (Library name) already set to 30
  // Column 2 will be used for notes and set to wider width dynamically if needed

  const data = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
}
