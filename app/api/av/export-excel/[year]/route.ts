import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import ExcelJS from 'exceljs';
import { Buffer } from 'node:buffer';

const prisma = db;

interface UserContext {
  libraryId: number | null;
  libraryName: string;
}

async function getUserContext(): Promise<UserContext> {
  const cookieStore = await cookies();
  const rawEmail = cookieStore.get('uinf')?.value;
  const userEmail = rawEmail ? decodeURIComponent(rawEmail).toLowerCase() : undefined;

  let libraryId: number | null = null;
  let libraryName = '';

  if (userEmail) {
    const user = await prisma.user.findFirst({
      where: { username: { equals: userEmail, mode: 'insensitive' } },
      include: { User_Library: { include: { Library: true } } }
    });
    if (user?.User_Library && user.User_Library.length > 0) {
      libraryId = user.User_Library[0].library_id;
      libraryName = user.User_Library[0].Library?.library_name || '';
    }
  }

  return { libraryId, libraryName };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { year: yearParam } = await params;
    const year = parseInt(yearParam);

    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    const userCtx = await getUserContext();

    // Get all AV data with counts for the year
    const listAVCountsByYear = await prisma.list_AV_Counts.findMany({
      where: { year },
      select: {
        listav: true,
        titles: true,
      },
    });

    const countsMap = new Map<number, number>();
    const listavIds = listAVCountsByYear
      .filter((c: any) => c.listav !== null)
      .map((c: any) => {
        countsMap.set(c.listav, c.titles ?? 0);
        return c.listav;
      });

    if (listavIds.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified year' },
        { status: 404 }
      );
    }

    // Get AV details
    const avs = await prisma.list_AV.findMany({
      where: { id: { in: listavIds } },
      include: {
        List_AV_Language: {
          include: { Language: true }
        },
      },
    });

    // Get user selections if library exists
    let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
    if (userCtx.libraryId) {
      const libraryYearRecords = await prisma.library_Year.findMany({
        where: { library: userCtx.libraryId, year },
        select: { id: true },
      });
      
      if (libraryYearRecords.length > 0) {
        const libraryYearId = libraryYearRecords[0].id;
        const selections = await prisma.libraryYear_ListAV.findMany({
          where: { libraryyear_id: libraryYearId },
          select: {
            listav_id: true,
            is_selected: true,
            custom_count: true,
          },
        });
        
        selections.forEach((sel) => {
          userSelections.set(sel.listav_id, {
            is_selected: sel.is_selected ?? false,
            custom_count: sel.custom_count,
          });
        });
      }
    }

    // Build data array
    const data = avs.map((av) => {
      const counts = countsMap.get(av.id);
      const selection = userSelections.get(av.id);
      const languages = (av as any).List_AV_Language
        ?.map((rel: any) => rel.Language?.short)
        ?.filter(Boolean) || [];

      return {
        id: av.id,
        type: av.type || '',
        counts: counts ?? 0,
        cjk_title: av.cjk_title || '',
        title: av.title || '',
        romanized_title: av.romanized_title || '',
        subtitle: av.subtitle || '',
        language: languages.join(', '),
        publisher: av.publisher || '',
        description: av.description || '',
        data_source: av.data_source || '',
        notes: av.notes || '',
        is_selected: selection?.is_selected ?? false,
        custom_count: selection?.custom_count ?? null,
      };
    });

    // Sort by id
    data.sort((a, b) => a.id - b.id);

    // Generate Excel file
    const buffer = await generateExcel(data, year, userCtx.libraryName);

    // Return Excel file
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="AV_Database_${year}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateExcel(
  data: any[],
  year: number,
  libraryName: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('AV Database');

  // Set metadata
  workbook.title = `AV Database - ${year}`;
  workbook.subject = 'CEAL AV Database';
  workbook.created = new Date();

  // Define columns (excluding subscribers)
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'My Selection', key: 'is_selected', width: 15 },
    { header: 'My Custom Count', key: 'custom_count', width: 18 },
    { header: 'Counts', key: 'counts', width: 12 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'CJK Title', key: 'cjk_title', width: 40 },
    { header: 'English Title', key: 'title', width: 40 },
    { header: 'Romanized', key: 'romanized_title', width: 35 },
    { header: 'Subtitle', key: 'subtitle', width: 30 },
    { header: 'Language', key: 'language', width: 15 },
    { header: 'Publisher', key: 'publisher', width: 25 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Data Source', key: 'data_source', width: 40 },
    { header: 'Notes', key: 'notes', width: 40 },
  ];

  worksheet.columns = columns;

  // Add header row styling
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow({
      id: item.id,
      is_selected: item.is_selected ? 'Yes' : 'No',
      custom_count: item.custom_count ?? '',
      counts: item.counts,
      type: item.type,
      cjk_title: item.cjk_title,
      title: item.title,
      romanized_title: item.romanized_title,
      subtitle: item.subtitle,
      language: item.language,
      publisher: item.publisher,
      description: item.description,
      data_source: item.data_source,
      notes: item.notes,
    });
  });

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'top', wrapText: true };
      
      // Highlight selected rows
      const isSelected = row.getCell('is_selected').value === 'Yes';
      if (isSelected) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2EFDA' }, // Light green
        };
      }
    }
  });

  // Add title row above headers
  worksheet.insertRow(1, [`AV Database - ${year}${libraryName ? ` - ${libraryName}` : ''}`]);
  worksheet.mergeCells('A1:N1');
  const titleRow = worksheet.getRow(1);
  titleRow.font = { bold: true, size: 14 };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 30;

  // Freeze panes
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 2, topLeftCell: 'A3', activeCell: 'A3' },
  ];

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
