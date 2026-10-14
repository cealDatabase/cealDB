import { gateRoles } from "@/lib/roleGate";

// Checked on the server against the signed session (lib/roleGate.ts).
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await gateRoles([1]); // Super Admin
  return <>{children}</>;
}
