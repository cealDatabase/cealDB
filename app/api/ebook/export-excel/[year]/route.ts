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
  const observeLibrary = cookieStore.get('observe_library')?.value;
  const userEmail = rawEmail ? decodeURIComponent(rawEmail).toLowerCase() : undefined;

  let viewingLibraryId: number | null = null;
  let libraryName = '';

  if (observeLibrary) {
    const observed = parseInt(observeLibrary);
    if (!isNaN(observed)) viewingLibraryId = observed;
  }

  if (!viewingLibraryId && userEmail) {
    const user = await prisma.user.findFirst({
      where: { username: { equals: userEmail, mode: 'insensitive' } },
      include: { User_Library: true }
    });
    if (user?.User_Library && user.User_Library.length > 0) {
      viewingLibraryId = user.User_Library[0].library_id;
    }
  }

  if (viewingLibraryId) {
    const library = await prisma.library.findUnique({ where: { id: viewingLibraryId } });
    libraryName = library?.library_name || '';
  }

  return { libraryId: viewingLibraryId, libraryName };
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

    // Get all E-Book data with counts for the year
    const listEBookCountsByYear = await prisma.list_EBook_Counts.findMany({
      where: { year },
      select: {
        listebook: true,
        titles: true,
        volumes: true,
        chapters: true,
      },
    });

    const countsMap = new Map<number, { titles: number; volumes: number | null; chapters: number | null }>();
    const listebookIds = listEBookCountsByYear
      .filter((c: any) => c.listebook !== null)
      .map((c: any) => {
        countsMap.set(c.listebook, {
          titles: c.titles ?? 0,
          volumes: c.volumes ?? null,
          chapters: c.chapters ?? null,
        });
        return c.listebook;
      });

    if (listebookIds.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the specified year' },
        { status: 404 }
      );
    }

    // Get E-Book details (include is_global / libraryyear for filtering)
    const ebooks = await prisma.list_EBook.findMany({
      where: { id: { in: listebookIds } },
      include: {
        List_EBook_Language: {
          include: { Language: true }
        },
      },
    });

    // Look up the viewing library's Library_Year id
    let viewingLibraryYearId: number | null = null;
    let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
    if (userCtx.libraryId) {
      const libraryYearRecords = await prisma.library_Year.findMany({
        where: { library: userCtx.libraryId, year },
        select: { id: true },
      });

      if (libraryYearRecords.length > 0) {
        viewingLibraryYearId = libraryYearRecords[0].id;
        const selections = await prisma.libraryYear_ListEBook.findMany({
          where: { libraryyear_id: viewingLibraryYearId },
          select: {
            listebook_id: true,
            is_selected: true,
            custom_count: true,
          },
        });

        selections.forEach((sel) => {
          userSelections.set(sel.listebook_id, {
            is_selected: sel.is_selected ?? false,
            custom_count: sel.custom_count,
          });
        });
      }
    }

    // Drop other institutions' customized records
    const filteredEbooks = ebooks.filter((eb: any) => {
      if (eb.is_global !== false) return true;
      return viewingLibraryYearId !== null && eb.libraryyear === viewingLibraryYearId;
    });

    // Build data array
    const rawData = filteredEbooks.map((ebook: any) => {
      const counts = countsMap.get(ebook.id);
      const selection = userSelections.get(ebook.id);
      const languages = (ebook as any).List_EBook_Language
        ?.map((rel: any) => rel.Language?.short)
        ?.filter(Boolean) || [];

      return {
        id: ebook.id,
        counts: counts?.titles ?? 0,
        volumes: counts?.volumes ?? null,
        chapters: counts?.chapters ?? null,
        cjk_title: ebook.cjk_title || '',
        title: ebook.title || '',
        romanized_title: ebook.romanized_title || '',
        subtitle: ebook.subtitle || '',
        language: languages.join(', '),
        sub_series_number: ebook.sub_series_number || '',
        publisher: ebook.publisher || '',
        description: ebook.description || '',
        data_source: ebook.data_source || '',
        notes: ebook.notes || '',
        is_global: ebook.is_global,
        libraryyear: ebook.libraryyear,
        is_selected: selection?.is_selected ?? false,
        custom_count: selection?.custom_count ?? null,
      };
    });

    // Dedup global-vs-library-specific twins
    let data: any[] = rawData;
    if (viewingLibraryYearId !== null) {
      const groupKey = (it: any) =>
        `${(it.title ?? '').toLowerCase()}_${(it.subtitle ?? '').toLowerCase()}_${(it.publisher ?? '').toLowerCase()}`;
      const groups = new Map<string, any[]>();
      for (const item of rawData) {
        const k = groupKey(item);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(item);
      }
      const kept: any[] = [];
      for (const group of groups.values()) {
        if (group.length === 1) { kept.push(group[0]); continue; }
        const mine = group.filter(
          (g: any) => g.libraryyear === viewingLibraryYearId && g.is_global === false
        );
        if (mine.length > 0) {
          const twinWithState = group.find(
            (g: any) => !mine.includes(g) && (g.is_selected || g.custom_count != null)
          );
          if (twinWithState) {
            const target = mine.find((m: any) => m.is_selected) ?? mine[0];
            target.is_selected = target.is_selected || twinWithState.is_selected;
            if (target.custom_count == null) target.custom_count = twinWithState.custom_count;
          }
          kept.push(...mine);
        } else {
          kept.push(...group);
        }
      }
      data = kept;
    }

    // Sort by id
    data.sort((a, b) => a.id - b.id);

    // Generate Excel file
    const buffer = await generateExcel(data, year, userCtx.libraryName);

    // Return Excel file
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="EBook_Database_${year}.xlsx"`,
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
  const worksheet = workbook.addWorksheet('E-Book Database');

  // Set metadata
  workbook.title = `E-Book Database - ${year}`;
  workbook.subject = 'CEAL E-Book Database';
  workbook.created = new Date();

  // Define columns (excluding subscribers)
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'My Selection', key: 'is_selected', width: 15 },
    { header: 'My Custom Count', key: 'custom_count', width: 18 },
    { header: 'Counts (# titles)', key: 'counts', width: 15 },
    { header: 'Volumes', key: 'volumes', width: 12 },
    { header: 'Chapters', key: 'chapters', width: 12 },
    { header: 'CJK Title', key: 'cjk_title', width: 40 },
    { header: 'English Title', key: 'title', width: 40 },
    { header: 'Romanized', key: 'romanized_title', width: 35 },
    { header: 'Subtitle', key: 'subtitle', width: 30 },
    { header: 'Language', key: 'language', width: 15 },
    { header: 'Sub Series', key: 'sub_series_number', width: 15 },
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
      volumes: item.volumes ?? '',
      chapters: item.chapters ?? '',
      cjk_title: item.cjk_title,
      title: item.title,
      romanized_title: item.romanized_title,
      subtitle: item.subtitle,
      language: item.language,
      sub_series_number: item.sub_series_number,
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
  worksheet.insertRow(1, [`E-Book Database - ${year}${libraryName ? ` - ${libraryName}` : ''}`]);
  worksheet.mergeCells('A1:P1');
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
