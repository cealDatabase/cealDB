// /app/api/av/subscribe/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Subscribing to AV records with body:", body);

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

    // Check if the records exist
    const existingRecords = await db.list_AV.findMany({
      where: {
        id: { in: validRecordIds.map(id => Number(id)) }
      },
      select: { id: true, title: true }
    });

    if (existingRecords.length !== validRecordIds.length) {
      return NextResponse.json(
        { error: "Some records were not found" },
        { status: 404 }
      );
    }

    // Find the Library_Year record for this library and year
    const libraryYearRecord = await db.library_Year.findFirst({
      where: {
        library: Number(libid),
        year: Number(year),
      },
    });

    if (!libraryYearRecord) {
      return NextResponse.json(
        { 
          error: "Library year record not found", 
          detail: `No Library_Year record exists for library ${libid} and year ${year}. Please ensure the library is set up for this year.` 
        },
        { status: 404 }
      );
    }

    // Create subscription entries using LibraryYear_ListAV junction table
    const subscriptionResults = [];

    for (const recordId of validRecordIds) {
      try {
        // Check if subscription already exists
        const existingSubscription = await db.libraryYear_ListAV.findUnique({
          where: {
            libraryyear_id_listav_id: {
              libraryyear_id: libraryYearRecord.id,
              listav_id: Number(recordId),
            },
          },
        });

        if (existingSubscription) {
          subscriptionResults.push({
            recordId: Number(recordId),
            subscribed: true,
            alreadySubscribed: true,
          });
        } else {
          // Create new subscription
          const subscription = await db.libraryYear_ListAV.create({
            data: {
              libraryyear_id: libraryYearRecord.id,
              listav_id: Number(recordId),
            },
          });

          subscriptionResults.push({
            recordId: Number(recordId),
            subscribed: true,
            alreadySubscribed: false,
            subscription,
          });
        }
      } catch (error) {
        console.error(`Failed to subscribe to record ${recordId}:`, error);
        subscriptionResults.push({
          recordId: Number(recordId),
          subscribed: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const successCount = subscriptionResults.filter(r => r.subscribed).length;
    const failureCount = subscriptionResults.length - successCount;
    const alreadySubscribedCount = subscriptionResults.filter(r => r.alreadySubscribed).length;

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${validRecordIds.length} record${validRecordIds.length === 1 ? "" : "s"}. ${successCount} new subscriptions created${alreadySubscribedCount > 0 ? `, ${alreadySubscribedCount} already subscribed` : ""}${failureCount > 0 ? `, ${failureCount} failed` : ""}.`,
      data: {
        libid: Number(libid),
        year: Number(year),
        libraryYearId: libraryYearRecord.id,
        totalRequested: validRecordIds.length,
        successCount,
        failureCount,
        alreadySubscribedCount,
        results: subscriptionResults
      }
    });

  } catch (error: any) {
    console.error("API error (subscribe AV):", error);

    return NextResponse.json(
      { error: "Failed to subscribe to AV records", detail: error?.message },
      { status: 500 }
    );
  }
}
