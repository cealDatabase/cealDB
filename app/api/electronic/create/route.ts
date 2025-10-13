// /app/api/electronic/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id, // Extract id but don't use it
      entryid,
      libid,
      eonetime_computer_title_chinese,
      eonetime_computer_title_japanese,
      eonetime_computer_title_korean,
      eonetime_computer_title_noncjk,
      eonetime_computer_title_subtotal,
      eonetime_computer_cd_chinese,
      eonetime_computer_cd_japanese,
      eonetime_computer_cd_korean,
      eonetime_computer_cd_noncjk,
      eonetime_computer_cd_subtotal,
      eaccompanied_computer_title_chinese,
      eaccompanied_computer_title_japanese,
      eaccompanied_computer_title_korean,
      eaccompanied_computer_title_noncjk,
      eaccompanied_computer_title_subtotal,
      eaccompanied_computer_cd_chinese,
      eaccompanied_computer_cd_japanese,
      eaccompanied_computer_cd_korean,
      eaccompanied_computer_cd_noncjk,
      eaccompanied_computer_cd_subtotal,
      egift_computer_title_chinese,
      egift_computer_title_japanese,
      egift_computer_title_korean,
      egift_computer_title_noncjk,
      egift_computer_title_subtotal,
      egift_computer_cd_chinese,
      egift_computer_cd_japanese,
      egift_computer_cd_korean,
      egift_computer_cd_noncjk,
      egift_computer_cd_subtotal,
      eindex_electronic_title_chinese,
      eindex_electronic_title_japanese,
      eindex_electronic_title_korean,
      eindex_electronic_title_noncjk,
      eindex_electronic_title_subtotal,
      efulltext_electronic_title_chinese,
      efulltext_electronic_title_japanese,
      efulltext_electronic_title_korean,
      efulltext_electronic_title_noncjk,
      efulltext_electronic_title_subtotal,
      eonetime_computer_expenditure_chinese,
      eonetime_computer_expenditure_japanese,
      eonetime_computer_expenditure_korean,
      eonetime_computer_expenditure_noncjk,
      eindex_electronic_expenditure_chinese,
      eindex_electronic_expenditure_japanese,
      eindex_electronic_expenditure_korean,
      eindex_electronic_expenditure_noncjk,
      efulltext_electronic_expenditure_chinese,
      efulltext_electronic_expenditure_japanese,
      efulltext_electronic_expenditure_korean,
      efulltext_electronic_expenditure_noncjk,
      etotal_computer_title_chinese,
      etotal_computer_title_japanese,
      etotal_computer_title_korean,
      etotal_computer_title_noncjk,
      etotal_computer_title_subtotal,
      etotal_computer_cd_chinese,
      etotal_computer_cd_japanese,
      etotal_computer_cd_korean,
      etotal_computer_cd_noncjk,
      etotal_computer_cd_subtotal,
      etotal_electronic_title_chinese,
      etotal_electronic_title_japanese,
      etotal_electronic_title_korean,
      etotal_electronic_title_noncjk,
      etotal_electronic_title_subtotal,
      etotal_expenditure_grandtotal,
      eonetime_computer_memo,
      eaccompanied_computer_memo,
      egift_computer_memo,
      etotal_computer_memo,
      eindex_electronic_memo,
      efulltext_electronic_memo,
      etotal_electronic_memo,
      etotal_expenditure_memo,
      eprevious_memo,
      enotes,
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

    // Fetch previous year's data to populate eprevious_* fields
    const previousYear = currentYear - 1;
    const previousLibraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: previousYear,
      },
    });

    let previousYearTotals = null;
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

      if (previousElectronicData) {
        // Map previous year's GRAND TOTAL (prefer egrand_total_*, fallback to etotal_computer_*)
        previousYearTotals = {
          egrand_total_title_chinese: previousElectronicData.egrand_total_title_chinese ?? previousElectronicData.etotal_computer_title_chinese,
          egrand_total_title_japanese: previousElectronicData.egrand_total_title_japanese ?? previousElectronicData.etotal_computer_title_japanese,
          egrand_total_title_korean: previousElectronicData.egrand_total_title_korean ?? previousElectronicData.etotal_computer_title_korean,
          egrand_total_title_noncjk: previousElectronicData.egrand_total_title_noncjk ?? previousElectronicData.etotal_computer_title_noncjk,
          egrand_total_title_subtotal: previousElectronicData.egrand_total_title_subtotal ?? previousElectronicData.etotal_computer_title_subtotal,
          egrand_total_cd_chinese: previousElectronicData.egrand_total_cd_chinese ?? previousElectronicData.etotal_computer_cd_chinese,
          egrand_total_cd_japanese: previousElectronicData.egrand_total_cd_japanese ?? previousElectronicData.etotal_computer_cd_japanese,
          egrand_total_cd_korean: previousElectronicData.egrand_total_cd_korean ?? previousElectronicData.etotal_computer_cd_korean,
          egrand_total_cd_noncjk: previousElectronicData.egrand_total_cd_noncjk ?? previousElectronicData.etotal_computer_cd_noncjk,
          egrand_total_cd_subtotal: previousElectronicData.egrand_total_cd_subtotal ?? previousElectronicData.etotal_computer_cd_subtotal,
        };
        console.log('[Electronic Create] Previous year GRAND TOTAL fetched:', previousYearTotals);
      }
    }

    // Check if record already exists
    const existingRecord = await db.electronic.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    const electronicData = {
      entryid: entryid || null,
      libraryyear: libraryYear.id,
      eonetime_computer_title_chinese: eonetime_computer_title_chinese || 0,
      eonetime_computer_title_japanese: eonetime_computer_title_japanese || 0,
      eonetime_computer_title_korean: eonetime_computer_title_korean || 0,
      eonetime_computer_title_noncjk: eonetime_computer_title_noncjk || 0,
      eonetime_computer_title_subtotal: eonetime_computer_title_subtotal || 0,
      eonetime_computer_cd_chinese: eonetime_computer_cd_chinese || 0,
      eonetime_computer_cd_japanese: eonetime_computer_cd_japanese || 0,
      eonetime_computer_cd_korean: eonetime_computer_cd_korean || 0,
      eonetime_computer_cd_noncjk: eonetime_computer_cd_noncjk || 0,
      eonetime_computer_cd_subtotal: eonetime_computer_cd_subtotal || 0,
      eaccompanied_computer_title_chinese: eaccompanied_computer_title_chinese || 0,
      eaccompanied_computer_title_japanese: eaccompanied_computer_title_japanese || 0,
      eaccompanied_computer_title_korean: eaccompanied_computer_title_korean || 0,
      eaccompanied_computer_title_noncjk: eaccompanied_computer_title_noncjk || 0,
      eaccompanied_computer_title_subtotal: eaccompanied_computer_title_subtotal || 0,
      eaccompanied_computer_cd_chinese: eaccompanied_computer_cd_chinese || 0,
      eaccompanied_computer_cd_japanese: eaccompanied_computer_cd_japanese || 0,
      eaccompanied_computer_cd_korean: eaccompanied_computer_cd_korean || 0,
      eaccompanied_computer_cd_noncjk: eaccompanied_computer_cd_noncjk || 0,
      eaccompanied_computer_cd_subtotal: eaccompanied_computer_cd_subtotal || 0,
      egift_computer_title_chinese: egift_computer_title_chinese || 0,
      egift_computer_title_japanese: egift_computer_title_japanese || 0,
      egift_computer_title_korean: egift_computer_title_korean || 0,
      egift_computer_title_noncjk: egift_computer_title_noncjk || 0,
      egift_computer_title_subtotal: egift_computer_title_subtotal || 0,
      egift_computer_cd_chinese: egift_computer_cd_chinese || 0,
      egift_computer_cd_japanese: egift_computer_cd_japanese || 0,
      egift_computer_cd_korean: egift_computer_cd_korean || 0,
      egift_computer_cd_noncjk: egift_computer_cd_noncjk || 0,
      egift_computer_cd_subtotal: egift_computer_cd_subtotal || 0,
      eindex_electronic_title_chinese: eindex_electronic_title_chinese || 0,
      eindex_electronic_title_japanese: eindex_electronic_title_japanese || 0,
      eindex_electronic_title_korean: eindex_electronic_title_korean || 0,
      eindex_electronic_title_noncjk: eindex_electronic_title_noncjk || 0,
      eindex_electronic_title_subtotal: eindex_electronic_title_subtotal || 0,
      efulltext_electronic_title_chinese: efulltext_electronic_title_chinese || 0,
      efulltext_electronic_title_japanese: efulltext_electronic_title_japanese || 0,
      efulltext_electronic_title_korean: efulltext_electronic_title_korean || 0,
      efulltext_electronic_title_noncjk: efulltext_electronic_title_noncjk || 0,
      efulltext_electronic_title_subtotal: efulltext_electronic_title_subtotal || 0,
      eonetime_computer_expenditure_chinese: eonetime_computer_expenditure_chinese || 0,
      eonetime_computer_expenditure_japanese: eonetime_computer_expenditure_japanese || 0,
      eonetime_computer_expenditure_korean: eonetime_computer_expenditure_korean || 0,
      eonetime_computer_expenditure_noncjk: eonetime_computer_expenditure_noncjk || 0,
      eindex_electronic_expenditure_chinese: eindex_electronic_expenditure_chinese || 0,
      eindex_electronic_expenditure_japanese: eindex_electronic_expenditure_japanese || 0,
      eindex_electronic_expenditure_korean: eindex_electronic_expenditure_korean || 0,
      eindex_electronic_expenditure_noncjk: eindex_electronic_expenditure_noncjk || 0,
      efulltext_electronic_expenditure_chinese: efulltext_electronic_expenditure_chinese || 0,
      efulltext_electronic_expenditure_japanese: efulltext_electronic_expenditure_japanese || 0,
      efulltext_electronic_expenditure_korean: efulltext_electronic_expenditure_korean || 0,
      efulltext_electronic_expenditure_noncjk: efulltext_electronic_expenditure_noncjk || 0,
      // Section 1.4 totals
      etotal_computer_title_chinese: etotal_computer_title_chinese || 0,
      etotal_computer_title_japanese: etotal_computer_title_japanese || 0,
      etotal_computer_title_korean: etotal_computer_title_korean || 0,
      etotal_computer_title_noncjk: etotal_computer_title_noncjk || 0,
      etotal_computer_title_subtotal: etotal_computer_title_subtotal || 0,
      etotal_computer_cd_chinese: etotal_computer_cd_chinese || 0,
      etotal_computer_cd_japanese: etotal_computer_cd_japanese || 0,
      etotal_computer_cd_korean: etotal_computer_cd_korean || 0,
      etotal_computer_cd_noncjk: etotal_computer_cd_noncjk || 0,
      etotal_computer_cd_subtotal: etotal_computer_cd_subtotal || 0,
      // Section 2.3 totals
      etotal_electronic_title_chinese: etotal_electronic_title_chinese || 0,
      etotal_electronic_title_japanese: etotal_electronic_title_japanese || 0,
      etotal_electronic_title_korean: etotal_electronic_title_korean || 0,
      etotal_electronic_title_noncjk: etotal_electronic_title_noncjk || 0,
      etotal_electronic_title_subtotal: etotal_electronic_title_subtotal || 0,
      // Expenditure grand total
      etotal_expenditure_grandtotal: etotal_expenditure_grandtotal || 0,
      // Memos/comments for each section
      eonetime_computer_memo: eonetime_computer_memo || null,
      eaccompanied_computer_memo: eaccompanied_computer_memo || null,
      egift_computer_memo: egift_computer_memo || null,
      etotal_computer_memo: etotal_computer_memo || null,
      eindex_electronic_memo: eindex_electronic_memo || null,
      efulltext_electronic_memo: efulltext_electronic_memo || null,
      etotal_electronic_memo: etotal_electronic_memo || null,
      etotal_expenditure_memo: etotal_expenditure_memo || null,
      eprevious_memo: eprevious_memo || null,
      enotes: enotes || "",
      // Auto-populate previous year fields from previous year's GRAND TOTAL (section 1.6)
      eprevious_total_title_chinese: previousYearTotals?.egrand_total_title_chinese ?? (existingRecord?.eprevious_total_title_chinese || null),
      eprevious_total_title_japanese: previousYearTotals?.egrand_total_title_japanese ?? (existingRecord?.eprevious_total_title_japanese || null),
      eprevious_total_title_korean: previousYearTotals?.egrand_total_title_korean ?? (existingRecord?.eprevious_total_title_korean || null),
      eprevious_total_title_noncjk: previousYearTotals?.egrand_total_title_noncjk ?? (existingRecord?.eprevious_total_title_noncjk || null),
      eprevious_total_title_subtotal: previousYearTotals?.egrand_total_title_subtotal ?? (existingRecord?.eprevious_total_title_subtotal || null),
      eprevious_total_cd_chinese: previousYearTotals?.egrand_total_cd_chinese ?? (existingRecord?.eprevious_total_cd_chinese || null),
      eprevious_total_cd_japanese: previousYearTotals?.egrand_total_cd_japanese ?? (existingRecord?.eprevious_total_cd_japanese || null),
      eprevious_total_cd_korean: previousYearTotals?.egrand_total_cd_korean ?? (existingRecord?.eprevious_total_cd_korean || null),
      eprevious_total_cd_noncjk: previousYearTotals?.egrand_total_cd_noncjk ?? (existingRecord?.eprevious_total_cd_noncjk || null),
      eprevious_total_cd_subtotal: previousYearTotals?.egrand_total_cd_subtotal ?? (existingRecord?.eprevious_total_cd_subtotal || null),
      // Calculate Section 1.6 Grand Totals (Section 1.4 + Section 1.5)
      egrand_total_title_chinese: (etotal_computer_title_chinese || 0) + (previousYearTotals?.egrand_total_title_chinese ?? (existingRecord?.eprevious_total_title_chinese || 0)),
      egrand_total_title_japanese: (etotal_computer_title_japanese || 0) + (previousYearTotals?.egrand_total_title_japanese ?? (existingRecord?.eprevious_total_title_japanese || 0)),
      egrand_total_title_korean: (etotal_computer_title_korean || 0) + (previousYearTotals?.egrand_total_title_korean ?? (existingRecord?.eprevious_total_title_korean || 0)),
      egrand_total_title_noncjk: (etotal_computer_title_noncjk || 0) + (previousYearTotals?.egrand_total_title_noncjk ?? (existingRecord?.eprevious_total_title_noncjk || 0)),
      egrand_total_title_subtotal: (etotal_computer_title_subtotal || 0) + (previousYearTotals?.egrand_total_title_subtotal ?? (existingRecord?.eprevious_total_title_subtotal || 0)),
      egrand_total_cd_chinese: (etotal_computer_cd_chinese || 0) + (previousYearTotals?.egrand_total_cd_chinese ?? (existingRecord?.eprevious_total_cd_chinese || 0)),
      egrand_total_cd_japanese: (etotal_computer_cd_japanese || 0) + (previousYearTotals?.egrand_total_cd_japanese ?? (existingRecord?.eprevious_total_cd_japanese || 0)),
      egrand_total_cd_korean: (etotal_computer_cd_korean || 0) + (previousYearTotals?.egrand_total_cd_korean ?? (existingRecord?.eprevious_total_cd_korean || 0)),
      egrand_total_cd_noncjk: (etotal_computer_cd_noncjk || 0) + (previousYearTotals?.egrand_total_cd_noncjk ?? (existingRecord?.eprevious_total_cd_noncjk || 0)),
      egrand_total_cd_subtotal: (etotal_computer_cd_subtotal || 0) + (previousYearTotals?.egrand_total_cd_subtotal ?? (existingRecord?.eprevious_total_cd_subtotal || 0)),
    };

    console.log('[Electronic Create] Library ID:', libraryId, 'Year:', currentYear);
    console.log('[Electronic Create] Previous year GRAND TOTAL found:', !!previousYearTotals);
    console.log('[Electronic Create] Section 1.4 (Current year new additions):', {
      title_chinese: etotal_computer_title_chinese,
      cd_chinese: etotal_computer_cd_chinese,
    });
    console.log('[Electronic Create] Section 1.5 (Previous year GRAND TOTAL):', {
      title_chinese: previousYearTotals?.egrand_total_title_chinese || 0,
      cd_chinese: previousYearTotals?.egrand_total_cd_chinese || 0,
    });
    console.log('[Electronic Create] Section 1.6 (Grand Total = 1.4 + 1.5):', {
      title_chinese: electronicData.egrand_total_title_chinese,
      cd_chinese: electronicData.egrand_total_cd_chinese,
      title_subtotal: electronicData.egrand_total_title_subtotal,
      cd_subtotal: electronicData.egrand_total_cd_subtotal,
    });

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.electronic.update({
        where: {
          id: existingRecord.id,
        },
        data: electronicData,
      });
    } else {
      // Create new record
      result = await db.electronic.create({
        data: electronicData,
      });
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? "Electronic data updated successfully" : "Electronic data created successfully",
      data: result,
    });

  } catch (error: any) {
    console.error("API error (electronic create):", error);

    return NextResponse.json(
      { error: "Failed to save electronic data", detail: error?.message },
      { status: 500 }
    );
  }
}
