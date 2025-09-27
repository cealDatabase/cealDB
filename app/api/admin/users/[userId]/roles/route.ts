import { NextRequest, NextResponse } from "next/server";
import { updateUserRoles } from "@/data/fetchPrisma";
import { cookies } from "next/headers";
import { logUserAction } from "@/lib/auditLogger";

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// PUT - Update user roles (Super Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

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

    const body = await request.json();
    const { roleIds: newRoleIds } = body;

    if (!Array.isArray(newRoleIds) || newRoleIds.some(id => typeof id !== 'number')) {
      return NextResponse.json(
        { error: "Invalid role IDs. Must be an array of numbers." },
        { status: 400 }
      );
    }

    // Get current user roles for audit log
    const currentUserEmail = cookieStore.get("uinf")?.value;
    const oldRoles = userRoleIds.map(id => parseInt(id));

    const result = await updateUserRoles(userIdNum, newRoleIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // Log the role change
    try {
      await logUserAction(
        'UPDATE_ROLES',
        'Users_Roles',
        userId,
        { roles: oldRoles },
        { roles: newRoleIds },
        true,
        undefined,
        request
      );
    } catch (auditError) {
      console.error('Failed to log role update:', auditError);
      // Don't fail the request just because audit logging failed
    }

    return NextResponse.json({
      success: true,
      message: "User roles updated successfully",
      user: result.data
    });

  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
