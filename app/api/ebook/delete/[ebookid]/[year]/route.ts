// app/api/ebook/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ ebookid: string, year: string }> }
) {
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
