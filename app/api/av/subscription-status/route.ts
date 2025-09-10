// /app/api/av/subscription-status/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const libid = searchParams.get("libid");
    const year = searchParams.get("year");
    const recordIds = searchParams.get("recordIds");

    // Validate required parameters
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

    if (!recordIds) {
      return NextResponse.json(
        { error: "Missing record IDs" },
        { status: 400 }
      );
    }

    const validRecordIds = recordIds
      .split(",")
      .map(id => Number(id))
      .filter(id => Number.isFinite(id));

    if (validRecordIds.length === 0) {
      return NextResponse.json(
        { error: "No valid record IDs provided" },
        { status: 400 }
      );
    }

    // Find the Library_Year record
    const libraryYearRecord = await db.library_Year.findFirst({
      where: {
        library: Number(libid),
        year: Number(year),
      },
    });

    if (!libraryYearRecord) {
      return NextResponse.json({
        success: true,
        data: {
          libid: Number(libid),
          year: Number(year),
          libraryYearId: null,
          subscriptions: validRecordIds.map(id => ({
            recordId: id,
            isSubscribed: false,
          })),
        },
      });
    }

    // Check subscription status for each record
    const subscriptions = await db.libraryYear_ListAV.findMany({
      where: {
        libraryyear_id: libraryYearRecord.id,
        listav_id: { in: validRecordIds },
      },
      select: {
        listav_id: true,
      },
    });

    const subscribedIds = new Set(subscriptions.map(s => s.listav_id));

    return NextResponse.json({
      success: true,
      data: {
        libid: Number(libid),
        year: Number(year),
        libraryYearId: libraryYearRecord.id,
        subscriptions: validRecordIds.map(id => ({
          recordId: id,
          isSubscribed: subscribedIds.has(id),
        })),
      },
    });

  } catch (error: any) {
    console.error("API error (subscription status):", error);

    return NextResponse.json(
      { error: "Failed to check subscription status", detail: error?.message },
      { status: 500 }
    );
  }
}
