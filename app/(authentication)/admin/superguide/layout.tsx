import { gateRoles } from "@/lib/roleGate";

// Checked on the server against the signed session (lib/roleGate.ts); the
// page's own check reads the editable role cookie.
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await gateRoles([1, 4]); // Super Admin, Assistant Admin
  return <>{children}</>;
}
