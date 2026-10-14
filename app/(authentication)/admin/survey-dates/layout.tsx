import { redirect } from "next/navigation";
import { isSuperAdminDb } from "@/lib/auth";

// Creating a year's Library_Year rows and setting its dates is a super admin
// step. /api/admin/open-new-year enforces that too; this keeps the page from
// rendering for anyone else. The check reads the signed session against the
// database, not the role cookie, which the client can rewrite.
export default async function SurveyDatesLayout({ children }: { children: React.ReactNode }) {
  if (!(await isSuperAdminDb())) {
    redirect("/unauthorized");
  }
  return <>{children}</>;
}
