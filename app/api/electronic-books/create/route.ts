// /app/api/electronic-books/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { libid, finalSubmit, ...formData } = body;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = new Date().getFullYear();

    // Check if Library_Year exists and is open for editing
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: "No library_year record exists for this library and year" },
        { status: 400 }
      );
    }

    if (!libraryYear.is_open_for_editing) {
      return NextResponse.json(
        { error: "Form is not avilable at this time" },
        { status: 403 }
      );
    }

    // Check if record already exists
    const existingRecord = await db.electronic_Books.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    // Build data object with all fields from the form
    const electronicBooksData: any = {
      libraryyear: libraryYear.id,
    };

    // Map all form fields to database fields (excluding libid)
    Object.keys(formData).forEach((key) => {
      if (key !== 'libid' && key !== 'finalSubmit') {
        electronicBooksData[key] = (formData as any)[key] ?? 0;
      }
    });

    console.log('[E-Books Create] Saving data:', JSON.stringify(electronicBooksData, null, 2));

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.electronic_Books.update({
        where: {
          id: existingRecord.id,
        },
        data: electronicBooksData,
      });
    } else {
      // Create new record
      result = await db.electronic_Books.create({
        data: electronicBooksData,
      });
    }

    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'electronicBooks');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Electronic books data updated successfully" : "Electronic books data created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("API error (electronic books create):", error);

    return NextResponse.json(
      { error: "Failed to save electronic books data", detail: error?.message },
      { status: 500 }
    );
  }
}
