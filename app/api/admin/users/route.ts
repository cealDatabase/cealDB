import { NextRequest, NextResponse } from "next/server";
import { getUsersWithRoles } from "@/data/fetchPrisma";
import { isSuperAdminDb } from "@/lib/auth";

// GET - Fetch all users with their roles (Super Admin only)
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

    const users = await getUsersWithRoles();
    
    if (!users) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
