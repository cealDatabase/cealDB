"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  // Get data off form
  const email = formData.get("email");
  const password = formData.get("password");
  // Send to our api route

  const res = await fetch(process.env.ROOT_URL + "/api/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();

  cookies().set("session", json.token, {
    secure: true,
    httpOnly: true,
    expires: Date.now() + 24 * 60 * 60 * 1000 * 3, // 3 days
    path: '/',
    sameSite: 'strict',
  });
  // Redirect to log in if success
  if (res.ok) {
    redirect("/admin");
  } else {
    return json.error;
  }
}
