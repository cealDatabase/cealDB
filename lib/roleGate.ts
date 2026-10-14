// lib/roleGate.ts (server-only)
import { redirect } from "next/navigation";
import { getSessionUserId, requireRoles } from "@/lib/auth";

/**
 * Server-side gate for an admin page, used from the page's layout.
 *
 * Most toolkit pages checked the `role` cookie, which the browser can edit,
 * so anyone signed in could rewrite it and open them. This checks the signed
 * session against the database instead. Signed-out visitors go to sign in;
 * signed-in users without one of the roles go to /unauthorized.
 */
export async function gateRoles(roles: number[]): Promise<void> {
  if (!(await getSessionUserId())) redirect("/signin");
  if (!(await requireRoles(...roles))) redirect("/unauthorized");
}
