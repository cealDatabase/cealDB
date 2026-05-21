import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const prisma = db;

/**
 * GET /api/statistics/metadata
 * Fetches libraries, years, and available data tables for the statistics dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all libraries
    const libraries = await prisma.library.findMany({
      select: {
        id: true,
        library_name: true,
        library_number: true,
      },
      orderBy: {
        library_name: 'asc',
      },
    });

    // Fetch all years from Library_Year
    const years = await prisma.library_Year.findMany({
      select: {
        year: true,
      },
      distinct: ['year'],
      orderBy: {
        year: 'desc',
      },
    });

    // Define available data tables with their display names and field info
    const dataTables = [
      {
        key: "fiscal",
        label: "Total Fiscal Support",
        field: "fstotal_acquisition_budget",
        tableName: "Fiscal_Support",
      },
      {
        key: "volume_holdings",
        label: "Total Physical Volume Holdings",
        field: "vhgrandtotal",
        tableName: "Volume_Holdings",
      },
      {
        key: "other_holdings",
        label: "Total Other Materials Holdings",
        field: "ohgrandtotal",
        tableName: "Other_Holdings",
      },
      {
        key: "personnel",
        label: "Total Personnel Support",
        field: "psftotal",
        tableName: "Personnel_Support",
      },
      {
        key: "serials",
        label: "Total Serial Holdings",
        field: "sgrandtotal",
        tableName: "Serials",
      },
    ];

    return NextResponse.json({
      libraries: libraries.map((lib) => ({
        value: lib.id,
        label: lib.library_name,
      })),
      years: years.map((y) => y.year).filter((y) => y !== 1900),
      dataTables,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
  // Don't disconnect - using singleton pattern
}
