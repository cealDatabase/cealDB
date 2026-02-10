// /app/api/personnel/create/route.ts
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
      psfprofessional_chinese,
      psfprofessional_japanese,
      psfprofessional_korean,
      psfprofessional_eastasian,
      psfprofessional_subtotal,
      psfsupport_staff_chinese,
      psfsupport_staff_japanese,
      psfsupport_staff_korean,
      psfsupport_staff_eastasian,
      psfsupport_staff_subtotal,
      psfstudent_assistants_chinese,
      psfstudent_assistants_japanese,
      psfstudent_assistants_korean,
      psfstudent_assistants_eastasian,
      psfstudent_assistants_subtotal,
      psfothers,
      psftotal,
      psfosacquisition,
      psfosprocessing,
      psfnotes,
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
    const existingRecord = await db.personnel_Support.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    const personnelData = {
      entryid: entryid || null,
      libraryyear: libraryYear.id,
      psfprofessional_chinese: psfprofessional_chinese || 0,
      psfprofessional_japanese: psfprofessional_japanese || 0,
      psfprofessional_korean: psfprofessional_korean || 0,
      psfprofessional_eastasian: psfprofessional_eastasian || 0,
      psfprofessional_subtotal: psfprofessional_subtotal || 0,
      psfsupport_staff_chinese: psfsupport_staff_chinese || 0,
      psfsupport_staff_japanese: psfsupport_staff_japanese || 0,
      psfsupport_staff_korean: psfsupport_staff_korean || 0,
      psfsupport_staff_eastasian: psfsupport_staff_eastasian || 0,
      psfsupport_staff_subtotal: psfsupport_staff_subtotal || 0,
      psfstudent_assistants_chinese: psfstudent_assistants_chinese || 0,
      psfstudent_assistants_japanese: psfstudent_assistants_japanese || 0,
      psfstudent_assistants_korean: psfstudent_assistants_korean || 0,
      psfstudent_assistants_eastasian: psfstudent_assistants_eastasian || 0,
      psfstudent_assistants_subtotal: psfstudent_assistants_subtotal || 0,
      psfothers: psfothers || 0,
      psftotal: psftotal || 0,
      psfosacquisition: psfosacquisition || false,
      psfosprocessing: psfosprocessing || false,
      psfnotes: psfnotes || "",
    };

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.personnel_Support.update({
        where: {
          id: existingRecord.id,
        },
        data: personnelData,
      });
    } else {
      // Create new record
      result = await db.personnel_Support.create({
        data: personnelData,
      });
    }

    // Audit log the modification
    await logPostCollectionEdit({
      tableName: 'Personnel_Support',
      recordId: result.id,
      oldValues: existingRecord,
      newValues: result,
      academicYear: libraryYear.year,
      libraryId: libraryId,
      formType: 'personnel',
      request: req,
    });

    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'personnel');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Personnel support data updated successfully" : "Personnel support data created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("API error (personnel create):", error);

    return NextResponse.json(
      { error: "Failed to save personnel support data", detail: error?.message },
      { status: 500 }
    );
  }
}
