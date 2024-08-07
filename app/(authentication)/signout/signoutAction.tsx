import { cookies } from "next/headers";

export async function signoutAction() {
  // Destory the session
  cookies().set("session", "", { maxAge: 0 });
  cookies().has("uinf") && cookies().set("uinf", "", { maxAge: 0 });
  cookies().has("role") && cookies().set("role", "", { maxAge: 0 });
  cookies().has("library") && cookies().set("library", "", { maxAge: 0 });
}
