"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

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
    const username = formData.get("username");

    // Send to our api route
    const res = await fetch(ROOT_URL + "/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const json: ApiResponse = await res.json();

    // Redirect to log in if success
    if (res.ok) {
      return json.message;
      // redirect("/signin");
    } else {
      // Return just the error message string, not the whole object
      return json.message;
    }
  } catch (error) {
    return `Error. An unexpected error occurred. Detail: ${error}`;
  }
}
