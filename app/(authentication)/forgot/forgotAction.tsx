"use server";

import db from "@/lib/db";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export default async function forgotAction(
  currentState: any,
  formData: FormData
): Promise<string | undefined> {
  try {
    // Get data off form
    const email = formData.get("email");

    if (!email) {
      return "Please enter your email address.";
    }

    const emailStr = String(email).toLowerCase();

    // Find user by email (username field stores email)
    const user = await db.user.findUnique({
      where: { username: emailStr },
      select: {
        id: true,
        username: true,
        isactive: true,
      },
    });

    if (!user) {
      return "Error: No account found with this email address.\n\nPlease check your email spelling or contact the CEAL administrator to verify your account status.";
    }

    if (!user.isactive) {
      return "Error: Account is deactivated.\n\nPlease contact the CEAL administrator.";
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        requires_password_reset: true,
      },
    });

    // Send reset email
    const emailSent = await sendPasswordResetEmail(
      emailStr,
      user.username,
      resetToken
    );

    if (!emailSent) {
      console.error(`Failed to send password reset email to ${user.username}`);
      return "Error: Unable to send password reset email. Please try again later.";
    }

    console.log(`📧 Password reset email sent to ${user.username}`);

    return "Password reset instructions have been sent to your email successfully! Check your inbox.";
  } catch (error) {
    console.error("Password reset action error:", error);
    return "Error: Unable to send password reset email. Please try again later.";
  }
}
