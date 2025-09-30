import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Unprocessed Backlog Materials API received body:", body);

    const { libid, ...unprocessedData } = body;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = new Date().getFullYear();

    // Find Library_Year record for current year and library
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    console.log("Found Library_Year record:", libraryYear);

    if (!libraryYear) {
      return NextResponse.json(
        { error: "No library_year record found for this library and year" },
        { status: 404 }
      );
    }

    if (!libraryYear.is_open_for_editing) {
      return NextResponse.json(
        { error: "Form is not avilable at this time" },
        { status: 403 }
      );
    }

    if (!libraryYear.is_active) {
      return NextResponse.json(
        { error: "Library year record is not active" },
        { status: 403 }
      );
    }

    // Check if unprocessed backlog materials record already exists
    const existingRecord = await db.unprocessed_Backlog_Materials.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    let result;

    if (existingRecord) {
      // Update existing record
      result = await db.unprocessed_Backlog_Materials.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          ...unprocessedData,
        },
      });

      console.log("Updated existing unprocessed backlog materials record:", result);

      return NextResponse.json({
        success: true,
        message: "Unprocessed backlog materials record updated successfully",
        data: result,
      });
    } else {
      // Create new record
      result = await db.unprocessed_Backlog_Materials.create({
        data: {
          libraryyear: libraryYear.id,
          ...unprocessedData,
        },
      });

      console.log("Created new unprocessed backlog materials record:", result);

      return NextResponse.json({
        success: true,
        message: "Unprocessed backlog materials record created successfully",
        data: result,
      });
    }

  } catch (error: any) {
    console.error("API error (create unprocessed backlog materials):", error);

    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A record with this data already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save unprocessed backlog materials data", detail: error?.message },
      { status: 500 }
    );
  }
}
