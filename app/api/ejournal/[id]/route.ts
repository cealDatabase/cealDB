// /app/api/ejournal/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = { id: string };

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> } // <- params is a Promise
) {
  const { id } = await params; // <- await params itself
  const ejId = Number(id);

  if (Number.isNaN(ejId)) {
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
