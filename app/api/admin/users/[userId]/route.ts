import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

// DELETE - Delete a user and all related records (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Fetch user data before deletion for audit log
    const userToDelete = await db.user.findUnique({
      where: { id: userIdNum },
      include: {
        User_Library: {
          include: {
            Library: true
          }
        },
        User_Roles: {
          include: {
            Role: true
          }
        }
      }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of the last super admin
    const superAdminCount = await db.users_Roles.count({
      where: { role_id: 1 }
    });

    const isSuperAdmin = userToDelete.User_Roles.some(ur => ur.role_id === 1);
    if (isSuperAdmin && superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last super admin account" },
        { status: 400 }
      );
    }

    // Delete related records in a transaction
    // Note: Session has onDelete: Cascade in schema, so it will be auto-deleted
    // AuditLog relation is nullable, so we'll keep audit logs for historical purposes
    await db.$transaction(async (tx) => {
      // Delete User_Library records
      await tx.user_Library.deleteMany({
        where: { user_id: userIdNum }
      });

      // Delete Users_Roles records
      await tx.users_Roles.deleteMany({
        where: { user_id: userIdNum }
      });

      // Delete Session records (redundant due to cascade, but explicit for clarity)
      await tx.session.deleteMany({
        where: { userId: userIdNum }
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userIdNum }
      });
    });

    // Log the deletion
    await logUserAction(
      'DELETE',
      'User',
      userIdNum,
      userToDelete,
      null,
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      message: "User and all related records deleted successfully",
      deletedUser: {
        id: userToDelete.id,
        username: userToDelete.username,
        firstname: userToDelete.firstname,
        lastname: userToDelete.lastname
      }
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Log the failed deletion attempt
    const { userId } = await params;
    await logUserAction(
      'DELETE',
      'User',
      userId,
      null,
      null,
      false,
      error instanceof Error ? error.message : 'Unknown error',
      request
    );

    return NextResponse.json(
      { error: "Failed to delete user", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
