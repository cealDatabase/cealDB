import { NextRequest, NextResponse } from "next/server";
import { getAllRoles } from "@/data/fetchPrisma";
import { isSuperAdminDb } from "@/lib/auth";

// GET - Fetch all available roles (Super Admin only)
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

    const roles = await getAllRoles();
    
    if (!roles) {
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roles: roles
    });

  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
