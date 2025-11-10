import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client to avoid connection exhaustion
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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
        key: 'volume_holdings',
        label: 'Volume Holdings',
        field: 'vhgrandtotal',
        tableName: 'Volume_Holdings',
      },
      {
        key: 'monographic',
        label: 'Monographic Acquisitions',
        field: 'matotal_volumes',
        tableName: 'Monographic_Acquisitions',
      },
      {
        key: 'serials',
        label: 'Serials',
        field: 'sgrandtotal',
        tableName: 'Serials',
      },
      {
        key: 'fiscal',
        label: 'Fiscal Support',
        field: 'fstotal_acquisition_budget',
        tableName: 'Fiscal_Support',
      },
      {
        key: 'electronic',
        label: 'Electronic Resources',
        field: 'etotal_expenditure_grandtotal',
        tableName: 'Electronic',
      },
      {
        key: 'electronic_books',
        label: 'Electronic Books',
        field: 'ebooks_total_volumes',
        tableName: 'Electronic_Books',
      },
      {
        key: 'personnel',
        label: 'Personnel Support',
        field: 'psftotal',
        tableName: 'Personnel_Support',
      },
      {
        key: 'public_services',
        label: 'Public Services',
        field: 'pstotal_circulations_subtotal',
        tableName: 'Public_Services',
      },
      {
        key: 'other_holdings',
        label: 'Other Holdings',
        field: 'ohgrandtotal',
        tableName: 'Other_Holdings',
      },
      {
        key: 'unprocessed',
        label: 'Unprocessed Backlog Materials',
        field: 'ubtotal',
        tableName: 'Unprocessed_Backlog_Materials',
      },
    ];

    return NextResponse.json({
      libraries: libraries.map(lib => ({
        value: lib.id,
        label: lib.library_name,
      })),
      years: years.map(y => y.year),
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
