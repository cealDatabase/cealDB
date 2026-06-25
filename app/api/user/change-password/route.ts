import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/password";
import { logUserAction } from "@/lib/auditLogger";

export async function PUT(request: NextRequest) {
  try {
    // Identify user from session cookie
    const cookieStore = await cookies();
    const rawCookieValue = cookieStore.get("uinf")?.value;
    const userEmail = rawCookieValue
      ? decodeURIComponent(rawCookieValue).toLowerCase()
      : undefined;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized: No user session found" },
        { status: 401 }
      );
    }

    // Fetch user (need stored password hash)
    const user = await db.user.findUnique({
      where: { username: userEmail },
      select: { id: true, username: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: User not found" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "No password is set on this account. Use the password-reset link instead." },
        { status: 400 }
      );
    }

    // Parse body
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All three password fields are required." },
        { status: 400 }
      );
    }

    // 1. Verify current password
    const currentOk = await verifyPassword(currentPassword, user.password);
    if (!currentOk) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // 2. Check new passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    // 3. Validate new password strength
    const { valid, errors } = validatePassword(newPassword);
    if (!valid) {
      return NextResponse.json(
        { error: errors[0], errors },
        { status: 400 }
      );
    }

    // 4. Prevent reuse of same password
    const sameAsOld = await verifyPassword(newPassword, user.password);
    if (sameAsOld) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    // 5. Hash and update
    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: newHash,
        requires_password_reset: false,
        updated_at: new Date(),
      },
    });

    // Audit log
    await logUserAction(
      "UPDATE",
      "User",
      user.id.toString(),
      { password: "[redacted]" },
      { password: "[redacted]" },
      true,
      "User changed their own password",
      request
    );

    return NextResponse.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}
