// /app/api/monographic/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Creating Monographic record with body:", body);

    const {
      entryid,
      mapurchased_titles_chinese,
      mapurchased_titles_japanese,
      mapurchased_titles_korean,
      mapurchased_titles_noncjk,
      mapurchased_titles_subtotal,
      mapurchased_volumes_chinese,
      mapurchased_volumes_japanese,
      mapurchased_volumes_korean,
      mapurchased_volumes_noncjk,
      mapurchased_volumes_subtotal,
      manonpurchased_titles_chinese,
      manonpurchased_titles_japanese,
      manonpurchased_titles_korean,
      manonpurchased_titles_noncjk,
      manonpurchased_titles_subtotal,
      manonpurchased_volumes_chinese,
      manonpurchased_volumes_japanese,
      manonpurchased_volumes_korean,
      manonpurchased_volumes_noncjk,
      manonpurchased_volumes_subtotal,
      matotal_titles,
      matotal_volumes,
      manotes,
      libid, // library ID from URL params
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

    console.log(`Looking for Library_Year with library: ${libraryId}, year: ${currentYear}`);

    // Find Library_Year record for current year and library
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    console.log("Found Library_Year:", libraryYear);

    if (!libraryYear) {
      console.log("No Library_Year record found");
      return NextResponse.json(
        { 
          error: "Library year record not found", 
          message: "No library_year record exists for this library and year. Please contact the administrator to set up the library year record." 
        },
        { status: 404 }
      );
    }

    console.log(`Library_Year ID: ${libraryYear.id}, is_open_for_editing: ${libraryYear.is_open_for_editing}`);

    // Check if editing is allowed
    if (!libraryYear.is_open_for_editing) {
      console.log("Form is not avilable at this time");
      return NextResponse.json(
        { 
          error: "Form submission not allowed", 
          message: "This Form is not avilable at this time. Please contact the CEAL Statistics Committee Chair for help." 
        },
        { status: 403 }
      );
    }

    console.log("Processing monographic record with Library_Year ID:", libraryYear.id);

    // Use upsert to handle both create and update scenarios while preserving original ID
    const monographicRecord = await db.monographic_Acquisitions.upsert({
      where: { libraryyear: libraryYear.id },
      update: {
        entryid: entryid || null,
        mapurchased_titles_chinese: mapurchased_titles_chinese !== undefined ? Number(mapurchased_titles_chinese) : null,
        mapurchased_titles_japanese: mapurchased_titles_japanese !== undefined ? Number(mapurchased_titles_japanese) : null,
        mapurchased_titles_korean: mapurchased_titles_korean !== undefined ? Number(mapurchased_titles_korean) : null,
        mapurchased_titles_noncjk: mapurchased_titles_noncjk !== undefined ? Number(mapurchased_titles_noncjk) : null,
        mapurchased_titles_subtotal: mapurchased_titles_subtotal !== undefined ? Number(mapurchased_titles_subtotal) : null,
        mapurchased_volumes_chinese: mapurchased_volumes_chinese !== undefined ? Number(mapurchased_volumes_chinese) : null,
        mapurchased_volumes_japanese: mapurchased_volumes_japanese !== undefined ? Number(mapurchased_volumes_japanese) : null,
        mapurchased_volumes_korean: mapurchased_volumes_korean !== undefined ? Number(mapurchased_volumes_korean) : null,
        mapurchased_volumes_noncjk: mapurchased_volumes_noncjk !== undefined ? Number(mapurchased_volumes_noncjk) : null,
        mapurchased_volumes_subtotal: mapurchased_volumes_subtotal !== undefined ? Number(mapurchased_volumes_subtotal) : null,
        manonpurchased_titles_chinese: manonpurchased_titles_chinese !== undefined ? Number(manonpurchased_titles_chinese) : null,
        manonpurchased_titles_japanese: manonpurchased_titles_japanese !== undefined ? Number(manonpurchased_titles_japanese) : null,
        manonpurchased_titles_korean: manonpurchased_titles_korean !== undefined ? Number(manonpurchased_titles_korean) : null,
        manonpurchased_titles_noncjk: manonpurchased_titles_noncjk !== undefined ? Number(manonpurchased_titles_noncjk) : null,
        manonpurchased_titles_subtotal: manonpurchased_titles_subtotal !== undefined ? Number(manonpurchased_titles_subtotal) : null,
        manonpurchased_volumes_chinese: manonpurchased_volumes_chinese !== undefined ? Number(manonpurchased_volumes_chinese) : null,
        manonpurchased_volumes_japanese: manonpurchased_volumes_japanese !== undefined ? Number(manonpurchased_volumes_japanese) : null,
        manonpurchased_volumes_korean: manonpurchased_volumes_korean !== undefined ? Number(manonpurchased_volumes_korean) : null,
        manonpurchased_volumes_noncjk: manonpurchased_volumes_noncjk !== undefined ? Number(manonpurchased_volumes_noncjk) : null,
        manonpurchased_volumes_subtotal: manonpurchased_volumes_subtotal !== undefined ? Number(manonpurchased_volumes_subtotal) : null,
        matotal_titles: matotal_titles !== undefined ? Number(matotal_titles) : null,
        matotal_volumes: matotal_volumes !== undefined ? Number(matotal_volumes) : null,
        manotes: manotes || null,
      },
      create: {
        entryid: entryid || null,
        mapurchased_titles_chinese: mapurchased_titles_chinese !== undefined ? Number(mapurchased_titles_chinese) : null,
        mapurchased_titles_japanese: mapurchased_titles_japanese !== undefined ? Number(mapurchased_titles_japanese) : null,
        mapurchased_titles_korean: mapurchased_titles_korean !== undefined ? Number(mapurchased_titles_korean) : null,
        mapurchased_titles_noncjk: mapurchased_titles_noncjk !== undefined ? Number(mapurchased_titles_noncjk) : null,
        mapurchased_titles_subtotal: mapurchased_titles_subtotal !== undefined ? Number(mapurchased_titles_subtotal) : null,
        mapurchased_volumes_chinese: mapurchased_volumes_chinese !== undefined ? Number(mapurchased_volumes_chinese) : null,
        mapurchased_volumes_japanese: mapurchased_volumes_japanese !== undefined ? Number(mapurchased_volumes_japanese) : null,
        mapurchased_volumes_korean: mapurchased_volumes_korean !== undefined ? Number(mapurchased_volumes_korean) : null,
        mapurchased_volumes_noncjk: mapurchased_volumes_noncjk !== undefined ? Number(mapurchased_volumes_noncjk) : null,
        mapurchased_volumes_subtotal: mapurchased_volumes_subtotal !== undefined ? Number(mapurchased_volumes_subtotal) : null,
        manonpurchased_titles_chinese: manonpurchased_titles_chinese !== undefined ? Number(manonpurchased_titles_chinese) : null,
        manonpurchased_titles_japanese: manonpurchased_titles_japanese !== undefined ? Number(manonpurchased_titles_japanese) : null,
        manonpurchased_titles_korean: manonpurchased_titles_korean !== undefined ? Number(manonpurchased_titles_korean) : null,
        manonpurchased_titles_noncjk: manonpurchased_titles_noncjk !== undefined ? Number(manonpurchased_titles_noncjk) : null,
        manonpurchased_titles_subtotal: manonpurchased_titles_subtotal !== undefined ? Number(manonpurchased_titles_subtotal) : null,
        manonpurchased_volumes_chinese: manonpurchased_volumes_chinese !== undefined ? Number(manonpurchased_volumes_chinese) : null,
        manonpurchased_volumes_japanese: manonpurchased_volumes_japanese !== undefined ? Number(manonpurchased_volumes_japanese) : null,
        manonpurchased_volumes_korean: manonpurchased_volumes_korean !== undefined ? Number(manonpurchased_volumes_korean) : null,
        manonpurchased_volumes_noncjk: manonpurchased_volumes_noncjk !== undefined ? Number(manonpurchased_volumes_noncjk) : null,
        manonpurchased_volumes_subtotal: manonpurchased_volumes_subtotal !== undefined ? Number(manonpurchased_volumes_subtotal) : null,
        matotal_titles: matotal_titles !== undefined ? Number(matotal_titles) : null,
        matotal_volumes: matotal_volumes !== undefined ? Number(matotal_volumes) : null,
        manotes: manotes || null,
        libraryyear: libraryYear.id,
      },
    });

    console.log("Successfully processed monographic record with ID:", monographicRecord.id);

    // Update Library_Year is_active to true after successful form submission
    await db.library_Year.update({
      where: { id: libraryYear.id },
      data: { is_active: true },
    });

    console.log(`Updated Library_Year ${libraryYear.id} is_active to true`);

    return NextResponse.json({ 
      success: true, 
      data: monographicRecord,
      message: "Monographic acquisitions record processed successfully"
    });
  } catch (error: any) {
    console.error("API error (create monographic):", error);

    return NextResponse.json(
      { error: "Failed to create monographic record", detail: error?.message },
      { status: 500 }
    );
  }
}
