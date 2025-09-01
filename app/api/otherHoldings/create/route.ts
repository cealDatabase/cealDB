import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Other Holdings API received body:", body);

    const { libid, ...otherHoldingsData } = body;

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
        { error: "Form is not open for editing" },
        { status: 403 }
      );
    }

    if (!libraryYear.is_active) {
      return NextResponse.json(
        { error: "Library year record is not active" },
        { status: 403 }
      );
    }

    // Check if other holdings record already exists
    const existingRecord = await db.other_Holdings.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    let result;

    if (existingRecord) {
      // Update existing record
      result = await db.other_Holdings.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          ...otherHoldingsData,
        },
      });

      console.log("Updated existing other holdings record:", result);

      return NextResponse.json({
        success: true,
        message: "Other holdings record updated successfully",
        data: result,
      });
    } else {
      // Create new record
      result = await db.other_Holdings.create({
        data: {
          libraryyear: libraryYear.id,
          ...otherHoldingsData,
        },
      });

      console.log("Created new other holdings record:", result);

      return NextResponse.json({
        success: true,
        message: "Other holdings record created successfully",
        data: result,
      });
    }

  } catch (error: any) {
    console.error("API error (create other holdings):", error);

    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A record with this data already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save other holdings data", detail: error?.message },
      { status: 500 }
    );
  }
}
