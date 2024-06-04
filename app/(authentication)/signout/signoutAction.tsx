import { cookies } from "next/headers";

export async function signoutAction() {
  // Destory the session
  cookies().set("Authorization", "", { maxAge: 0 });
}
