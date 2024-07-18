"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getCookiesByEmail from "./fetchCookies";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<any> {
  const expireTime = Date.now() + 24 * 60 * 60 * 1000 * 3; // 3 days
  // Get data off form
  const userNameRaw = formData.get("username")?.toString();
  const username = userNameRaw && userNameRaw.toLowerCase();
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
    expires: expireTime,
    path: "/",
    sameSite: "strict",
  });

  const fetchResult = async function (username: string | null): Promise<
    | {
        role: string | null | undefined;
        library: number | null | undefined;
      }
    | null
    | undefined
  > {
    if (typeof username === "string" && username.length > 5) {
      // Valid email address
      cookies().set("uinf", username.toLowerCase(), {
        secure: true,
        httpOnly: true,
        expires: expireTime,
      });
      return await getCookiesByEmail({ cookieStore: username.toLowerCase() });
    }
  };

  cookies().set(
    "library",
    (await fetchResult(username as string))?.library as unknown as string,
    {
      secure: true,
      httpOnly: true,
      expires: expireTime,
    }
  );

  cookies().set(
    "role",
    (await fetchResult(username as string))?.role as unknown as string,
    {
      secure: true,
      httpOnly: true,
      expires: expireTime,
    }
  );

  // Redirect to log in if success
  if (cookies().has("role") || cookies().has("library")) {
    redirect("/admin");
  } else {
    return json.error;
  }
}
