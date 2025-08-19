import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, counts, volumes, chapters, language, year, ...updateData } =
      body;

    const ebookId = Number(id);
    if (!Number.isFinite(ebookId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const y = Number(year);
    if (!Number.isFinite(y)) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    const titles = Number.isFinite(Number(counts)) ? Number(counts) : 0;
    const vol = volumes == null || volumes === "" ? null : Number(volumes);
    const ch = chapters == null || chapters === "" ? null : Number(chapters);

    await db.$transaction(async (tx) => {
      // main
      await tx.list_EBook.update({
        where: { id: ebookId },
        data: { ...updateData, updated_at: new Date() },
      });

      // manual upsert by (listebook, year)
      const { count } = await tx.list_EBook_Counts.updateMany({
        where: { listebook: ebookId, year: y },
        data: {
          titles,
          volumes: vol,
          chapters: ch,
          updatedat: new Date(),
          ishidden: false,
        },
      });
      if (count === 0) {
        await tx.list_EBook_Counts.create({
          data: {
            listebook: ebookId,
            year: y,
            titles,
            volumes: vol,
            chapters: ch,
            updatedat: new Date(),
            ishidden: false,
          },
        });
      }

      // languages (replace set)
      if (Array.isArray(language)) {
        await tx.list_EBook_Language.deleteMany({
          where: { listebook_id: ebookId },
        });
        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({ listebook_id: ebookId, language_id: langId }));
        if (rows.length) {
          await tx.list_EBook_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error (update Ebook):", error);
    return NextResponse.json(
      { error: "Failed to update Ebook.", detail: error?.message },
      { status: 500 }
    );
  }
}
