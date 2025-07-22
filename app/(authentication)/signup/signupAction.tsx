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
  // Get data off form
  const username = formData.get("username");
  const password = Math.floor(100000 + Math.random() * 900000);
  const institution = formData.get("nameinstitution");
  const userrole = formData.get("namerole");
  // Send to our api route

  const res = await fetch(ROOT_URL + "/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password, institution, userrole }),
  });
  const json = await res.json();
  // Redirect to log in if success
  if (res.ok) {
    redirect("/confirmed");
  } else {
    return json.error;
  }
}
