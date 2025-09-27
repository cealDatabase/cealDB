import { NextResponse } from "next/server";
import { getAllLibraries } from "@/data/fetchPrisma";

export async function GET() {
  try {
    const libraries = await getAllLibraries();
    
    if (!libraries) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch libraries",
          data: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: libraries,
      total: libraries.length,
    });

  } catch (error) {
    console.error('Error fetching libraries:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch libraries",
        details: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    );
  }
}
