"use server";
import { redirect } from "next/navigation";

export default async function signupAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  // Get data off form
  const username = formData.get("username");
  const password = formData.get("password");
  // Send to our api route

  const res = await fetch(process.env.ROOT_URL + "/api/signup", {
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
