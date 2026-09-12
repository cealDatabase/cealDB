// /app/api/electronic-books/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { canAccessLibrary } from "@/lib/auth";
import { logPostCollectionEdit } from "@/lib/postCollectionAuditLogger";
import { getActiveSurveyYear } from "@/lib/currentSurveyYear";
import { hasValidElectronicBooksData } from "@/lib/formValidation";

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

    // Check if Library_Year exists and is open for editing
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
        { error: "No library_year record exists for this library and year" },
        { status: 400 }
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

    // Audit log the modification
    await logPostCollectionEdit({
      tableName: 'Electronic_Books',
      recordId: result.id,
      oldValues: existingRecord,
      newValues: result,
      academicYear: libraryYear.year,
      libraryId: libraryId,
      formType: 'electronicBooks',
      request: req,
    });

    if (finalSubmit) {
      // Only mark as participated if the form has meaningful data (not all zeros)
      const hasValidData = hasValidElectronicBooksData(result);
      if (hasValidData) {
        await markEntryStatus(libraryYear.id, 'electronicBooks');
      } else {
        // If all zeros, ensure Entry_Status is set to false
        await db.entry_Status.upsert({
          where: { libraryyear: libraryYear.id },
          update: { electronic_books: false },
          create: { libraryyear: libraryYear.id, electronic_books: false },
        });
        console.log("Form submitted with all zeros - not marking as participated");
      }
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
