// /app/api/electronic-books/status/[libid]/route.ts
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

    // Check if electronic books data exists for current year
    const existingData = await db.electronic_Books.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    // console.log(`[E-Books Status] Library ID: ${libid}, Current Year: ${currentYear}`);

    // Extract previous year's data - try current record's ebooks_purchased_prev_* fields first
    let previousYearData = null;
    
    if (existingData && existingData.ebooks_purchased_prev_titles_chinese !== null) {
      // Previous year data already stored in current record
      console.log('[E-Books Status] Found ebooks_purchased_prev_* fields in current record');
      previousYearData = {
        ebooks_purchased_prev_titles_chinese: existingData.ebooks_purchased_prev_titles_chinese,
        ebooks_purchased_prev_titles_japanese: existingData.ebooks_purchased_prev_titles_japanese,
        ebooks_purchased_prev_titles_korean: existingData.ebooks_purchased_prev_titles_korean,
        ebooks_purchased_prev_titles_noncjk: existingData.ebooks_purchased_prev_titles_noncjk,
        ebooks_purchased_prev_volumes_chinese: existingData.ebooks_purchased_prev_volumes_chinese,
        ebooks_purchased_prev_volumes_japanese: existingData.ebooks_purchased_prev_volumes_japanese,
        ebooks_purchased_prev_volumes_korean: existingData.ebooks_purchased_prev_volumes_korean,
        ebooks_purchased_prev_volumes_noncjk: existingData.ebooks_purchased_prev_volumes_noncjk,
      };
    } else {
      // Fetch from actual previous year's record
      // console.log('[E-Books Status] ebooks_purchased_prev_* fields not found, fetching from actual previous year');
      const previousYear = currentYear - 1;
      const previousLibraryYear = await db.library_Year.findFirst({
        where: {
          library: libid,
          year: previousYear,
        },
      });

      if (previousLibraryYear) {
        const previousEBooksData = await db.electronic_Books.findFirst({
          where: {
            libraryyear: previousLibraryYear.id,
          },
        });

        if (previousEBooksData) {
          
          // Calculate previous year's TOTAL (if ebooks_purchased_titles_* is null, calculate from prev + add)
          const prevTitlesChinese = previousEBooksData.ebooks_purchased_titles_chinese ?? 
            ((previousEBooksData.ebooks_purchased_prev_titles_chinese ?? 0) + (previousEBooksData.ebooks_purchased_add_titles_chinese ?? 0));
          const prevTitlesJapanese = previousEBooksData.ebooks_purchased_titles_japanese ?? 
            ((previousEBooksData.ebooks_purchased_prev_titles_japanese ?? 0) + (previousEBooksData.ebooks_purchased_add_titles_japanese ?? 0));
          const prevTitlesKorean = previousEBooksData.ebooks_purchased_titles_korean ?? 
            ((previousEBooksData.ebooks_purchased_prev_titles_korean ?? 0) + (previousEBooksData.ebooks_purchased_add_titles_korean ?? 0));
          const prevTitlesNoncjk = previousEBooksData.ebooks_purchased_titles_noncjk ?? 
            ((previousEBooksData.ebooks_purchased_prev_titles_noncjk ?? 0) + (previousEBooksData.ebooks_purchased_add_titles_noncjk ?? 0));
          
          const prevVolumesChinese = previousEBooksData.ebooks_purchased_volumes_chinese ?? 
            ((previousEBooksData.ebooks_purchased_prev_volumes_chinese ?? 0) + (previousEBooksData.ebooks_purchased_add_volumes_chinese ?? 0));
          const prevVolumesJapanese = previousEBooksData.ebooks_purchased_volumes_japanese ?? 
            ((previousEBooksData.ebooks_purchased_prev_volumes_japanese ?? 0) + (previousEBooksData.ebooks_purchased_add_volumes_japanese ?? 0));
          const prevVolumesKorean = previousEBooksData.ebooks_purchased_volumes_korean ?? 
            ((previousEBooksData.ebooks_purchased_prev_volumes_korean ?? 0) + (previousEBooksData.ebooks_purchased_add_volumes_korean ?? 0));
          const prevVolumesNoncjk = previousEBooksData.ebooks_purchased_volumes_noncjk ?? 
            ((previousEBooksData.ebooks_purchased_prev_volumes_noncjk ?? 0) + (previousEBooksData.ebooks_purchased_add_volumes_noncjk ?? 0));
          
          // Map previous year's TOTAL purchased (titles and volumes) to prev_* fields
          previousYearData = {
            ebooks_purchased_prev_titles_chinese: prevTitlesChinese,
            ebooks_purchased_prev_titles_japanese: prevTitlesJapanese,
            ebooks_purchased_prev_titles_korean: prevTitlesKorean,
            ebooks_purchased_prev_titles_noncjk: prevTitlesNoncjk,
            ebooks_purchased_prev_volumes_chinese: prevVolumesChinese,
            ebooks_purchased_prev_volumes_japanese: prevVolumesJapanese,
            ebooks_purchased_prev_volumes_korean: prevVolumesKorean,
            ebooks_purchased_prev_volumes_noncjk: prevVolumesNoncjk,
          };
        } else {
          // console.log('[E-Books Status] No E-Books data found for previous year');
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
    console.error("API error (electronic books status by libid):", error);
    return NextResponse.json(
      { error: "Failed to fetch electronic books status", detail: error?.message },
      { status: 500 }
    );
  }
}
