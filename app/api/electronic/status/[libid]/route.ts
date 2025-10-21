// /app/api/electronic/status/[libid]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ libid: string }> }) {
  try {
    const { libid: libidStr } = await params;
    const libid = Number(libidStr);
    const currentYear = new Date().getFullYear();

    if (isNaN(libid)) {
      return NextResponse.json(
        { error: "Invalid library ID" },
        { status: 400 }
      );
    }

    // Find the Library_Year record
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libid,
        year: currentYear,
      },
    });

    if (!libraryYear) {
      return NextResponse.json({
        exists: false,
        is_open_for_editing: false,
        is_active: false,
        message: "No library year record found",
      });
    }

    // Check if electronic data exists for current year
    const existingData = await db.electronic.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    // Extract previous year's data - try current record's eprevious_* fields first
    let previousYearData = null;
    
    if (existingData && existingData.eprevious_total_title_chinese !== null) {
      // Previous year data already stored in current record
      console.log('[Electronic Status] Found eprevious_* fields in current record');
      previousYearData = {
        eprevious_total_title_chinese: existingData.eprevious_total_title_chinese,
        eprevious_total_title_japanese: existingData.eprevious_total_title_japanese,
        eprevious_total_title_korean: existingData.eprevious_total_title_korean,
        eprevious_total_title_noncjk: existingData.eprevious_total_title_noncjk,
        eprevious_total_title_subtotal: existingData.eprevious_total_title_subtotal,
        eprevious_total_cd_chinese: existingData.eprevious_total_cd_chinese,
        eprevious_total_cd_japanese: existingData.eprevious_total_cd_japanese,
        eprevious_total_cd_korean: existingData.eprevious_total_cd_korean,
        eprevious_total_cd_noncjk: existingData.eprevious_total_cd_noncjk,
        eprevious_total_cd_subtotal: existingData.eprevious_total_cd_subtotal,
      };
    } else {
      // Fetch from actual previous year's record
      console.log('[Electronic Status] eprevious_* fields not found, fetching from actual previous year');
      const previousYear = currentYear - 1;
      const previousLibraryYear = await db.library_Year.findFirst({
        where: {
          library: libid,
          year: previousYear,
        },
      });

      console.log(`[Electronic Status] Previous year (${previousYear}) Library_Year exists:`, !!previousLibraryYear);

      if (previousLibraryYear) {
        const previousElectronicData = await db.electronic.findFirst({
          where: {
            libraryyear: previousLibraryYear.id,
          },
          select: {
            // Fetch previous year's GRAND TOTAL (their section 1.6)
            egrand_total_title_chinese: true,
            egrand_total_title_japanese: true,
            egrand_total_title_korean: true,
            egrand_total_title_noncjk: true,
            egrand_total_title_subtotal: true,
            egrand_total_cd_chinese: true,
            egrand_total_cd_japanese: true,
            egrand_total_cd_korean: true,
            egrand_total_cd_noncjk: true,
            egrand_total_cd_subtotal: true,
            // Fallback to etotal_computer_* if grand totals don't exist
            etotal_computer_title_chinese: true,
            etotal_computer_title_japanese: true,
            etotal_computer_title_korean: true,
            etotal_computer_title_noncjk: true,
            etotal_computer_title_subtotal: true,
            etotal_computer_cd_chinese: true,
            etotal_computer_cd_japanese: true,
            etotal_computer_cd_korean: true,
            etotal_computer_cd_noncjk: true,
            etotal_computer_cd_subtotal: true,
          },
        });

        console.log(`[Electronic Status] Previous year Electronic data exists: ${previousLibraryYear.id}, ${previousLibraryYear.year}`, !!previousElectronicData);

        if (previousElectronicData) {
          // Map previous year's GRAND TOTAL (egrand_total_* or fallback to etotal_computer_*) to eprevious_* format
          previousYearData = {
            eprevious_total_title_chinese: previousElectronicData.egrand_total_title_chinese ?? previousElectronicData.etotal_computer_title_chinese,
            eprevious_total_title_japanese: previousElectronicData.egrand_total_title_japanese ?? previousElectronicData.etotal_computer_title_japanese,
            eprevious_total_title_korean: previousElectronicData.egrand_total_title_korean ?? previousElectronicData.etotal_computer_title_korean,
            eprevious_total_title_noncjk: previousElectronicData.egrand_total_title_noncjk ?? previousElectronicData.etotal_computer_title_noncjk,
            eprevious_total_title_subtotal: previousElectronicData.egrand_total_title_subtotal ?? previousElectronicData.etotal_computer_title_subtotal,
            eprevious_total_cd_chinese: previousElectronicData.egrand_total_cd_chinese ?? previousElectronicData.etotal_computer_cd_chinese,
            eprevious_total_cd_japanese: previousElectronicData.egrand_total_cd_japanese ?? previousElectronicData.etotal_computer_cd_japanese,
            eprevious_total_cd_korean: previousElectronicData.egrand_total_cd_korean ?? previousElectronicData.etotal_computer_cd_korean,
            eprevious_total_cd_noncjk: previousElectronicData.egrand_total_cd_noncjk ?? previousElectronicData.etotal_computer_cd_noncjk,
            eprevious_total_cd_subtotal: previousElectronicData.egrand_total_cd_subtotal ?? previousElectronicData.etotal_computer_cd_subtotal,
          };
        } else {
          console.log('[Electronic Status] No Electronic data found for previous year');
        }
      }
    }

    return NextResponse.json({
      exists: true,
      is_open_for_editing: libraryYear.is_open_for_editing,
      is_active: true,
      message: libraryYear.is_open_for_editing ? "Form is available for editing" : "Form is read-only",
      existingData: existingData,
      libraryYear: libraryYear,
      previousYearData: previousYearData,
    });

  } catch (error: any) {
    console.error("API error (electronic status by libid):", error);
    return NextResponse.json(
      { error: "Failed to fetch electronic status", detail: error?.message },
      { status: 500 }
    );
  }
}
