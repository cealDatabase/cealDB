import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  // ✅ Await the context, then pull out id
  const {
    params: { id },
  } = await context;

  const avId = Number(id);
  if (isNaN(avId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // delete children first (RESTRICT on FK’s)
    await db.$transaction([
      db.list_AV_Language.deleteMany({ where: { listav_id: avId } }),
      db.list_AV_Counts.deleteMany({ where: { listav: avId } }),
      db.libraryYear_ListAV.deleteMany({ where: { listav_id: avId } }),
      db.list_AV.delete({ where: { id: avId } }),
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
