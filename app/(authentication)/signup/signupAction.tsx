"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export default async function signupAction(
  currentState: any,
  formData: FormData
): Promise<string | null> {
  try {
    // Get data off form
    const username = formData.get("username");
    const institution = formData.get("nameinstitution");
    const userrole = formData.get("namerole");

    // Validate required fields
    if (!username || !institution || !userrole) {
      return "Please fill in all required fields.";
    }

    console.log(`🔄 Creating account for: ${username}`);

    // Send to our api route (no password needed - user will set via email)
    const res = await fetch(ROOT_URL + "/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, institution, userrole }),
    });
    
    const json = await res.json();
    console.log(`📋 Signup API response:`, json);
    
    // Redirect to confirmation if success
    if (res.ok && json.success) {
      console.log(`✅ Account created successfully, redirecting to confirmation`);
      redirect("/confirmed");
    } else {
      // Return specific error message from API
      console.log(`❌ Account creation failed:`, json);
      return json.message || json.hint || "Account creation failed. Please try again.";
    }
  } catch (error) {
    console.error('Signup action error:', error);
    // Check if this is a redirect error (which is expected)
    if (error && typeof error === 'object' && 'digest' in error) {
      // This is likely a Next.js redirect, let it propagate
      throw error;
    }
    return "Unable to create account. Please check your connection and try again.";
  }
}