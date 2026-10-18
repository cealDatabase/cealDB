"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

interface SignupResult {
  success: boolean;
  message: string;
  error?: string;
}

export default async function signupAction(
  currentState: any,
  formData: FormData
): Promise<SignupResult> {
  try {
    // Get data off form
    const username = formData.get("username");
    const institution = formData.get("nameinstitution");
    const userrole = formData.get("namerole");

    // Validate required fields
    if (!username || !institution || !userrole) {
      return {
        success: false,
        message: "Please fill in all required fields.",
        error: "Please fill in all required fields."
      };
    }

    console.log(`🔄 Creating account for: ${username}`);

    // Send to our api route (no password needed - user will set via email)
    // The route creates accounts only for a signed-in Super Admin or
    // Assistant Admin, so the request carries this admin's session.
    const res = await fetch(ROOT_URL + "/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: (await cookies()).toString(),
      },
      body: JSON.stringify({ username, institution, userrole }),
    });
    
    const json = await res.json();
    console.log(`📋 Signup API response:`, json);
    
    // Return success or error response
    if (res.ok && json.success) {
      console.log(`✅ Account created successfully for: ${username}`);
      return {
        success: true,
        message: `Account created successfully for ${username}! Password setup email has been sent.`
      };
    } else {
      // Return specific error message from API
      console.log(`❌ Account creation failed:`, json);
      return {
        success: false,
        message: json.message || json.hint || "Account creation failed. Please try again.",
        error: json.message || json.hint || "Account creation failed. Please try again."
      };
    }
  } catch (error) {
    console.error('Signup action error:', error);
    return {
      success: false,
      message: "Unable to create account. Please check your connection and try again.",
      error: "Unable to create account. Please check your connection and try again."
    };
  }
}