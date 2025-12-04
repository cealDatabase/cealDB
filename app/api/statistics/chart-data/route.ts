import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const prisma = db;

/**
 * GET /api/statistics/chart-data
 * Fetches chart data based on library IDs, years, and data table selection
 * Query params: libraryIds (comma-separated), years (comma-separated), dataTable (key)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const libraryIdsParam = searchParams.get('libraryIds');
    const yearsParam = searchParams.get('years');
    const dataTable = searchParams.get('dataTable');

    if (!libraryIdsParam || !yearsParam || !dataTable) {
      return NextResponse.json(
        { error: 'Missing required parameters: libraryIds, years, dataTable' },
        { status: 400 }
      );
    }

    const libraryIds = libraryIdsParam.split(',').map(id => parseInt(id));
    const years = yearsParam.split(',').map(y => parseInt(y));

    // Get table configuration
    const tableConfig = getTableConfig(dataTable);
    if (!tableConfig) {
      return NextResponse.json(
        { error: 'Invalid data table selected' },
        { status: 400 }
      );
    }

    // Fetch Library_Year records that match the criteria
    const libraryYears = await prisma.library_Year.findMany({
      where: {
        library: { in: libraryIds },
        year: { in: years },
      },
      include: {
        Library: {
          select: {
            id: true,
            library_name: true,
          },
        },
      },
    });

    // For each Library_Year, fetch the related data table record
    const chartData = await Promise.all(
      libraryYears.map(async (ly) => {
        const data = await fetchTableData(tableConfig.tableName, ly.id);
        return {
          libraryId: ly.library,
          libraryName: ly.Library?.library_name || 'Unknown',
          year: ly.year,
          value: data ? parseFloat(String(data[tableConfig.field] || 0)) : 0,
        };
      })
    );

    // Filter out entries with no data
    const filteredData = chartData.filter(d => d.value !== null && d.value !== 0);

    return NextResponse.json({
      data: filteredData,
      tableLabel: tableConfig.label,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
  // Don't disconnect - using singleton pattern
}

function getTableConfig(key: string) {
  const configs: Record<string, { tableName: string; field: string; label: string }> = {
    volume_holdings: {
      tableName: 'volume_Holdings',
      field: 'vhgrandtotal',
      label: 'Volume Holdings',
    },
    monographic: {
      tableName: 'monographic_Acquisitions',
      field: 'matotal_volumes',
      label: 'Monographic Acquisitions',
    },
    serials: {
      tableName: 'serials',
      field: 'sgrandtotal',
      label: 'Serials',
    },
    fiscal: {
      tableName: 'fiscal_Support',
      field: 'fstotal_acquisition_budget',
      label: 'Fiscal Support',
    },
    electronic: {
      tableName: 'electronic',
      field: 'etotal_expenditure_grandtotal',
      label: 'Electronic Resources',
    },
    electronic_books: {
      tableName: 'electronic_Books',
      field: 'ebooks_total_volumes',
      label: 'Electronic Books',
    },
    personnel: {
      tableName: 'personnel_Support',
      field: 'psftotal',
      label: 'Personnel Support',
    },
    public_services: {
      tableName: 'public_Services',
      field: 'pstotal_circulations_subtotal',
      label: 'Public Services',
    },
    other_holdings: {
      tableName: 'other_Holdings',
      field: 'ohgrandtotal',
      label: 'Other Holdings',
    },
    unprocessed: {
      tableName: 'unprocessed_Backlog_Materials',
      field: 'ubtotal',
      label: 'Unprocessed Backlog Materials',
    },
  };

  return configs[key] || null;
}

async function fetchTableData(tableName: string, libraryYearId: number) {
  try {
    // @ts-ignore - Dynamic table access
    const table = prisma[tableName];
    if (!table) return null;

    const data = await table.findUnique({
      where: { libraryyear: libraryYearId },
    });

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return null;
  }
}
