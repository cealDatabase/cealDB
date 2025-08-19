// app/api/ebook/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = { id: string };

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params; // ✅ await params
  const ebookId = Number(id);
  if (Number.isNaN(ebookId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await db.$transaction([
      db.list_EBook_Language.deleteMany({ where: { listebook_id: ebookId } }),
      db.list_EBook_Counts.deleteMany({ where: { listebook: ebookId } }),
      db.libraryYear_ListEBook.deleteMany({ where: { listebook_id: ebookId } }),
      db.list_EBook.delete({ where: { id: ebookId } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete E-Book failed:", err);
    return NextResponse.json(
      { error: "Failed to delete E-Book", detail: err?.message },
      { status: 500 }
    );
  }
}
