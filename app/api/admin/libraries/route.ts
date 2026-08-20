import { NextRequest, NextResponse } from "next/server";
import { isSuperAdminDb } from "@/lib/auth";
import db from "@/lib/db";

// GET - Fetch all libraries (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    // Super admin only. Verified against the database via the signed session
    // JWT — never the `role` cookie, which is unsigned and therefore forgeable.
    if (!(await isSuperAdminDb())) {
      return NextResponse.json(
        { error: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    const libraries = await db.library.findMany({
      orderBy: {
        library_name: 'asc'
      },
      select: {
        id: true,
        library_name: true,
        type: true
      }
    });
    
    if (!libraries) {
      return NextResponse.json(
        { error: "Failed to fetch libraries" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      libraries: libraries
    });

  } catch (error) {
    console.error("Error fetching libraries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
