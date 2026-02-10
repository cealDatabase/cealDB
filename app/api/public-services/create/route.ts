// /app/api/public-services/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { logPostCollectionEdit } from "@/lib/postCollectionAuditLogger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entryid,
      libid,
      finalSubmit,
      pspresentations_subtotal,
      pspresentation_participants_subtotal,
      psreference_transactions_subtotal,
      pstotal_circulations_subtotal,
      pslending_requests_filled_subtotal,
      pslending_requests_unfilled_subtotal,
      psborrowing_requests_filled_subtotal,
      psborrowing_requests_unfilled_subtotal,
      psnotes,
    } = body;

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
    const existingRecord = await db.public_Services.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    const publicServicesData = {
      entryid: entryid || null,
      libraryyear: libraryYear.id,
      pspresentations_subtotal: pspresentations_subtotal || 0,
      pspresentation_participants_subtotal: pspresentation_participants_subtotal || 0,
      psreference_transactions_subtotal: psreference_transactions_subtotal || 0,
      pstotal_circulations_subtotal: pstotal_circulations_subtotal || 0,
      pslending_requests_filled_subtotal: pslending_requests_filled_subtotal || 0,
      pslending_requests_unfilled_subtotal: pslending_requests_unfilled_subtotal || 0,
      psborrowing_requests_filled_subtotal: psborrowing_requests_filled_subtotal || 0,
      psborrowing_requests_unfilled_subtotal: psborrowing_requests_unfilled_subtotal || 0,
      psnotes: psnotes || "",
    } as const;

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.public_Services.update({
        where: { id: existingRecord.id },
        data: publicServicesData,
      });
    } else {
      // Create new record
      result = await db.public_Services.create({
        data: publicServicesData,
      });
    }

    // Audit log the modification
    await logPostCollectionEdit({
      tableName: 'Public_Services',
      recordId: result.id,
      oldValues: existingRecord,
      newValues: result,
      academicYear: libraryYear.year,
      libraryId: libraryId,
      formType: 'public-services',
      request: req,
    });

    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'public-services');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Public services data updated successfully" : "Public services data created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("API error (public services create):", error);
    return NextResponse.json(
      { error: "Failed to save public services data", detail: error?.message },
      { status: 500 }
    );
  }
}
