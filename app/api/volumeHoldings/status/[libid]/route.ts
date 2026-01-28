import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ libid: string }> }
) {
  try {
    const { libid } = await params;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = new Date().getFullYear();

    // Find Library_Year record
    let libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    // If current year doesn't exist, use the most recent year
    if (!libraryYear) {
      libraryYear = await db.library_Year.findFirst({
        where: {
          library: libraryId,
        },
        orderBy: {
          year: 'desc'
        }
      });
    }

    if (!libraryYear) {
      return NextResponse.json({
        exists: false,
        is_open_for_editing: false,
        is_active: false,
        data: null,
        message: "No library_year record exists for this library. Please contact the administrator."
      });
    }

    // Get existing volume holdings data
    const existingData = await db.volume_Holdings.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    return NextResponse.json({
      exists: true,
      is_open_for_editing: libraryYear.is_open_for_editing,
      is_active: libraryYear.is_active,
      year: libraryYear.year,
      library_id: libraryYear.library,
      libraryYear: libraryYear,
      data: existingData,
      message: libraryYear.is_open_for_editing 
        ? "Form is available for editing" 
        : "Form is not avilable at this time. Please contact the CEAL Statistics Committee Chair for help."
    });

  } catch (error: any) {
    console.error("API error (check volume holdings library year status):", error);

    return NextResponse.json(
      { error: "Failed to check library year status", detail: error?.message },
      { status: 500 }
    );
  }
}
