// /app/api/test/user-selections/route.ts
// Test endpoint to verify user selections data fetching

import { NextResponse } from "next/server";
import { GetAVListWithUserSelections } from "@/app/(authentication)/admin/survey/avdb/components/getAVList";
import { GetEBookListWithUserSelections } from "@/app/(authentication)/admin/survey/ebook/components/getEBookList";
import { GetEJournalListWithUserSelections } from "@/app/(authentication)/admin/survey/ejournal/components/getEJournalList";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || 2025;
  const libraryId = Number(searchParams.get("libraryId")) || 1;

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    testParams: { year, libraryId },
  };

  try {
    // Test AV List with selections
    console.log(`[Test] Fetching AV list with selections for year=${year}, libraryId=${libraryId}`);
    const avData = await GetAVListWithUserSelections(year, libraryId);
    results.av = {
      success: true,
      count: avData.length,
      sampleItem: avData.length > 0 ? {
        id: avData[0].id,
        title: avData[0].title,
        is_selected: avData[0].is_selected,
        custom_count: avData[0].custom_count,
      } : null,
      hasSelectionData: avData.some(item => item.is_selected !== undefined),
    };
  } catch (error: any) {
    results.av = {
      success: false,
      error: error.message,
    };
  }

  try {
    // Test EBook List with selections
    console.log(`[Test] Fetching EBook list with selections for year=${year}, libraryId=${libraryId}`);
    const ebookData = await GetEBookListWithUserSelections(year, libraryId);
    results.ebook = {
      success: true,
      count: ebookData.length,
      sampleItem: ebookData.length > 0 ? {
        id: ebookData[0].id,
        title: ebookData[0].title,
        is_selected: ebookData[0].is_selected,
        custom_count: ebookData[0].custom_count,
      } : null,
      hasSelectionData: ebookData.some(item => item.is_selected !== undefined),
    };
  } catch (error: any) {
    results.ebook = {
      success: false,
      error: error.message,
    };
  }

  try {
    // Test EJournal List with selections
    console.log(`[Test] Fetching EJournal list with selections for year=${year}, libraryId=${libraryId}`);
    const ejournalData = await GetEJournalListWithUserSelections(year, libraryId);
    results.ejournal = {
      success: true,
      count: ejournalData.length,
      sampleItem: ejournalData.length > 0 ? {
        id: ejournalData[0].id,
        title: ejournalData[0].title,
        is_selected: ejournalData[0].is_selected,
        custom_count: ejournalData[0].custom_count,
      } : null,
      hasSelectionData: ejournalData.some(item => item.is_selected !== undefined),
    };
  } catch (error: any) {
    results.ejournal = {
      success: false,
      error: error.message,
    };
  }

  // Overall summary
  const allSuccess = results.av?.success && results.ebook?.success && results.ejournal?.success;
  const allHaveSelectionData = results.av?.hasSelectionData && 
                               results.ebook?.hasSelectionData && 
                               results.ejournal?.hasSelectionData;

  results.summary = {
    allSuccess,
    allHaveSelectionData,
    message: allSuccess 
      ? (allHaveSelectionData 
          ? "✅ All data fetching functions work correctly with user selection data" 
          : "⚠️ Data fetching works but no selection data found (may need to save selections first)")
      : "❌ Some data fetching functions failed",
  };

  return NextResponse.json(results, { status: allSuccess ? 200 : 500 });
}
