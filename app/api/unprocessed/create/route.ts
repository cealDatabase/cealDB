import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { canAccessLibrary } from "@/lib/auth";
import { logPostCollectionEdit } from "@/lib/postCollectionAuditLogger";
import { getActiveSurveyYear } from "@/lib/currentSurveyYear";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Unprocessed Backlog Materials API received body:", body);

    const { libid, finalSubmit, ...unprocessedData } = body;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);

    // Authorization. Without this the caller-supplied `libid` is trusted
    // outright, so anyone reaching this endpoint - signed in as another
    // institution's delegate, or not signed in at all - could write into this
    // library's forms while its survey window was open. canAccessLibrary()
    // returns false when there is no valid session, and otherwise allows only
    // a cross-library role (Super Admin, E-Resource Editor, Assistant Admin)
    // or a user actually assigned to this library.
    if (!(await canAccessLibrary(libraryId))) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You are not authorized to submit data for this institution.",
        },
        { status: 403 }
      );
    }
    const currentYear = await getActiveSurveyYear();

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
    } else {
      // Create new record
      result = await db.unprocessed_Backlog_Materials.create({
        data: {
          libraryyear: libraryYear.id,
          ...unprocessedData,
        },
      });

      console.log("Created new unprocessed backlog materials record:", result);
    }

    // Audit log the modification
    await logPostCollectionEdit({
      tableName: 'Unprocessed_Backlog_Materials',
      recordId: result.id,
      oldValues: existingRecord,
      newValues: result,
      academicYear: libraryYear.year,
      libraryId: libraryId,
      formType: 'unprocessed',
      request: req,
    });

    // Submitting marks the form Submitted whatever its numbers: an
    // institution can report all zeros (no backlog, say) on purpose.
    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'unprocessed');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Unprocessed backlog materials record updated successfully" : "Unprocessed backlog materials record created successfully",
      data: result,
    });

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
