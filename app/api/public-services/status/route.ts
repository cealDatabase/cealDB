// /app/api/public-services/status/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();

    // Get all library years for the current year that are open for editing
    const libraryYears = await db.library_Year.findMany({
      where: {
        year: currentYear,
      },
      select: {
        id: true,
        library: true,
        is_open_for_editing: true,
        year: true,
      },
    });

    return NextResponse.json({
      success: true,
      libraryYears,
    });

  } catch (error: any) {
    console.error("API error (public services status):", error);
    return NextResponse.json(
      { error: "Failed to fetch public services status", detail: error?.message },
      { status: 500 }
    );
  }
}
