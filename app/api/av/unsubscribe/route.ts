import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Unsubscribing from AV records with body:", body);

    const { libid, year, recordIds } = body;

    // Validate required fields
    if (!libid || isNaN(Number(libid))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID" },
        { status: 400 }
      );
    }

    if (!year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return NextResponse.json(
        { error: "No record IDs provided" },
        { status: 400 }
      );
    }

    // Validate that all recordIds are valid numbers
    const validRecordIds = recordIds.filter(id => Number.isFinite(Number(id)));
    if (validRecordIds.length === 0) {
      return NextResponse.json(
        { error: "No valid record IDs provided" },
        { status: 400 }
      );
    }

    // Find the Library_Year record for this library and year
    console.log(`Looking for Library_Year record with library: ${libid}, year: ${year}`);
    
    const libraryYearRecord = await db.library_Year.findFirst({
      where: {
        library: Number(libid),
        year: Number(year),
      },
    });

    console.log("Found Library_Year record:", libraryYearRecord);

    if (!libraryYearRecord) {
      return NextResponse.json(
        { 
          error: "Library year record not found", 
          detail: `No Library_Year record exists for library ${libid} and year ${year}.` 
        },
        { status: 404 }
      );
    }

    // Remove subscription entries from LibraryYear_ListAV junction table
    const unsubscribeResults = [];
    const libraryYearId = libraryYearRecord.id;

    for (const recordId of validRecordIds) {
      try {
        // Check if subscription exists
        const existingSubscription = await db.libraryYear_ListAV.findUnique({
          where: {
            libraryyear_id_listav_id: {
              libraryyear_id: libraryYearId,
              listav_id: Number(recordId),
            },
          },
        });

        if (!existingSubscription) {
          unsubscribeResults.push({
            recordId: Number(recordId),
            unsubscribed: false,
            reason: "Not subscribed",
          });
        } else {
          // Remove subscription
          await db.libraryYear_ListAV.delete({
            where: {
              libraryyear_id_listav_id: {
                libraryyear_id: libraryYearId,
                listav_id: Number(recordId),
              },
            },
          });

          unsubscribeResults.push({
            recordId: Number(recordId),
            unsubscribed: true,
            previouslySubscribed: true,
          });
        }
      } catch (error) {
        console.error(`Failed to unsubscribe from record ${recordId}:`, error);
        unsubscribeResults.push({
          recordId: Number(recordId),
          unsubscribed: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const successCount = unsubscribeResults.filter(r => r.unsubscribed).length;
    const failureCount = unsubscribeResults.length - successCount;
    const notSubscribedCount = unsubscribeResults.filter(r => r.reason === "Not subscribed").length;

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${validRecordIds.length} record${validRecordIds.length === 1 ? "" : "s"}. ${successCount} unsubscribed${notSubscribedCount > 0 ? `, ${notSubscribedCount} were not subscribed` : ""}${failureCount > 0 ? `, ${failureCount} failed` : ""}.`,
      data: {
        libid: Number(libid),
        year: Number(year),
        libraryYearId: libraryYearId,
        totalRequested: validRecordIds.length,
        successCount,
        failureCount,
        notSubscribedCount,
        results: unsubscribeResults
      }
    });

  } catch (error: any) {
    console.error("API error (unsubscribe AV):", error);

    return NextResponse.json(
      { error: "Failed to unsubscribe from AV records", detail: error?.message },
      { status: 500 }
    );
  }
}
