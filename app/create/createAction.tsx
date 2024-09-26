"use server";
import { redirect } from "next/navigation";

const ROOT_URL =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://ceal-db.vercel.app/";

export default async function createAction(
  currentState: any,
  formData: FormData
): Promise<string> {
  // Get data off form
  formData.entries()
  const libraryName = formData.get("libraryName");
  const hideInLibraryListing = formData.get("hideInLibraryListing");
  const libraryType = formData.get("libraryType")
  // Send to our api route

  console.log(libraryName, hideInLibraryListing, );
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const res = await fetch(ROOT_URL + "/api/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ libraryName, hideInLibraryListing, libraryType}),
  });
  const json = await res.json();
  // Redirect to log in if success
  if (res.ok) {
    redirect("/libraries");
  } else {
    return json.error;
  }
}
