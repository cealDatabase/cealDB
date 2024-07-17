"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

export default async function forgotAction(
  currentState: any,
  formData: FormData
): Promise<any> {
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
  const json = await res.json();


  // Redirect to log in if success
  if (res.ok) {
    redirect("/signin");
  } else {
    return json.error;
  }
}
