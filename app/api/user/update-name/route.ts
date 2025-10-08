import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated user's email from cookies
    const cookieStore = await cookies();
    const rawCookieValue = cookieStore.get("uinf")?.value;
    const userEmail = rawCookieValue ? decodeURIComponent(rawCookieValue).toLowerCase() : undefined;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized: No user session found" },
        { status: 401 }
      );
    }

    // Get the authenticated user from database
    const authenticatedUser = await db.user.findUnique({
      where: { username: userEmail },
      select: { id: true, username: true, firstname: true, lastname: true }
    });

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { firstname, lastname } = body;

    // Validate input
    if (!firstname || !lastname) {
      return NextResponse.json(
        { error: "Both first name and last name are required" },
        { status: 400 }
      );
    }

    if (typeof firstname !== 'string' || typeof lastname !== 'string') {
      return NextResponse.json(
        { error: "Invalid name format" },
        { status: 400 }
      );
    }

    // Validate name lengths
    if (firstname.trim().length === 0 || lastname.trim().length === 0) {
      return NextResponse.json(
        { error: "Names cannot be empty" },
        { status: 400 }
      );
    }

    if (firstname.length > 100 || lastname.length > 100) {
      return NextResponse.json(
        { error: "Names must be less than 100 characters" },
        { status: 400 }
      );
    }

    // Store old values for audit log
    const oldValues = {
      firstname: authenticatedUser.firstname,
      lastname: authenticatedUser.lastname
    };

    // Update user name (users can only update their own name)
    const updatedUser = await db.user.update({
      where: { id: authenticatedUser.id },
      data: {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        updated_at: new Date()
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true
      }
    });

    // Log the action
    await logUserAction(
      'UPDATE',
      'User',
      updatedUser.id.toString(),
      oldValues,
      { firstname: updatedUser.firstname, lastname: updatedUser.lastname },
      true,
      `User updated their own name`,
      request
    );

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
      user: {
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname
      }
    });

  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json(
      { 
        error: "Failed to update name",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
