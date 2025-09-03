// /app/api/public-services/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id, // Extract id but don't use it
      entryid,
      libid,
      pspresentations_chinese,
      pspresentations_japanese,
      pspresentations_korean,
      pspresentations_eastasian,
      pspresentation_participants_chinese,
      pspresentation_participants_japanese,
      pspresentation_participants_korean,
      pspresentation_participants_eastasian,
      psreference_transactions_chinese,
      psreference_transactions_japanese,
      psreference_transactions_korean,
      psreference_transactions_eastasian,
      pstotal_circulations_chinese,
      pstotal_circulations_japanese,
      pstotal_circulations_korean,
      pstotal_circulations_eastasian,
      pslending_requests_filled_chinese,
      pslending_requests_filled_japanese,
      pslending_requests_filled_korean,
      pslending_requests_filled_eastasian,
      pslending_requests_unfilled_chinese,
      pslending_requests_unfilled_japanese,
      pslending_requests_unfilled_korean,
      pslending_requests_unfilled_eastasian,
      psborrowing_requests_filled_chinese,
      psborrowing_requests_filled_japanese,
      psborrowing_requests_filled_korean,
      psborrowing_requests_filled_eastasian,
      psborrowing_requests_unfilled_chinese,
      psborrowing_requests_unfilled_japanese,
      psborrowing_requests_unfilled_korean,
      psborrowing_requests_unfilled_eastasian,
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
    const existingRecord = await db.public_Services.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    const publicServicesData = {
      entryid: entryid || null,
      libraryyear: libraryYear.id,
      pspresentations_chinese: pspresentations_chinese || 0,
      pspresentations_japanese: pspresentations_japanese || 0,
      pspresentations_korean: pspresentations_korean || 0,
      pspresentations_eastasian: pspresentations_eastasian || 0,
      pspresentations_subtotal: pspresentations_subtotal || 0,
      pspresentation_participants_chinese: pspresentation_participants_chinese || 0,
      pspresentation_participants_japanese: pspresentation_participants_japanese || 0,
      pspresentation_participants_korean: pspresentation_participants_korean || 0,
      pspresentation_participants_eastasian: pspresentation_participants_eastasian || 0,
      pspresentation_participants_subtotal: pspresentation_participants_subtotal || 0,
      psreference_transactions_chinese: psreference_transactions_chinese || 0,
      psreference_transactions_japanese: psreference_transactions_japanese || 0,
      psreference_transactions_korean: psreference_transactions_korean || 0,
      psreference_transactions_eastasian: psreference_transactions_eastasian || 0,
      psreference_transactions_subtotal: psreference_transactions_subtotal || 0,
      pstotal_circulations_chinese: pstotal_circulations_chinese || 0,
      pstotal_circulations_japanese: pstotal_circulations_japanese || 0,
      pstotal_circulations_korean: pstotal_circulations_korean || 0,
      pstotal_circulations_eastasian: pstotal_circulations_eastasian || 0,
      pstotal_circulations_subtotal: pstotal_circulations_subtotal || 0,
      pslending_requests_filled_chinese: pslending_requests_filled_chinese || 0,
      pslending_requests_filled_japanese: pslending_requests_filled_japanese || 0,
      pslending_requests_filled_korean: pslending_requests_filled_korean || 0,
      pslending_requests_filled_eastasian: pslending_requests_filled_eastasian || 0,
      pslending_requests_filled_subtotal: pslending_requests_filled_subtotal || 0,
      pslending_requests_unfilled_chinese: pslending_requests_unfilled_chinese || 0,
      pslending_requests_unfilled_japanese: pslending_requests_unfilled_japanese || 0,
      pslending_requests_unfilled_korean: pslending_requests_unfilled_korean || 0,
      pslending_requests_unfilled_eastasian: pslending_requests_unfilled_eastasian || 0,
      pslending_requests_unfilled_subtotal: pslending_requests_unfilled_subtotal || 0,
      psborrowing_requests_filled_chinese: psborrowing_requests_filled_chinese || 0,
      psborrowing_requests_filled_japanese: psborrowing_requests_filled_japanese || 0,
      psborrowing_requests_filled_korean: psborrowing_requests_filled_korean || 0,
      psborrowing_requests_filled_eastasian: psborrowing_requests_filled_eastasian || 0,
      psborrowing_requests_filled_subtotal: psborrowing_requests_filled_subtotal || 0,
      psborrowing_requests_unfilled_chinese: psborrowing_requests_unfilled_chinese || 0,
      psborrowing_requests_unfilled_japanese: psborrowing_requests_unfilled_japanese || 0,
      psborrowing_requests_unfilled_korean: psborrowing_requests_unfilled_korean || 0,
      psborrowing_requests_unfilled_eastasian: psborrowing_requests_unfilled_eastasian || 0,
      psborrowing_requests_unfilled_subtotal: psborrowing_requests_unfilled_subtotal || 0,
      psnotes: psnotes || "",
    };

    let result;
    if (existingRecord) {
      // Update existing record
      result = await db.public_Services.update({
        where: {
          id: existingRecord.id,
        },
        data: publicServicesData,
      });
    } else {
      // Create new record
      result = await db.public_Services.create({
        data: publicServicesData,
      });
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
