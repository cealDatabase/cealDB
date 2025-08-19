// /app/api/admin/open-new-year/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    console.log("Opening new year forms for all libraries...");

    // Step 1: Get the current year
    const currentYear = new Date().getFullYear();
    console.log(`Current year: ${currentYear}`);

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
            year: currentYear,
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
          // Create new Library_Year record only if it doesn't exist
          const newRecord = await db.library_Year.create({
            data: {
              library: library.id,
              year: currentYear,
              is_open_for_editing: true, // Enable editing for the new year
              updated_at: new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})),
              is_active: false, // ======================NOTE: only when library submitted forms then is_active would turn true ==========================
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
        year: currentYear,
        is_open_for_editing: true,
      },
    });

    console.log(`Successfully created ${successCount} new records for year ${currentYear}`);
    console.log(`Skipped ${skippedCount} existing records`);
    console.log(`Total active Library_Year records for ${currentYear}: ${totalLibraryYearRecords}`);

    // Step 5: Return success response with details
    return NextResponse.json({
      success: true,
      message: `Successfully opened ${currentYear} forms for libraries`,
      year: currentYear,
      count: successCount,
      skipped: skippedCount,
      totalLibraries: libraries.length,
      totalActiveRecords: totalLibraryYearRecords,
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
