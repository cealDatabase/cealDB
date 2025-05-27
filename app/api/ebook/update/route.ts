import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, counts, language, ...updateData } = body;
    const numericId = Number(id);

    // Update the main List_EBook record
    await db.list_EBook.update({
      where: { id: numericId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });

    // Update or create counts entry
    const existingCounts = await db.list_EBook_Counts.findFirst({
      where: { listebook: numericId },
    });

    if (existingCounts) {
      await db.list_EBook_Counts.update({
        where: { id: existingCounts.id },
        data: {
          titles: Number(counts),
          updatedat: new Date(),
        },
      });
    } else {
      await db.list_EBook_Counts.create({
        data: {
          listebook: numericId,
          titles: Number(counts),
          updatedat: new Date(),
          ishidden: false,
        },
      });
    }

    // Update language mappings
    if (Array.isArray(language)) {
      await db.list_EBook_Language.deleteMany({
        where: { listebook_id: numericId },
      });

      await db.list_EBook_Language.createMany({
        data: language
          .map((langId: string) => Number(langId))
          .filter((id) => !isNaN(id))
          .map((id) => ({
            listebook_id: numericId,
            language_id: id,
          })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to update Ebook." },
      { status: 500 }
    );
  }
}
