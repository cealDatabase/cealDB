// /app/api/electronic-books/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id, // Extract id but don't use it
      entryid,
      libid,
      ebpurchased_title_chinese,
      ebpurchased_title_japanese,
      ebpurchased_title_korean,
      ebpurchased_title_noncjk,
      ebpurchased_title_subtotal,
      ebpurchased_volume_chinese,
      ebpurchased_volume_japanese,
      ebpurchased_volume_korean,
      ebpurchased_volume_noncjk,
      ebpurchased_volume_subtotal,
      ebnonpurchased_title_chinese,
      ebnonpurchased_title_japanese,
      ebnonpurchased_title_korean,
      ebnonpurchased_title_noncjk,
      ebnonpurchased_title_subtotal,
      ebnonpurchased_volume_chinese,
      ebnonpurchased_volume_japanese,
      ebnonpurchased_volume_korean,
      ebnonpurchased_volume_noncjk,
      ebnonpurchased_volume_subtotal,
      ebsubscription_title_chinese,
      ebsubscription_title_japanese,
      ebsubscription_title_korean,
      ebsubscription_title_noncjk,
      ebsubscription_title_subtotal,
      ebsubscription_volume_chinese,
      ebsubscription_volume_japanese,
      ebsubscription_volume_korean,
      ebsubscription_volume_noncjk,
      ebsubscription_volume_subtotal,
      ebpurchased_expenditure_chinese,
      ebpurchased_expenditure_japanese,
      ebpurchased_expenditure_korean,
      ebpurchased_expenditure_noncjk,
      ebsubscription_expenditure_chinese,
      ebsubscription_expenditure_japanese,
      ebsubscription_expenditure_korean,
      ebsubscription_expenditure_noncjk,
      ebnotes,
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
    const existingRecord = await db.electronic_Books.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    const electronicBooksData = {
      entryid: entryid || null,
      libraryyear: libraryYear.id,
      ebpurchased_title_chinese: ebpurchased_title_chinese || 0,
      ebpurchased_title_japanese: ebpurchased_title_japanese || 0,
      ebpurchased_title_korean: ebpurchased_title_korean || 0,
      ebpurchased_title_noncjk: ebpurchased_title_noncjk || 0,
      ebpurchased_title_subtotal: ebpurchased_title_subtotal || 0,
      ebpurchased_volume_chinese: ebpurchased_volume_chinese || 0,
      ebpurchased_volume_japanese: ebpurchased_volume_japanese || 0,
      ebpurchased_volume_korean: ebpurchased_volume_korean || 0,
      ebpurchased_volume_noncjk: ebpurchased_volume_noncjk || 0,
      ebpurchased_volume_subtotal: ebpurchased_volume_subtotal || 0,
      ebnonpurchased_title_chinese: ebnonpurchased_title_chinese || 0,
      ebnonpurchased_title_japanese: ebnonpurchased_title_japanese || 0,
      ebnonpurchased_title_korean: ebnonpurchased_title_korean || 0,
      ebnonpurchased_title_noncjk: ebnonpurchased_title_noncjk || 0,
      ebnonpurchased_title_subtotal: ebnonpurchased_title_subtotal || 0,
      ebnonpurchased_volume_chinese: ebnonpurchased_volume_chinese || 0,
      ebnonpurchased_volume_japanese: ebnonpurchased_volume_japanese || 0,
      ebnonpurchased_volume_korean: ebnonpurchased_volume_korean || 0,
      ebnonpurchased_volume_noncjk: ebnonpurchased_volume_noncjk || 0,
      ebnonpurchased_volume_subtotal: ebnonpurchased_volume_subtotal || 0,
      ebsubscription_title_chinese: ebsubscription_title_chinese || 0,
      ebsubscription_title_japanese: ebsubscription_title_japanese || 0,
      ebsubscription_title_korean: ebsubscription_title_korean || 0,
      ebsubscription_title_noncjk: ebsubscription_title_noncjk || 0,
      ebsubscription_title_subtotal: ebsubscription_title_subtotal || 0,
      ebsubscription_volume_chinese: ebsubscription_volume_chinese || 0,
      ebsubscription_volume_japanese: ebsubscription_volume_japanese || 0,
      ebsubscription_volume_korean: ebsubscription_volume_korean || 0,
      ebsubscription_volume_noncjk: ebsubscription_volume_noncjk || 0,
      ebsubscription_volume_subtotal: ebsubscription_volume_subtotal || 0,
      ebpurchased_expenditure_chinese: ebpurchased_expenditure_chinese || 0,
      ebpurchased_expenditure_japanese: ebpurchased_expenditure_japanese || 0,
      ebpurchased_expenditure_korean: ebpurchased_expenditure_korean || 0,
      ebpurchased_expenditure_noncjk: ebpurchased_expenditure_noncjk || 0,
      ebsubscription_expenditure_chinese: ebsubscription_expenditure_chinese || 0,
      ebsubscription_expenditure_japanese: ebsubscription_expenditure_japanese || 0,
      ebsubscription_expenditure_korean: ebsubscription_expenditure_korean || 0,
      ebsubscription_expenditure_noncjk: ebsubscription_expenditure_noncjk || 0,
      ebnotes: ebnotes || "",
    };

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
