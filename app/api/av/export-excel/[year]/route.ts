import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { getSessionRoleIds } from '@/lib/auth';
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

  // Super-admin impersonation: observe_library takes precedence
  if (observeLibrary) {
    const observed = parseInt(observeLibrary);
    if (!isNaN(observed)) viewingLibraryId = observed;
  }

  // Otherwise fall back to the user's home library
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
    const isSuperAdmin = (await getSessionRoleIds()).includes(1);

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

    // Get AV details (include is_global / libraryyear so we can filter
    // customized records to only the viewing library's own customs)
    const avs = await prisma.list_AV.findMany({
      where: { id: { in: listavIds } },
      include: {
        List_AV_Language: {
          include: { Language: true }
        },
        Library_Year: { select: { library: true } },
      },
    });

    const previousYear = year - 1;
    const previousEntries = await prisma.list_AV.findMany({
      where: { List_AV_Counts: { some: { year: previousYear } } },
      select: {
        id: true, is_global: true, type: true, title: true, cjk_title: true,
        romanized_title: true, subtitle: true, publisher: true, description: true,
        notes: true, data_source: true, Library_Year: { select: { library: true } },
      },
    });
    const copyAuditRows = await prisma.auditLog.findMany({
      where: { table_name: "List_AV", action: "CREATE" },
      select: { record_id: true, old_values: true },
    });
    const copiedFromGlobalIds = new Set(copyAuditRows
      .filter((row) => (row.old_values as { original_id?: unknown } | null)?.original_id != null)
      .map((row) => Number(row.record_id)));
    const localKey = (row: any, library: number | null | undefined) => JSON.stringify([
      library, row.type, row.title, row.cjk_title, row.romanized_title, row.subtitle,
      row.publisher, row.description, row.notes, row.data_source,
    ]);
    const previousGlobalIds = new Set(previousEntries.filter((row) => row.is_global).map((row) => row.id));
    const previousLocalOrigins = new Map(previousEntries
      .filter((row) => !row.is_global && row.Library_Year?.library)
      .map((row) => [
        localKey(row, row.Library_Year?.library),
        copiedFromGlobalIds.has(row.id) ? "customized" : "institution-created",
      ]));
    const originKinds = new Map(avs.map((av: any) => {
      const priorLocalOrigin = av.is_global === false
        ? previousLocalOrigins.get(localKey(av, av.Library_Year?.library))
        : undefined;
      const kind = av.is_global && previousGlobalIds.has(av.id)
        ? "global"
        : av.is_global === false && (copiedFromGlobalIds.has(av.id) || priorLocalOrigin === "customized")
          ? "customized"
          : av.is_global === false && priorLocalOrigin === "institution-created"
            ? "institution-created"
            : "legacy";
      return [av.id, kind];
    }));
    const originLabel = (id: number) => {
      switch (originKinds.get(id)) {
        case "global": return `${previousYear} Global (Admin)`;
        case "institution-created": return `${previousYear} Institution-created`;
        default: return "Legacy / source unverified";
      }
    };

    // Look up the viewing library's Library_Year id (used both for filtering
    // their own customized records and for fetching their selections).
    let viewingLibraryYearId: number | null = null;
    let userSelections: Map<number, { is_selected: boolean; custom_count: number | null }> = new Map();
    if (userCtx.libraryId) {
      const libraryYearRecords = await prisma.library_Year.findMany({
        where: { library: userCtx.libraryId, year },
        select: { id: true },
      });

      if (libraryYearRecords.length > 0) {
        viewingLibraryYearId = libraryYearRecords[0].id;
        const selections = await prisma.libraryYear_ListAV.findMany({
          where: { libraryyear_id: viewingLibraryYearId },
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

    // A Super Admin exports the complete annual catalogue, including every
    // institution-owned entry, whether or not it is selected by the library
    // currently being viewed. Other roles retain their scoped export.
    const scopedAvs = isSuperAdmin
      ? avs
      : avs.filter((av: any) => {
          if (av.is_global !== false) return true; // global or unknown
          return viewingLibraryYearId !== null && av.libraryyear === viewingLibraryYearId;
        });
    const filteredAvs = scopedAvs.filter((av: any) => {
      const origin = originKinds.get(av.id);
      return origin !== "customized" && (isSuperAdmin || origin !== "legacy");
    });

    // Build data array
    const rawData = filteredAvs.map((av: any) => {
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
        is_global: av.is_global,
        libraryyear: av.libraryyear,
        is_selected: selection?.is_selected ?? false,
        custom_count: selection?.custom_count ?? null,
        origin: originLabel(av.id),
      };
    });

    // Dedup global-vs-library-specific twins (mirrors GetAVListWithUserSelections):
    // when the viewing library has its own version of a resource, hide the
    // global twin and carry over any selection state from it.
    let data: any[] = rawData;
    if (!isSuperAdmin && viewingLibraryYearId !== null) {
      const groupKey = (it: any) =>
        `${(it.title ?? '').toLowerCase()}_${(it.type ?? '').toLowerCase()}_${(it.subtitle ?? '').toLowerCase()}`;
      const groups = new Map<string, any[]>();
      for (const item of rawData) {
        const k = groupKey(item);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(item);
      }
      const kept: any[] = [];
      for (const group of groups.values()) {
        if (group.length === 1) { kept.push(group[0]); continue; }
        // All customs owned by the viewing library in this group.
        const mine = group.filter(
          (g: any) => g.libraryyear === viewingLibraryYearId && g.is_global === false
        );
        if (mine.length > 0) {
          // Carry over any selection state from the global/other twins onto
          // a customized record so visual cues aren't lost. Prefer to apply
          // it to a custom that's already selected; otherwise the first one.
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
    { header: `${year - 1} Origin`, key: 'origin', width: 30 },
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
      origin: item.origin,
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
  worksheet.mergeCells('A1:O1');
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
