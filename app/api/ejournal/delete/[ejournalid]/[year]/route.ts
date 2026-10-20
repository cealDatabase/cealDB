import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { copiesMadeOf } from "@/lib/editedCopies";
import { logUserAction } from "@/lib/auditLogger";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ ejournalid: string, year: string }> }
) {
  // Mutates the shared, cross-institution catalog record, so this is limited to
  // Super Admin / E-Resource Editor — matching the
  // /admin/survey/* pages this is called from. hasValidSession() only proved
  // the caller was logged in, which let any member edit the global catalog.
  if (!(await requireRoles(1, 3))) {
    return NextResponse.json(
      { error: "Unauthorized: E-Resource Editor or Super Admin access required" },
      { status: 403 }
    );
  }

  // ✅ Await the params, then pull out listavid and year
  const { ejournalid, year } = await context.params;

  const ejId = Number(ejournalid);
  const yearNum = Number(year);
  if (isNaN(ejId) || isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid ejournalid or year" }, { status: 400 });
  }

  try {
    const editedVersions = await copiesMadeOf("ejournal", [ejId]);
    const countsWhere = { listejournal: ejId, year: yearNum };
    const accessWhere = { listejournal_id: { in: [ejId, ...editedVersions] }, Library_Year: { year: yearNum } };
    // What is deleted goes into the audit log, so a mistaken delete can be put back.
    const [counts, myAccess] = await Promise.all([
      db.list_EJournal_Counts.findMany({ where: countsWhere }),
      db.libraryYear_ListEJournal.findMany({ where: accessWhere }),
    ]);
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_EJournal_Counts.deleteMany({ where: countsWhere }),
      // Out of this year's list, the entry is no longer held this year: take
      // it, and institutions' edited versions of it, out of their My Access.
      db.libraryYear_ListEJournal.deleteMany({ where: accessWhere }),
    ]);
    await logUserAction("DELETE", "List_EJournal", ejId, { year: yearNum, counts, myAccess }, null, true, undefined, req);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Journal failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Journal record", detail: err?.message },
      { status: 500 }
    );
  }
}
