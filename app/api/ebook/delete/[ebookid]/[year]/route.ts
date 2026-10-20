// app/api/ebook/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { copiesMadeOf } from "@/lib/editedCopies";
import { logUserAction } from "@/lib/auditLogger";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ ebookid: string, year: string }> }
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
  const { ebookid, year } = await context.params;

  const ebookId = Number(ebookid);
  const yearNum = Number(year);
  if (isNaN(ebookId) || isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid ebookid or year" }, { status: 400 });
  }

  try {
    const editedVersions = await copiesMadeOf("ebook", [ebookId]);
    const countsWhere = { listebook: ebookId, year: yearNum };
    const accessWhere = { listebook_id: { in: [ebookId, ...editedVersions] }, Library_Year: { year: yearNum } };
    // What is deleted goes into the audit log, so a mistaken delete can be put back.
    const [counts, myAccess] = await Promise.all([
      db.list_EBook_Counts.findMany({ where: countsWhere }),
      db.libraryYear_ListEBook.findMany({ where: accessWhere }),
    ]);
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_EBook_Counts.deleteMany({ where: countsWhere }),
      // Out of this year's list, the entry is no longer held this year: take
      // it, and institutions' edited versions of it, out of their My Access.
      db.libraryYear_ListEBook.deleteMany({ where: accessWhere }),
    ]);
    await logUserAction("DELETE", "List_EBook", ebookId, { year: yearNum, counts, myAccess }, null, true, undefined, req);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Book failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Book record", detail: err?.message },
      { status: 500 }
    );
  }
}
