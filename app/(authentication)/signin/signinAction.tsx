"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getCookiesByEmail from "./fetchCookies";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://cealstats.org";

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<any> {
  const expireTime = Date.now() + 24 * 60 * 60 * 1000 * 3; // 3 days
  // Get data off form
  const emailRaw = formData.get("email")?.toString();
  const email = emailRaw && emailRaw.toLowerCase();
  const password = formData.get("password");
  // Send to our api route

  const res = await fetch(ROOT_URL + "/api/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();

  // If signin failed, return error message without setting cookies
  if (!res.ok || json.error) {
    return json.error;
  }

  (await cookies()).set("session", json.token, {
    secure: true,
    httpOnly: true,
    expires: expireTime,
    path: "/",
    sameSite: "strict",
  });

  const fetchResult = async function (email: string | null): Promise<
    | {
        role: string | null | undefined;
        library: number | null | undefined;
      }
    | null
    | undefined
  > {
    if (typeof email === "string" && email.length > 5) {
      // Valid email address
      (await cookies()).set("uinf", email.toLowerCase(), {
        secure: true,
        httpOnly: true,
        expires: expireTime,
      });
      return await getCookiesByEmail({ cookieStore: email.toLowerCase() });
    }
  };

  (await cookies()).set(
    "library",
    (await fetchResult(email as string))?.library as unknown as string,
    {
      secure: true,
      httpOnly: true,
      expires: expireTime,
    }
  );

  (await cookies()).set(
    "role",
    (await fetchResult(email as string))?.role as unknown as string,
    {
      secure: true,
      httpOnly: true,
      expires: expireTime,
    }
  );

  // Redirect to log in if success
  if ((await cookies()).has("role") || (await cookies()).has("library")) {
    redirect("/admin");
  } else {
    return json.error;
  }
}
