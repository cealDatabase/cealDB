import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { copiesMadeOf } from "@/lib/editedCopies";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ listavid: string, year: string }> }
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
  const { listavid, year } = await context.params;

  const avId = Number(listavid);
  const yearNum = Number(year);
  if (isNaN(avId) || isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid listavid or year" }, { status: 400 });
  }

  try {
    const editedVersions = await copiesMadeOf("av", [avId]);
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_AV_Counts.deleteMany({ where: { listav: avId , year: yearNum} }),
      // Out of this year's list, the entry is no longer held this year: take
      // it, and institutions' edited versions of it, out of their My Access.
      db.libraryYear_ListAV.deleteMany({
        where: { listav_id: { in: [avId, ...editedVersions] }, Library_Year: { year: yearNum } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete AV failed:", err);
    return NextResponse.json(
      { error: "Failed to delete AV record", detail: err?.message },
      { status: 500 }
    );
  }
}
