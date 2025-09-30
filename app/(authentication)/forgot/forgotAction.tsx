"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

interface ApiResponse {
  message: string;
  id?: string;
}

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

    // Send to our password reset API route
    const res = await fetch(ROOT_URL + "/api/password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    
    const json = await res.json();

    if (res.ok) {
      return json.message || "Password reset email sent successfully! Check your email inbox.";
    } else {
      // Return detailed error message with hint if available
      const errorMessage = json.message || "Unable to process password reset request.";
      const hint = json.hint ? `\n\n${json.hint}` : "";
      return `${errorMessage}${hint}`;
    }
  } catch (error) {
    return "Error: Unable to send password reset email. Please try again later.";
  }
}
