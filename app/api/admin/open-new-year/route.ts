// /app/api/admin/open-new-year/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { convertToPacificTime } from "@/lib/timezoneUtils";

export async function POST(req: Request) {
  try {
    console.log("Creating new year form records...");

    // Step 1: Parse request body
    const body = await req.json();
    const { year, openingDate, closingDate } = body;

    // Use provided year or default to current year
    const targetYear = year || new Date().getFullYear();
    console.log(`Target year: ${targetYear}`);

    // Validate dates if provided
    if (!openingDate || !closingDate) {
      return NextResponse.json(
        { error: "Missing required fields: openingDate and closingDate" },
        { status: 400 }
      );
    }

    // Convert dates to Pacific Time
    const openDate = convertToPacificTime(openingDate, false); // Midnight PT
    const closeDate = convertToPacificTime(closingDate, true);  // 11:59:59 PM PT

    console.log('📅 Date Conversion (Pacific Time):');
    console.log('  Opening:', openingDate, '→', openDate.toISOString());
    console.log('  Closing:', closingDate, '→', closeDate.toISOString());

    if (closeDate <= openDate) {
      return NextResponse.json(
        { error: "Closing date must be after opening date" },
        { status: 400 }
      );
    }

    // Step 2: Get all libraries and their IDs
    const libraries = await db.library.findMany({
      select: {
        id: true,
        library_name: true,
      },
    });

    if (libraries.length === 0) {
      return NextResponse.json(
        { error: "No libraries found in the database" },
        { status: 404 }
      );
    }

    console.log(`Found ${libraries.length} libraries`);

    // Step 3: Create new Library_Year records for each library for the current year
    const createdRecords = [];
    let successCount = 0;
    let skippedCount = 0;

    for (const library of libraries) {
      try {
        // Check if a record already exists for this library and year
        const existingRecord = await db.library_Year.findFirst({
          where: {
            library: library.id,
            year: targetYear,
          },
        });

        if (existingRecord) {
          // Skip if record already exists - don't update existing records
          console.log(`Skipped existing record for library: ${library.library_name}`);
          createdRecords.push({
            library_id: library.id,
            library_name: library.library_name,
            action: 'skipped',
            record_id: existingRecord.id,
            reason: 'Record already exists for this year',
          });
          skippedCount++;
        } else {
          // Create new Library_Year record with scheduled opening/closing dates
          const newRecord = await db.library_Year.create({
            data: {
              library: library.id,
              year: targetYear,
              is_open_for_editing: false, // Forms remain CLOSED until scheduled opening
              opening_date: openDate,      // Set opening date
              closing_date: closeDate,     // Set closing date
              updated_at: new Date(),
              is_active: false, // Only becomes true when library submits forms
              admin_notes: ``,
            },
          });

          console.log(`Created new record for library: ${library.library_name}`);
          createdRecords.push({
            library_id: library.id,
            library_name: library.library_name,
            action: 'created',
            record_id: newRecord.id,
          });
          successCount++;
        }
      } catch (libraryError) {
        console.error(`Error processing library ${library.library_name}:`, libraryError);
        createdRecords.push({
          library_id: library.id,
          library_name: library.library_name,
          action: 'error',
          error: libraryError instanceof Error ? libraryError.message : 'Unknown error',
        });
      }
    }

    // Step 4: Confirm Library_Year table has been updated and return results
    const totalLibraryYearRecords = await db.library_Year.count({
      where: {
        year: targetYear,
      },
    });

    console.log(`✅ Successfully created ${successCount} new records for year ${targetYear}`);
    console.log(`⏭️  Skipped ${skippedCount} existing records`);
    console.log(`📊 Total Library_Year records for ${targetYear}: ${totalLibraryYearRecords}`);
    console.log(`📅 Opening Date: ${openDate.toISOString()}`);
    console.log(`📅 Closing Date: ${closeDate.toISOString()}`);

    // Step 5: Return success response with details
    return NextResponse.json({
      success: true,
      message: `Successfully created form records for year ${targetYear}. Forms will open on scheduled date.`,
      year: targetYear,
      count: successCount,
      skipped: skippedCount,
      totalLibraries: libraries.length,
      totalActiveRecords: totalLibraryYearRecords,
      openingDate: openDate.toISOString(),
      closingDate: closeDate.toISOString(),
      details: createdRecords,
      summary: {
        created: createdRecords.filter(r => r.action === 'created').length,
        skipped: createdRecords.filter(r => r.action === 'skipped').length,
        errors: createdRecords.filter(r => r.action === 'error').length,
      },
    });

  } catch (error: any) {
    console.error("API error (open new year):", error);

    return NextResponse.json(
      { 
        error: "Failed to open new year forms", 
        detail: error?.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
