import { gateRoles } from "@/lib/roleGate";

// Checked on the server against the signed session (lib/roleGate.ts). The
// page checks again itself: a layout does not run on every navigation.
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await gateRoles([1, 4]); // Super Admin, Assistant Admin
  return <>{children}</>;
}
