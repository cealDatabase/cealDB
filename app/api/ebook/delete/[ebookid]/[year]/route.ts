// app/api/ebook/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ ebookid: string, year: string }> }
) {
  // Mutates the shared, cross-institution catalog record, so this is limited to
  // Super Admin / E-Resource Editor / Assistant Admin — matching the
  // /admin/survey/* pages this is called from. hasValidSession() only proved
  // the caller was logged in, which let any member edit the global catalog.
  if (!(await requireRoles(1, 3, 4))) {
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
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_EBook_Counts.deleteMany({ where: { listebook: ebookId , year: yearNum} }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Book failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Book record", detail: err?.message },
      { status: 500 }
    );
  }
}
