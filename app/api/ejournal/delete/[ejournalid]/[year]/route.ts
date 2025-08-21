import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ ejournalid: string, year: string }> }
) {
  // ✅ Await the params, then pull out listavid and year
  const { ejournalid, year } = await context.params;

  const ejId = Number(ejournalid);
  const yearNum = Number(year);
  if (isNaN(ejId) || isNaN(yearNum)) {
    return NextResponse.json({ error: "Invalid ejournalid or year" }, { status: 400 });
  }

  try {
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_EJournal_Counts.deleteMany({ where: { listejournal: ejId , year: yearNum} }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Journal failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Journal record", detail: err?.message },
      { status: 500 }
    );
  }
}
