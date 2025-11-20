import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

// PUT - Update user's library assignment (Super Admin only)
export async function PUT(
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

    const body = await request.json();
    const { libraryId } = body;

    // Validate libraryId
    if (libraryId !== null && (typeof libraryId !== 'number' || libraryId <= 0)) {
      return NextResponse.json(
        { error: "Invalid library ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userIdNum },
      include: {
        User_Library: {
          include: {
            Library: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Store old value for audit log
    const oldLibrary = user.User_Library?.[0]?.Library || null;

    // Handle library assignment update
    if (libraryId === null) {
      // Remove library assignment
      await db.user_Library.deleteMany({
        where: { user_id: userIdNum }
      });
    } else {
      // Check if library exists
      const library = await db.library.findUnique({
        where: { id: libraryId }
      });

      if (!library) {
        return NextResponse.json(
          { error: "Library not found" },
          { status: 404 }
        );
      }

      // Check if user already has a library assignment
      const existingAssignment = await db.user_Library.findFirst({
        where: { user_id: userIdNum }
      });

      if (existingAssignment) {
        // Update existing assignment
        await db.user_Library.updateMany({
          where: { user_id: userIdNum },
          data: { library_id: libraryId }
        });
      } else {
        // Create new assignment
        await db.user_Library.create({
          data: {
            user_id: userIdNum,
            library_id: libraryId
          }
        });
      }
    }

    // Fetch updated user data
    const updatedUser = await db.user.findUnique({
      where: { id: userIdNum },
      include: {
        User_Roles: {
          include: {
            Role: true,
          },
        },
        User_Library: {
          include: {
            Library: true,
          },
        },
      },
    });

    // Log the library assignment change
    await logUserAction(
      'UPDATE',
      'User_Library',
      userIdNum,
      oldLibrary,
      updatedUser?.User_Library?.[0]?.Library || null,
      true,
      undefined,
      request
    );

    return NextResponse.json({
      success: true,
      message: "Library assignment updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user library:", error);
    
    // Log the failed update attempt
    const { userId } = await params;
    await logUserAction(
      'UPDATE',
      'User_Library',
      userId,
      null,
      null,
      false,
      error instanceof Error ? error.message : 'Unknown error',
      request
    );

    return NextResponse.json(
      { error: "Failed to update library assignment", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
