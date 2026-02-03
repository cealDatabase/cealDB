import { NextRequest, NextResponse } from "next/server";
import { getAllLibraries } from "@/data/fetchPrisma";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    // If year is provided, get libraries with Library_Year for that year
    if (yearParam) {
      const year = parseInt(yearParam);
      if (isNaN(year)) {
        return NextResponse.json(
          { error: "Invalid year parameter" },
          { status: 400 }
        );
      }

      const libraryYears = await db.library_Year.findMany({
        where: { year },
        include: { Library: true },
        orderBy: { Library: { library_name: 'asc' } }
      });

      const libraries = libraryYears
        .filter(ly => ly.Library !== null)
        .map(ly => ({
          id: ly.Library!.id,
          library_name: ly.Library!.library_name
        }));

      return NextResponse.json({
        success: true,
        libraries,
        total: libraries.length,
      });
    }

    // Default: return all libraries
    const libraries = await getAllLibraries();
    
    if (!libraries) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch libraries",
          libraries: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      libraries,
      data: libraries, // Keep for backwards compatibility
      total: libraries.length,
    });

  } catch (error) {
    console.error('Error fetching libraries:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch libraries",
        details: error instanceof Error ? error.message : 'Unknown error',
        libraries: []
      },
      { status: 500 }
    );
  }
}
