/// <reference types="react/experimental" />

import db from "@/lib/db";
import { ResetEmailTemplate } from "@/components/ResetEmailTmpt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { username } = body;

  // Lookup the user
  const user = await db.user.findFirst({
    where: { username: username.toLowerCase() },
  });

  const expireTime = Date.now() + 60 * 1000 * 15; // 15 minutes

  if (!user) {
    return Response.json(
      { message: "Error. User not found" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "CEAL Admin <admin@vivoequeen.com>",
      to: username,
      subject: "From CEAL - Your password reset request.",
      react: ResetEmailTemplate({
        firstName: user.firstname ?? "CEAL user",
        resetLink: `https://ceal-db.vercel.app/forgot/${username}?token=${expireTime}`,
      }),
    });

    if (error) {
      // Convert error object to a simple message
      return Response.json(
        { message: error.message || "Error. Failed to send email" },
        { status: 500 }
      );
    }

    return Response.json({
      message: "Email sent successfully",
      id: data?.id,
    });
  } catch (error) {
    // Convert any unexpected errors to simple message
    const errorMessage = error instanceof Error ? error.message : "Error. An unexpected error occurred";
    return Response.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
