'use server';

import { cookies } from "next/headers";

export async function signoutAction() {
  const cookieStore = await cookies();
  
  // Clear all authentication cookies (including deprecated home_library)
  const cookiesToClear = ["session", "uinf", "role", "library", "observe_library", "home_library", "token"];
  
  for (const cookieName of cookiesToClear) {
    if (cookieStore.has(cookieName)) {
      cookieStore.delete(cookieName);
    }
  }
  
  console.log('[signoutAction] All authentication cookies cleared');
}
