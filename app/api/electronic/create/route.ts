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
      enotes: enotes || "",
    };

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
