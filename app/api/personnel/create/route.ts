// /app/api/personnel/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entryid,
      libid,
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
        { error: "Form is not open for editing" },
        { status: 403 }
      );
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
