import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ libid: string; year: string }> }
) {
  try {
    const { libid, year } = await params;

    // Validate required fields
    if (!libid || isNaN(Number(libid)) || !year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID or year" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = Number(year);

    // Find Library_Year record for previous year and library
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
      include: {
        LibraryYear_ListEBook: true,
      },
    });

    if (!libraryYear || !libraryYear.LibraryYear_ListEBook) {
      return NextResponse.json(null);
    }

    // Return the previous year's volume holdings data
    return NextResponse.json(libraryYear.LibraryYear_ListEBook);

  } catch (error: any) {
    console.error("API error (get previous year volume holdings):", error);

    return NextResponse.json(
      { error: "Failed to get previous year data", detail: error?.message },
      { status: 500 }
    );
  }
}
