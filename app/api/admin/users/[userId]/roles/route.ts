import { NextRequest, NextResponse } from "next/server";
import { updateUserRoles } from "@/data/fetchPrisma";
import db from "@/lib/db";
import { isSuperAdminDb } from "@/lib/auth";
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

    // Super admin only. Checked against the database via the signed session
    // JWT — never the `role` cookie, which is unsigned and forgeable. This
    // endpoint grants roles, so a bypass here means permanent privilege
    // escalation.
    if (!(await isSuperAdminDb())) {
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

    // Capture the TARGET user's existing roles for the audit log. This
    // previously logged the acting admin's own roles, which made every role
    // change record show the wrong "before" value.
    const oldRoles = (
      await db.users_Roles.findMany({
        where: { user_id: userIdNum },
        select: { role_id: true },
      })
    ).map((r) => r.role_id);

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
