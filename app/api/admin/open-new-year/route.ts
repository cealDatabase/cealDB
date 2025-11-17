// /app/api/admin/open-new-year/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    // Convert dates to Pacific Time to prevent timezone issues
    // Input "2025-10-15" should be Oct 15 at 12:00 AM Pacific, not UTC midnight
    const toPacificMidnight = (dateStr: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d, 8, 0, 0)); // 8 AM UTC = 12 AM PST
    };
    
    const toPacificEndOfDay = (dateStr: string): Date => {
      const [y, m, d] = dateStr.split('-').map(Number);
      // To represent 11:59 PM Pacific on day D: next day at 7:59 AM UTC
      return new Date(Date.UTC(y, m - 1, d + 1, 7, 59, 0));
    };

    const openDate = toPacificMidnight(openingDate);
    const closeDate = toPacificEndOfDay(closingDate);

    console.log('📅 Date Summary:');
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

    // Step 3: Create or update Library_Year records for each library for the current year
    const createdRecords = [];
    let successCount = 0;
    let updatedCount = 0;

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
          // Update existing record with new dates
          const updatedRecord = await db.library_Year.update({
            where: {
              id: existingRecord.id,
            },
            data: {
              opening_date: openDate,      // Update opening date
              closing_date: closeDate,     // Update closing date
              updated_at: new Date(),
            },
          });

          console.log(`Updated existing record for library: ${library.library_name}`);
          createdRecords.push({
            library_id: library.id,
            library_name: library.library_name,
            action: 'updated',
            record_id: updatedRecord.id,
            previous_opening: existingRecord.opening_date?.toISOString(),
            previous_closing: existingRecord.closing_date?.toISOString(),
            new_opening: openDate.toISOString(),
            new_closing: closeDate.toISOString(),
          });
          updatedCount++;
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
              is_active: false, // Only becomes true when library submits at least one form (for reporting)
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

    // Step 4: Create or update SurveySession for automatic form opening/closing
    console.log('📋 Creating/updating SurveySession for automatic scheduling...');
    
    const existingSession = await db.surveySession.findUnique({
      where: { academicYear: targetYear }
    });

    let sessionAction = 'created';
    if (existingSession) {
      // Update existing session with new dates
      await db.surveySession.update({
        where: { academicYear: targetYear },
        data: {
          openingDate: openDate,
          closingDate: closeDate,
          isOpen: false,
          notifiedOnOpen: false,
          notifiedOnClose: false,
        }
      });
      sessionAction = 'updated';
      console.log(`🔄 Updated existing SurveySession for year ${targetYear}`);
    } else {
      // Create new session
      await db.surveySession.create({
        data: {
          academicYear: targetYear,
          openingDate: openDate,
          closingDate: closeDate,
          isOpen: false,
          notifiedOnOpen: false,
          notifiedOnClose: false,
        }
      });
      console.log(`✅ Created new SurveySession for year ${targetYear}`);
    }

    // Step 5: Confirm Library_Year table has been updated and return results
    const totalLibraryYearRecords = await db.library_Year.count({
      where: {
        year: targetYear,
      },
    });

    console.log(`✅ Successfully created ${successCount} new records for year ${targetYear}`);
    console.log(`🔄 Updated ${updatedCount} existing records with new dates`);
    console.log(`📊 Total Library_Year records for ${targetYear}: ${totalLibraryYearRecords}`);
    console.log(`📅 Opening Date: ${openDate.toISOString()}`);
    console.log(`📅 Closing Date: ${closeDate.toISOString()}`);
    console.log(`🤖 SurveySession ${sessionAction} - Cron job will auto-open/close forms`);

    // Step 6: Return success response with details
    return NextResponse.json({
      success: true,
      message: `Successfully processed form records for year ${targetYear}. Created ${successCount}, Updated ${updatedCount}. SurveySession ${sessionAction}. Forms will automatically open on scheduled date.`,
      year: targetYear,
      count: successCount,
      updated: updatedCount,
      totalLibraries: libraries.length,
      totalActiveRecords: totalLibraryYearRecords,
      openingDate: openDate.toISOString(),
      closingDate: closeDate.toISOString(),
      sessionAction: sessionAction,
      details: createdRecords,
      summary: {
        created: createdRecords.filter(r => r.action === 'created').length,
        updated: createdRecords.filter(r => r.action === 'updated').length,
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
