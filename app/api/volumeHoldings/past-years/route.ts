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

    // Fetch volume holdings data for all these library years
    const volumeHoldingsData = await db.volume_Holdings.findMany({
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
    });

    // Fetch electronic books data for the same years
    const electronicBooksData = await db.electronic_Books.findMany({
      where: {
        libraryyear: {
          in: libraryYears.map(ly => ly.id)
        }
      },
      select: {
        libraryyear: true,
        ebooks_total_volumes: true
      }
    });

    // Create a map of library_year_id to electronic books total
    const ebVolumeMap = new Map(
      electronicBooksData.map(eb => [eb.libraryyear, eb.ebooks_total_volumes])
    );

    // Organize data by year
    const dataByYear = pastYears.map(year => {
      const libraryYearId = yearToLibraryYearMap.get(year);
      const data = volumeHoldingsData.find(vh => vh.libraryyear === libraryYearId);
      const ebVolumes = libraryYearId ? ebVolumeMap.get(libraryYearId) : null;
      
      return {
        year,
        data: data || null,
        ebVolumes: ebVolumes || null
      };
    });

    return NextResponse.json({
      success: true,
      pastYears: dataByYear
    });

  } catch (error) {
    console.error("Error fetching past years volume holdings data:", error);
    return NextResponse.json(
      { error: "Failed to fetch past years data" },
      { status: 500 }
    );
  }
}
