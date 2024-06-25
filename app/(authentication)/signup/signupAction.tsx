"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

export default async function signupAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  // Get data off form
  const username = formData.get("username");
  const password = formData.get("password");
  // Send to our api route

  const res = await fetch(ROOT_URL + "/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  // Redirect to log in if success
  if (res.ok) {
    redirect("/confirmed");
  } else {
    return json.error;
  }
}
