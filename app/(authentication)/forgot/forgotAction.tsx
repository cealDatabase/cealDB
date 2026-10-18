"use server";

import db from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { claimResetEmail, releaseResetEmail, retryMessage } from "@/lib/passwordResetEmail";
import { emailErrorFrom, publicEmailError, type EmailError } from "@/lib/emailError";
import { logEmailFailure } from "@/lib/auditLogger";

/** The email was not sent: the message, and an error code the person can copy. */
export type ForgotFailure = { message: string; emailError: EmailError };

const NOT_SENT = "Error: Unable to send password reset email. Please try again later.";

export default async function forgotAction(
  currentState: any,
  formData: FormData
): Promise<string | ForgotFailure | undefined> {
  let to = "";
  try {
    // Get data off form
    const email = formData.get("email");

    if (!email) {
      return "Please enter your email address.";
    }

    const emailStr = String(email).toLowerCase();
    to = emailStr;

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
    const sent = await sendPasswordResetEmail(
      emailStr,
      user.username,
      claim.token
    );

    if (!sent.ok) {
      await releaseResetEmail(user.id, claim.token);
      console.error(`Failed to send password reset email to ${user.username}`);
      const emailError = emailErrorFrom(sent.failure, "forgot-password");
      await logEmailFailure(emailError, { mode: "password_reset", to: emailStr });
      return { message: NOT_SENT, emailError: publicEmailError(emailError) };
    }

    console.log(`📧 Password reset email sent to ${user.username}`);

    return "Password reset instructions have been sent to your email successfully! Check your inbox.";
  } catch (error) {
    console.error("Password reset action error:", error);
    const emailError = emailErrorFrom(error, "forgot-password");
    await logEmailFailure(emailError, { mode: "password_reset", to });
    return { message: NOT_SENT, emailError: publicEmailError(emailError) };
  }
}
