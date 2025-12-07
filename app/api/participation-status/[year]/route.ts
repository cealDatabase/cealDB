import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';

const prisma = db;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const resolvedParams = await params;
    const year = parseInt(resolvedParams.year);

    if (isNaN(year)) {
      return NextResponse.json(
        { error: "Invalid year parameter" },
        { status: 400 }
      );
    }

    // Get all Library_Year records for the specified year with their related Entry_Status and Library information
    const participationData = await prisma.library_Year.findMany({
      where: {
        year: year,
        is_active: true,
      },
      include: {
        Library: {
          select: {
            id: true,
            library_name: true,
            pliregion: true,
            libraryRegion: true,
          },
        },
        Entry_Status: {
          select: {
            fiscal_support: true,
            monographic_acquisitions: true,
            other_holdings: true,
            personnel_support_fte: true,
            public_services: true,
            serials: true,
            unprocessed_backlog_materials: true,
            volume_holdings: true,
            electronic: true,
            electronic_books: true,
            espublished: true,
          },
        },
      },
      orderBy: [
        {
          Library: {
            library_name: 'asc',
          },
        },
      ],
    });

    // Transform the data for frontend consumption
    // Filter out records without valid Library association
    const formattedData = participationData
      .filter((item) => item.Library && item.Library.library_name)
      .map((item) => ({
        libraryId: item.Library!.id,
        libraryName: item.Library!.library_name,
        region: 'Region', // Simplified for now
        year: item.year,
        libraryYearId: item.id,
        forms: {
          fiscal_support: item.Entry_Status?.fiscal_support || false,
          monographic_acquisitions: item.Entry_Status?.monographic_acquisitions || false,
          other_holdings: item.Entry_Status?.other_holdings || false,
          personnel_support_fte: item.Entry_Status?.personnel_support_fte || false,
          public_services: item.Entry_Status?.public_services || false,
          serials: item.Entry_Status?.serials || false,
          unprocessed_backlog_materials: item.Entry_Status?.unprocessed_backlog_materials || false,
          volume_holdings: item.Entry_Status?.volume_holdings || false,
          electronic: item.Entry_Status?.electronic || false,
          electronic_books: item.Entry_Status?.electronic_books || false,
          espublished: item.Entry_Status?.espublished || false,
        },
      }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      year: year,
      totalLibraries: formattedData.length,
    });

  } catch (error) {
    console.error('Error fetching participation status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch participation status data",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
