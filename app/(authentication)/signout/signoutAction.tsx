import { cookies } from "next/headers";

export async function signoutAction() {
  // Destory the session
  const cookieStore = await cookies();
  cookieStore.set("session", "", { maxAge: 0 });
  cookieStore.has("uinf") && cookieStore.set("uinf", "", { maxAge: 0 });
  cookieStore.has("role") && cookieStore.set("role", "", { maxAge: 0 });
  cookieStore.has("library") && cookieStore.set("library", "", { maxAge: 0 });
}
