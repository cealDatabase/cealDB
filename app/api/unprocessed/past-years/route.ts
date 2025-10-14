import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get library ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const libidParam = searchParams.get("libid");
    
    if (!libidParam) {
      return NextResponse.json(
        { error: "Library ID not provided" },
        { status: 400 }
      );
    }

    const libraryId = parseInt(libidParam);
    const currentYear = new Date().getFullYear();
    
    // Calculate past 5 years (excluding current year)
    const pastYears = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);
    
    // Fetch library years for this library
    const libraryYears = await db.library_Year.findMany({
      where: {
        library: libraryId,
        year: {
          in: pastYears
        }
      },
      select: {
        id: true,
        year: true
      }
    });

    // Create a map of year to library_year_id
    const yearToLibraryYearMap = new Map(
      libraryYears.map(ly => [ly.year, ly.id])
    );

    // Fetch data from all four tables
    const [volumeHoldingsData, electronicBooksData, otherHoldingsData, unprocessedBacklogData] = await Promise.all([
      // Volume Holdings data
      db.volume_Holdings.findMany({
        where: {
          libraryyear: {
            in: libraryYears.map(ly => ly.id)
          }
        },
        include: {
          Library_Year: {
            select: {
              year: true
            }
          }
        }
      }),
      
      // Electronic Books data
      db.electronic_Books.findMany({
        where: {
          libraryyear: {
            in: libraryYears.map(ly => ly.id)
          }
        },
        select: {
          libraryyear: true,
          ebooks_total_volumes: true
        }
      }),
      
      // Other Holdings data
      db.other_Holdings.findMany({
        where: {
          libraryyear: {
            in: libraryYears.map(ly => ly.id)
          }
        },
        select: {
          libraryyear: true,
          ohmicroform_subtotal: true,
          ohcomputer_files_subtotal: true,
          ohcarto_graphic_subtotal: true,
          ohaudio_subtotal: true,
          ohfilm_video_subtotal: true,
          ohdvd_subtotal: true,
          ohgrandtotal: true
        }
      }),
      
      // Unprocessed Backlog Materials data
      db.unprocessed_Backlog_Materials.findMany({
        where: {
          libraryyear: {
            in: libraryYears.map(ly => ly.id)
          }
        },
        include: {
          Library_Year: {
            select: {
              year: true
            }
          }
        }
      })
    ]);

    // Create maps for quick lookup
    const ebVolumeMap = new Map(
      electronicBooksData.map(eb => [eb.libraryyear, eb.ebooks_total_volumes])
    );
    
    const otherHoldingsMap = new Map(
      otherHoldingsData.map(oh => [oh.libraryyear, oh])
    );

    // Organize data by year
    const dataByYear = pastYears.map(year => {
      const libraryYearId = yearToLibraryYearMap.get(year);
      const volumeHoldings = volumeHoldingsData.find(vh => vh.libraryyear === libraryYearId);
      const ebVolumes = libraryYearId ? ebVolumeMap.get(libraryYearId) : null;
      const otherHoldings = libraryYearId ? otherHoldingsMap.get(libraryYearId) : null;
      const unprocessedBacklog = unprocessedBacklogData.find(ub => ub.libraryyear === libraryYearId);
      
      return {
        year,
        volumeHoldings: volumeHoldings || null,
        ebVolumes: ebVolumes || null,
        otherHoldings: otherHoldings || null,
        unprocessedBacklog: unprocessedBacklog || null
      };
    });

    return NextResponse.json({
      success: true,
      pastYears: dataByYear
    });

  } catch (error) {
    console.error("Error fetching past years unprocessed backlog data:", error);
    return NextResponse.json(
      { error: "Failed to fetch past years data" },
      { status: 500 }
    );
  }
}
