"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export default async function signupAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  try {
    // Get data off form
    const username = formData.get("username");
    const institution = formData.get("nameinstitution");
    const userrole = formData.get("namerole");

    // Validate required fields
    if (!username || !institution || !userrole) {
      return "Please fill in all required fields.";
    }

    // Send to our api route (no password needed - user will set via email)
    const res = await fetch(ROOT_URL + "/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, institution, userrole }),
    });
    
    const json = await res.json();
    
    // Redirect to confirmation if success
    if (res.ok && json.success) {
      redirect("/confirmed");
    } else {
      // Return error message with better formatting
      return json.message || json.error || "Account creation failed. Please try again.";
    }
  } catch (error) {
    return "Unable to create account. Please check your connection and try again.";
  }
}