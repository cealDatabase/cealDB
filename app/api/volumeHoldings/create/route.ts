import { NextResponse } from "next/server";
import db from "@/lib/db";
import { markEntryStatus } from "@/lib/entryStatus";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Volume Holdings API received body:", body);

    const { libid, finalSubmit, ...volumeHoldingsData } = body;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = new Date().getFullYear();

    // Find Library_Year record for current year and library
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: "No library_year record exists for this library and year. Please contact the administrator." },
        { status: 404 }
      );
    }

    if (!libraryYear.is_open_for_editing) {
      return NextResponse.json(
        { error: "Form is not avilable at this time. Please contact the CEAL Statistics Committee Chair for help." },
        { status: 403 }
      );
    }

    // Calculate subtotals
    const vhprevious_year_subtotal = 
      (volumeHoldingsData.vhprevious_year_chinese || 0) +
      (volumeHoldingsData.vhprevious_year_japanese || 0) +
      (volumeHoldingsData.vhprevious_year_korean || 0) +
      (volumeHoldingsData.vhprevious_year_noncjk || 0);

    const vhadded_gross_subtotal = 
      (volumeHoldingsData.vhadded_gross_chinese || 0) +
      (volumeHoldingsData.vhadded_gross_japanese || 0) +
      (volumeHoldingsData.vhadded_gross_korean || 0) +
      (volumeHoldingsData.vhadded_gross_noncjk || 0);

    const vhwithdrawn_subtotal = 
      (volumeHoldingsData.vhwithdrawn_chinese || 0) +
      (volumeHoldingsData.vhwithdrawn_japanese || 0) +
      (volumeHoldingsData.vhwithdrawn_korean || 0) +
      (volumeHoldingsData.vhwithdrawn_noncjk || 0);

    const vh_film_subtotal = 
      (volumeHoldingsData.vh_film_chinese || 0) +
      (volumeHoldingsData.vh_film_japanese || 0) +
      (volumeHoldingsData.vh_film_korean || 0);

    const vh_fiche_subtotal = 
      (volumeHoldingsData.vh_fiche_chinese || 0) +
      (volumeHoldingsData.vh_fiche_japanese || 0) +
      (volumeHoldingsData.vh_fiche_korean || 0);

    const vh_film_fiche_subtotal = 
      (volumeHoldingsData.vh_film_fiche_chinese || 0) +
      (volumeHoldingsData.vh_film_fiche_japanese || 0) +
      (volumeHoldingsData.vh_film_fiche_korean || 0);

    const vhgrandtotal = vhprevious_year_subtotal + vhadded_gross_subtotal - vhwithdrawn_subtotal;

    // Fetch Electronic Books Purchased Volume Total from Form 10
    let ebooksPurchasedVolumeTotal = 0;
    try {
      const electronicBooksData = await db.electronic_Books.findFirst({
        where: {
          libraryyear: libraryYear.id,
        },
        select: {
          ebooks_purchased_volumes_subtotal: true,
        }
      });

      if (electronicBooksData?.ebooks_purchased_volumes_subtotal) {
        ebooksPurchasedVolumeTotal = electronicBooksData.ebooks_purchased_volumes_subtotal;
      }
    } catch (error) {
      console.log('Error fetching Electronic Books data for Volume Holdings:', error);
      // Continue with 0 if there's an error
    }

    // Calculate overall grand total: Physical Grand Total + Electronic Books Purchased Volume Total
    const vhoverall_grand_total = vhgrandtotal + ebooksPurchasedVolumeTotal;

    // Prepare data for upsert
    const dataToUpsert = {
      ...volumeHoldingsData,
      vhprevious_year_subtotal,
      vhadded_gross_subtotal,
      vhwithdrawn_subtotal,
      vh_film_subtotal,
      vh_fiche_subtotal,
      vh_film_fiche_subtotal,
      vhgrandtotal,
      vhebooks_purchased_volume_total: ebooksPurchasedVolumeTotal,
      vhoverall_grand_total,
      libraryyear: libraryYear.id,
    };

    console.log("Data to upsert for Volume Holdings:", dataToUpsert);

    // Upsert Volume_Holdings record
    const volumeHoldings = await db.volume_Holdings.upsert({
      where: {
        libraryyear: libraryYear.id,
      },
      update: dataToUpsert,
      create: dataToUpsert,
    });

    console.log("Volume Holdings upsert result:", volumeHoldings);

    if (finalSubmit) {
      await markEntryStatus(libraryYear.id, 'volumeHoldings');
    }

    return NextResponse.json({
      success: true,
      message: "Volume holdings data saved successfully",
      data: volumeHoldings,
    });

  } catch (error: any) {
    console.error("API error (volume holdings create):", error);

    return NextResponse.json(
      { error: "Failed to save volume holdings data", detail: error?.message },
      { status: 500 }
    );
  }
}
