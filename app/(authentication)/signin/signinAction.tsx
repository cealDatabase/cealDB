"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getCookiesByEmail from "./fetchCookies"

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  // Get data off form
  const username = formData.get("username");
  const password = formData.get("password");
  // Send to our api route

  const res = await fetch(ROOT_URL + "/api/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();

  cookies().set("session", json.token, {
    secure: true,
    httpOnly: true,
    expires: Date.now() + 24 * 60 * 60 * 1000 * 3, // 3 days
    path: "/",
    sameSite: "strict",
  });

  if (typeof username === "string" && username.length > 5) {
    //valid email address
    cookies().set("uinf", username, {
      secure: true,
      httpOnly: true,
      expires: Date.now() + 24 * 60 * 60 * 1000 * 3, // 3 days
    });

    const fetchResult = await getCookiesByEmail({ cookieStore: username });
    if (typeof fetchResult?.role === "string") {
      cookies().set("role", fetchResult?.role);
    }
  }

  // Redirect to log in if success
  if (res.ok) {
    redirect("/admin");
  } else {
    return json.error;
  }
}
