// /app/api/ebook/[id]/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  // ✅ first await, then pull out id in a separate step
  const { params } = await context;
  const ebookId = Number(params.id);

  if (isNaN(ebookId)) {
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
