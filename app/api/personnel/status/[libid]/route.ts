// /app/api/personnel/status/[libid]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: { params: { libid: string } }) {
  try {
    const libid = Number(params.libid);
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
        success: false,
        message: "No library year record found",
        is_open_for_editing: false,
      });
    }

    // Check if personnel data exists
    const existingData = await db.personnel_Support.findFirst({
      where: {
        libraryyear: libraryYear.id,
      },
    });

    return NextResponse.json({
      success: true,
      is_open_for_editing: libraryYear.is_open_for_editing,
      existingData: existingData,
      libraryYear: libraryYear,
    });

  } catch (error: any) {
    console.error("API error (personnel status by libid):", error);
    return NextResponse.json(
      { error: "Failed to fetch personnel status", detail: error?.message },
      { status: 500 }
    );
  }
}
