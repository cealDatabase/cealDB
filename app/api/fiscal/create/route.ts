// /app/api/fiscal/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entryid,
      libid,
      finalSubmit,
      fschinese_appropriations_monographic,
      fschinese_appropriations_serial,
      fschinese_appropriations_other_material,
      fschinese_appropriations_electronic,
      fsjapanese_appropriations_monographic,
      fsjapanese_appropriations_serial,
      fsjapanese_appropriations_other_material,
      fsjapanese_appropriations_electronic,
      fskorean_appropriations_monographic,
      fskorean_appropriations_serial,
      fskorean_appropriations_other_material,
      fskorean_appropriations_electronic,
      fsnoncjk_appropriations_monographic,
      fsnoncjk_appropriations_serial,
      fsnoncjk_appropriations_other_material,
      fsnoncjk_appropriations_electronic,
      fsendowments_chinese,
      fsendowments_japanese,
      fsendowments_korean,
      fsendowments_noncjk,
      fsgrants_chinese,
      fsgrants_japanese,
      fsgrants_korean,
      fsgrants_noncjk,
      fseast_asian_program_support_chinese,
      fseast_asian_program_support_japanese,
      fseast_asian_program_support_korean,
      fseast_asian_program_support_noncjk,
      fstotal_acquisition_budget,
      fschinese_appropriations_subtotal_manual,
      fsjapanese_appropriations_subtotal_manual,
      fskorean_appropriations_subtotal_manual,
      fsnoncjk_appropriations_subtotal_manual,
      fstotal_appropriations_manual,
      fsendowments_subtotal_manual,
      fsgrants_subtotal_manual,
      fseast_asian_program_support_subtotal_manual,
      fsnotes,
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
        { error: "Form is not avilable at this time" },
        { status: 403 }
      );
    }

    // Find the Library_Year record to get the libraryyear ID
    const libraryYearRecord = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    if (!libraryYearRecord) {
      return NextResponse.json(
        { error: "Library year record not found" },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existingRecord = await db.fiscal_Support.findFirst({
      where: {
        libraryyear: libraryYearRecord.id,
      },
    });

    const fiscalData = {
      entryid: entryid || null,
      libraryyear: libraryYearRecord.id,
      fschinese_appropriations_monographic: fschinese_appropriations_monographic || 0,
      fschinese_appropriations_serial: fschinese_appropriations_serial || 0,
      fschinese_appropriations_other_material: fschinese_appropriations_other_material || 0,
      fschinese_appropriations_electronic: fschinese_appropriations_electronic || 0,
      fsjapanese_appropriations_monographic: fsjapanese_appropriations_monographic || 0,
      fsjapanese_appropriations_serial: fsjapanese_appropriations_serial || 0,
      fsjapanese_appropriations_other_material: fsjapanese_appropriations_other_material || 0,
      fsjapanese_appropriations_electronic: fsjapanese_appropriations_electronic || 0,
      fskorean_appropriations_monographic: fskorean_appropriations_monographic || 0,
      fskorean_appropriations_serial: fskorean_appropriations_serial || 0,
      fskorean_appropriations_other_material: fskorean_appropriations_other_material || 0,
      fskorean_appropriations_electronic: fskorean_appropriations_electronic || 0,
      fsnoncjk_appropriations_monographic: fsnoncjk_appropriations_monographic || 0,
      fsnoncjk_appropriations_serial: fsnoncjk_appropriations_serial || 0,
      fsnoncjk_appropriations_other_material: fsnoncjk_appropriations_other_material || 0,
      fsnoncjk_appropriations_electronic: fsnoncjk_appropriations_electronic || 0,
      fsendowments_chinese: fsendowments_chinese || 0,
      fsendowments_japanese: fsendowments_japanese || 0,
      fsendowments_korean: fsendowments_korean || 0,
      fsendowments_noncjk: fsendowments_noncjk || 0,
      fsgrants_chinese: fsgrants_chinese || 0,
      fsgrants_japanese: fsgrants_japanese || 0,
      fsgrants_korean: fsgrants_korean || 0,
      fsgrants_noncjk: fsgrants_noncjk || 0,
      fseast_asian_program_support_chinese: fseast_asian_program_support_chinese || 0,
      fseast_asian_program_support_japanese: fseast_asian_program_support_japanese || 0,
      fseast_asian_program_support_korean: fseast_asian_program_support_korean || 0,
      fseast_asian_program_support_noncjk: fseast_asian_program_support_noncjk || 0,
      fstotal_acquisition_budget: fstotal_acquisition_budget || 0,
      fschinese_appropriations_subtotal_manual: fschinese_appropriations_subtotal_manual ?? null,
      fsjapanese_appropriations_subtotal_manual: fsjapanese_appropriations_subtotal_manual ?? null,
      fskorean_appropriations_subtotal_manual: fskorean_appropriations_subtotal_manual ?? null,
      fsnoncjk_appropriations_subtotal_manual: fsnoncjk_appropriations_subtotal_manual ?? null,
      fstotal_appropriations_manual: fstotal_appropriations_manual ?? null,
      fsendowments_subtotal_manual: fsendowments_subtotal_manual ?? null,
      fsgrants_subtotal_manual: fsgrants_subtotal_manual ?? null,
      fseast_asian_program_support_subtotal_manual: fseast_asian_program_support_subtotal_manual ?? null,
      fsnotes: fsnotes || "",
    };

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.fiscal_Support.update({
        where: {
          id: existingRecord.id,
        },
        data: fiscalData,
      });
    } else {
      // Create new record
      result = await db.fiscal_Support.create({
        data: fiscalData,
      });
    }

    if (finalSubmit) {
      await markEntryStatus(libraryYearRecord.id, 'fiscal');
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Fiscal support data updated successfully" : "Fiscal support data created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("API error (fiscal create):", error);

    return NextResponse.json(
      { error: "Failed to save fiscal support data", detail: error?.message },
      { status: 500 }
    );
  }
}
