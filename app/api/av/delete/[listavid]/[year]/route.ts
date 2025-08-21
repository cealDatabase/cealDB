import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ listavid: string, year: string }> }
) {
  // ✅ Await the params, then pull out listavid and year
  const { listavid, year } = await context.params;

  const avId = Number(listavid);
  const yearNum = Number(year);
  if (isNaN(avId) || isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid listavid or year" }, { status: 400 });
  }

  try {
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_AV_Counts.deleteMany({ where: { listav: avId , year: yearNum} }),
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
