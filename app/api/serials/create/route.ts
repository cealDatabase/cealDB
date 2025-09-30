// /app/api/serials/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Creating Serials record with body:", body);

    const {
      entryid,
      // Purchased Serials (Print)
      spurchased_chinese,
      spurchased_japanese,
      spurchased_korean,
      spurchased_noncjk,
      spurchased_subtotal,
      // Non-Purchased Serials (Print)
      snonpurchased_chinese,
      snonpurchased_japanese,
      snonpurchased_korean,
      snonpurchased_noncjk,
      snonpurchased_subtotal,
      // Electronic Purchased
      s_epurchased_chinese,
      s_epurchased_japanese,
      s_epurchased_korean,
      s_epurchased_noncjk,
      s_epurchased_subtotal,
      // Electronic Non-Purchased
      s_enonpurchased_chinese,
      s_enonpurchased_japanese,
      s_enonpurchased_korean,
      s_enonpurchased_noncjk,
      s_enonpurchased_subtotal,
      // Electronic Totals by Language
      s_etotal_chinese,
      s_etotal_japanese,
      s_etotal_korean,
      s_etotal_noncjk,
      // Print Totals by Language
      stotal_chinese,
      stotal_japanese,
      stotal_korean,
      stotal_noncjk,
      // Grand totals
      sgrandtotal,
      s_egrandtotal,
      snotes,
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

    console.log("Processing serials record with Library_Year ID:", libraryYear.id);

    // Use upsert to handle both create and update scenarios while preserving original ID
    const serialsRecord = await db.serials.upsert({
      where: { libraryyear: libraryYear.id },
      update: {
        entryid: entryid || null,
        // Purchased Serials (Print)
        spurchased_chinese: spurchased_chinese !== undefined ? Number(spurchased_chinese) : null,
        spurchased_japanese: spurchased_japanese !== undefined ? Number(spurchased_japanese) : null,
        spurchased_korean: spurchased_korean !== undefined ? Number(spurchased_korean) : null,
        spurchased_noncjk: spurchased_noncjk !== undefined ? Number(spurchased_noncjk) : null,
        spurchased_subtotal: spurchased_subtotal !== undefined ? Number(spurchased_subtotal) : null,
        // Non-Purchased Serials (Print)
        snonpurchased_chinese: snonpurchased_chinese !== undefined ? Number(snonpurchased_chinese) : null,
        snonpurchased_japanese: snonpurchased_japanese !== undefined ? Number(snonpurchased_japanese) : null,
        snonpurchased_korean: snonpurchased_korean !== undefined ? Number(snonpurchased_korean) : null,
        snonpurchased_noncjk: snonpurchased_noncjk !== undefined ? Number(snonpurchased_noncjk) : null,
        snonpurchased_subtotal: snonpurchased_subtotal !== undefined ? Number(snonpurchased_subtotal) : null,
        // Electronic Purchased
        s_epurchased_chinese: s_epurchased_chinese !== undefined ? Number(s_epurchased_chinese) : null,
        s_epurchased_japanese: s_epurchased_japanese !== undefined ? Number(s_epurchased_japanese) : null,
        s_epurchased_korean: s_epurchased_korean !== undefined ? Number(s_epurchased_korean) : null,
        s_epurchased_noncjk: s_epurchased_noncjk !== undefined ? Number(s_epurchased_noncjk) : null,
        s_epurchased_subtotal: s_epurchased_subtotal !== undefined ? Number(s_epurchased_subtotal) : null,
        // Electronic Non-Purchased
        s_enonpurchased_chinese: s_enonpurchased_chinese !== undefined ? Number(s_enonpurchased_chinese) : null,
        s_enonpurchased_japanese: s_enonpurchased_japanese !== undefined ? Number(s_enonpurchased_japanese) : null,
        s_enonpurchased_korean: s_enonpurchased_korean !== undefined ? Number(s_enonpurchased_korean) : null,
        s_enonpurchased_noncjk: s_enonpurchased_noncjk !== undefined ? Number(s_enonpurchased_noncjk) : null,
        s_enonpurchased_subtotal: s_enonpurchased_subtotal !== undefined ? Number(s_enonpurchased_subtotal) : null,
        // Electronic Totals by Language
        s_etotal_chinese: s_etotal_chinese !== undefined ? Number(s_etotal_chinese) : null,
        s_etotal_japanese: s_etotal_japanese !== undefined ? Number(s_etotal_japanese) : null,
        s_etotal_korean: s_etotal_korean !== undefined ? Number(s_etotal_korean) : null,
        s_etotal_noncjk: s_etotal_noncjk !== undefined ? Number(s_etotal_noncjk) : null,
        // Print Totals by Language
        stotal_chinese: stotal_chinese !== undefined ? Number(stotal_chinese) : null,
        stotal_japanese: stotal_japanese !== undefined ? Number(stotal_japanese) : null,
        stotal_korean: stotal_korean !== undefined ? Number(stotal_korean) : null,
        stotal_noncjk: stotal_noncjk !== undefined ? Number(stotal_noncjk) : null,
        // Grand totals
        sgrandtotal: sgrandtotal !== undefined ? Number(sgrandtotal) : null,
        s_egrandtotal: s_egrandtotal !== undefined ? Number(s_egrandtotal) : null,
        snotes: snotes || null,
      },
      create: {
        entryid: entryid || null,
        // Purchased Serials (Print)
        spurchased_chinese: spurchased_chinese !== undefined ? Number(spurchased_chinese) : null,
        spurchased_japanese: spurchased_japanese !== undefined ? Number(spurchased_japanese) : null,
        spurchased_korean: spurchased_korean !== undefined ? Number(spurchased_korean) : null,
        spurchased_noncjk: spurchased_noncjk !== undefined ? Number(spurchased_noncjk) : null,
        spurchased_subtotal: spurchased_subtotal !== undefined ? Number(spurchased_subtotal) : null,
        // Non-Purchased Serials (Print)
        snonpurchased_chinese: snonpurchased_chinese !== undefined ? Number(snonpurchased_chinese) : null,
        snonpurchased_japanese: snonpurchased_japanese !== undefined ? Number(snonpurchased_japanese) : null,
        snonpurchased_korean: snonpurchased_korean !== undefined ? Number(snonpurchased_korean) : null,
        snonpurchased_noncjk: snonpurchased_noncjk !== undefined ? Number(snonpurchased_noncjk) : null,
        snonpurchased_subtotal: snonpurchased_subtotal !== undefined ? Number(snonpurchased_subtotal) : null,
        // Electronic Purchased
        s_epurchased_chinese: s_epurchased_chinese !== undefined ? Number(s_epurchased_chinese) : null,
        s_epurchased_japanese: s_epurchased_japanese !== undefined ? Number(s_epurchased_japanese) : null,
        s_epurchased_korean: s_epurchased_korean !== undefined ? Number(s_epurchased_korean) : null,
        s_epurchased_noncjk: s_epurchased_noncjk !== undefined ? Number(s_epurchased_noncjk) : null,
        s_epurchased_subtotal: s_epurchased_subtotal !== undefined ? Number(s_epurchased_subtotal) : null,
        // Electronic Non-Purchased
        s_enonpurchased_chinese: s_enonpurchased_chinese !== undefined ? Number(s_enonpurchased_chinese) : null,
        s_enonpurchased_japanese: s_enonpurchased_japanese !== undefined ? Number(s_enonpurchased_japanese) : null,
        s_enonpurchased_korean: s_enonpurchased_korean !== undefined ? Number(s_enonpurchased_korean) : null,
        s_enonpurchased_noncjk: s_enonpurchased_noncjk !== undefined ? Number(s_enonpurchased_noncjk) : null,
        s_enonpurchased_subtotal: s_enonpurchased_subtotal !== undefined ? Number(s_enonpurchased_subtotal) : null,
        // Electronic Totals by Language
        s_etotal_chinese: s_etotal_chinese !== undefined ? Number(s_etotal_chinese) : null,
        s_etotal_japanese: s_etotal_japanese !== undefined ? Number(s_etotal_japanese) : null,
        s_etotal_korean: s_etotal_korean !== undefined ? Number(s_etotal_korean) : null,
        s_etotal_noncjk: s_etotal_noncjk !== undefined ? Number(s_etotal_noncjk) : null,
        // Print Totals by Language
        stotal_chinese: stotal_chinese !== undefined ? Number(stotal_chinese) : null,
        stotal_japanese: stotal_japanese !== undefined ? Number(stotal_japanese) : null,
        stotal_korean: stotal_korean !== undefined ? Number(stotal_korean) : null,
        stotal_noncjk: stotal_noncjk !== undefined ? Number(stotal_noncjk) : null,
        // Grand totals
        sgrandtotal: sgrandtotal !== undefined ? Number(sgrandtotal) : null,
        s_egrandtotal: s_egrandtotal !== undefined ? Number(s_egrandtotal) : null,
        snotes: snotes || null,
        libraryyear: libraryYear.id,
      },
    });

    console.log("Successfully processed serials record with ID:", serialsRecord.id);

    // Update Library_Year is_active to true after successful form submission
    await db.library_Year.update({
      where: { id: libraryYear.id },
      data: { is_active: true },
    });

    console.log(`Updated Library_Year ${libraryYear.id} is_active to true`);

    return NextResponse.json({ 
      success: true, 
      data: serialsRecord,
      message: "Serials record processed successfully"
    });
  } catch (error: any) {
    console.error("API error (create serials):", error);

    return NextResponse.json(
      { error: "Failed to create serials record", detail: error?.message },
      { status: 500 }
    );
  }
}
