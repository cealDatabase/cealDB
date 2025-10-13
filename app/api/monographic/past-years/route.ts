import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const libraryIdCookie = cookieStore.get("library_id");
    
    if (!libraryIdCookie) {
      return NextResponse.json(
        { error: "Library ID not found in cookies" },
        { status: 401 }
      );
    }

    const libraryId = parseInt(libraryIdCookie.value);
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

    // Fetch monographic data for all these library years
    const monographicData = await db.monographic_Acquisitions.findMany({
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

    // Organize data by year
    const dataByYear = pastYears.map(year => {
      const libraryYearId = yearToLibraryYearMap.get(year);
      const data = monographicData.find(m => m.libraryyear === libraryYearId);
      
      return {
        year,
        data: data || null
      };
    });

    return NextResponse.json({
      success: true,
      pastYears: dataByYear
    });

  } catch (error) {
    console.error("Error fetching past years monographic data:", error);
    return NextResponse.json(
      { error: "Failed to fetch past years data" },
      { status: 500 }
    );
  }
}
