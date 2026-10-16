"use server";

import db from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { claimResetEmail, releaseResetEmail, retryMessage } from "@/lib/passwordResetEmail";

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

    // At most one email per account every 10 minutes (daily email quota).
    const claim = await claimResetEmail(user.id);
    if (!claim.ok) {
      return retryMessage(claim.retryInMinutes);
    }

    // Send reset email
    const emailSent = await sendPasswordResetEmail(
      emailStr,
      user.username,
      claim.token
    );

    if (!emailSent) {
      await releaseResetEmail(user.id, claim.token);
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
