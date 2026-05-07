// /app/api/test/db-verification/route.ts
// Direct database verification endpoint

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  try {
    // Test 1: Verify new columns exist in junction tables
    const avColumns = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListAV' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
    `;
    results.avColumns = avColumns;

    const ebookColumns = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListEBook' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
    `;
    results.ebookColumns = ebookColumns;

    const ejournalColumns = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'LibraryYear_ListEJournal' 
      AND column_name IN ('is_selected', 'custom_count', 'updated_at')
    `;
    results.ejournalColumns = ejournalColumns;

    // Test 2: Verify test data exists
    const testData = await db.libraryYear_ListAV.findMany({
      where: { libraryyear_id: 2816 },
      select: {
        listav_id: true,
        is_selected: true,
        custom_count: true,
        updated_at: true,
      },
    });
    results.testData = testData;

    // Test 3: Verify we can query the new fields
    const testQuery = await db.libraryYear_ListAV.findFirst({
      where: { libraryyear_id: 2816 },
      select: {
        is_selected: true,
        custom_count: true,
        updated_at: true,
      },
    });
    results.testQuery = testQuery ? "Success - fields accessible" : "No data found";

    // Summary
    results.summary = {
      allColumnsPresent: 
        (avColumns as any[]).length === 3 &&
        (ebookColumns as any[]).length === 3 &&
        (ejournalColumns as any[]).length === 3,
      testDataFound: testData.length > 0,
      fieldsAccessible: !!testQuery,
    };

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
