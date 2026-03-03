import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';
import {
  hasValidFiscalData,
  hasValidMonographicData,
  hasValidOtherHoldingsData,
  hasValidPersonnelData,
  hasValidPublicServicesData,
  hasValidSerialsData,
  hasValidUnprocessedData,
  hasValidVolumeHoldingsData,
  hasValidElectronicData,
  hasValidElectronicBooksData
} from '@/lib/formValidation';

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
        Fiscal_Support: true,
        Monographic_Acquisitions: true,
        Other_Holdings: true,
        Personnel_Support: true,
        Public_Services: true,
        Serials: true,
        Unprocessed_Backlog_Materials: true,
        Volume_Holdings: true,
        Electronic: true,
        Electronic_Books: true,
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
      .map((item) => {
        // Validate that forms have meaningful data (not all zeros)
        const hasFiscal = item.Fiscal_Support && hasValidFiscalData(item.Fiscal_Support);
        const hasMonographic = item.Monographic_Acquisitions && hasValidMonographicData(item.Monographic_Acquisitions);
        const hasOtherHoldings = item.Other_Holdings && hasValidOtherHoldingsData(item.Other_Holdings);
        const hasPersonnel = item.Personnel_Support && hasValidPersonnelData(item.Personnel_Support);
        const hasPublicServices = item.Public_Services && hasValidPublicServicesData(item.Public_Services);
        const hasSerials = item.Serials && hasValidSerialsData(item.Serials);
        const hasUnprocessed = item.Unprocessed_Backlog_Materials && hasValidUnprocessedData(item.Unprocessed_Backlog_Materials);
        const hasVolumeHoldings = item.Volume_Holdings && hasValidVolumeHoldingsData(item.Volume_Holdings);
        const hasElectronic = item.Electronic && hasValidElectronicData(item.Electronic);
        const hasElectronicBooks = item.Electronic_Books && hasValidElectronicBooksData(item.Electronic_Books);

        return {
          libraryId: item.Library!.id,
          libraryName: item.Library!.library_name,
          region: 'Region', // Simplified for now
          year: item.year,
          libraryYearId: item.id,
          forms: {
            fiscal_support: hasFiscal,
            monographic_acquisitions: hasMonographic,
            other_holdings: hasOtherHoldings,
            personnel_support_fte: hasPersonnel,
            public_services: hasPublicServices,
            serials: hasSerials,
            unprocessed_backlog_materials: hasUnprocessed,
            volume_holdings: hasVolumeHoldings,
            electronic: hasElectronic,
            electronic_books: hasElectronicBooks,
            espublished: item.Entry_Status?.espublished || false,
          },
        };
      });

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
