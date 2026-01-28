// /app/api/public-services/status/[libid]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ libid: string }> }) {
  try {
    const { libid: libidStr } = await params;
    const libid = Number(libidStr);
    const currentYear = new Date().getFullYear();

    if (isNaN(libid)) {
      return NextResponse.json(
        { error: "Invalid library ID" },
        { status: 400 }
      );
    }

    // Find the Library_Year record
    let libraryYear = await db.library_Year.findFirst({
      where: {
        library: libid,
        year: currentYear,
      },
    });

    // If current year doesn't exist, use the most recent year
    if (!libraryYear) {
      libraryYear = await db.library_Year.findFirst({
        where: {
          library: libid,
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
        message: "No library year record found",
      });
    }

    // Check if public services data exists
    const existingData = await db.public_Services.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    return NextResponse.json({
      exists: true,
      is_open_for_editing: libraryYear.is_open_for_editing,
      is_active: true,
      year: libraryYear.year,
      library_id: libraryYear.library,
      message: libraryYear.is_open_for_editing ? "Form is available for editing" : "Form is read-only",
      existingData: existingData,
      libraryYear: libraryYear,
    });

  } catch (error: any) {
    console.error("API error (public services status by libid):", error);
    return NextResponse.json(
      { error: "Failed to fetch public services status", detail: error?.message },
      { status: 500 }
    );
  }
}
