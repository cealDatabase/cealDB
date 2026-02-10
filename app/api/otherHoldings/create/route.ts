import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { logPostCollectionEdit } from "@/lib/postCollectionAuditLogger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Other Holdings API received body:", body);

    const { libid, finalSubmit, ...otherHoldingsData } = body;

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
    let libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    // Super admin: fall back to most recent year if current year not found
    if (!libraryYear) {
      const superAdmin = await isSuperAdmin();
      if (superAdmin) {
        libraryYear = await db.library_Year.findFirst({
          where: { library: libraryId },
          orderBy: { year: 'desc' },
        });
      }
    }

    if (!libraryYear) {
      return NextResponse.json(
        { error: "No library_year record found for this library and year" },
        { status: 404 }
      );
    }

    // Check if editing is allowed (super admins can bypass this)
    if (!libraryYear.is_open_for_editing) {
      const superAdmin = await isSuperAdmin();
      if (!superAdmin) {
        return NextResponse.json(
          { error: "Form is not available at this time" },
          { status: 403 }
        );
      }
      console.log("Super admin bypassing is_open_for_editing check");
    }

    // is_active check removed - it's for reporting purposes only, not for blocking form submission

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
    } else {
      // Create new record
      result = await db.other_Holdings.create({
        data: {
          libraryyear: libraryYear.id,
          ...otherHoldingsData,
        },
      });

      console.log("Created new other holdings record:", result);
    }

    // Audit log the modification
    await logPostCollectionEdit({
      tableName: 'Other_Holdings',
      recordId: result.id,
      oldValues: existingRecord,
      newValues: result,
      academicYear: libraryYear.year,
      libraryId: libraryId,
      formType: 'otherHoldings',
      request: req,
    });

    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'otherHoldings');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Other holdings record updated successfully" : "Other holdings record created successfully",
      data: result,
    });

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
