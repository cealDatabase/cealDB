import { NextRequest, NextResponse } from "next/server";
import { getUsersWithRoles } from "@/data/fetchPrisma";
import { cookies } from "next/headers";

// GET - Fetch all users with their roles (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is super admin
    const cookieStore = await cookies();
    const roleIds = cookieStore.get("role")?.value;
    
    let userRoleIds: string[] = [];
    try {
      userRoleIds = roleIds ? JSON.parse(roleIds) : [];
    } catch (error) {
      console.error('Failed to parse role IDs from cookie:', error);
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Check if user is super admin (role ID 1)
    if (!userRoleIds.includes("1")) {
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
