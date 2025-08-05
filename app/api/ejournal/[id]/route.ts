// /app/api/ejournal/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  /*──── await the whole context first ────*/
  const ctx = await context;
  const ejId = Number(ctx.params.id); // no nested destructuring
  if (isNaN(ejId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await db.$transaction([
      db.list_EJournal_Language.deleteMany({
        where: { listejournal_id: ejId },
      }),
      db.list_EJournal_Counts.deleteMany({ where: { listejournal: ejId } }),
      db.libraryYear_ListEJournal.deleteMany({
        where: { listejournal_id: ejId },
      }),
      db.list_EJournal.delete({ where: { id: ejId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Journal failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Journal", detail: err?.message },
      { status: 500 }
    );
  }
}
