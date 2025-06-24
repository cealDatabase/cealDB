import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, counts, language, ...updateData } = body;
    const numericId = Number(id);

    console.log("Updating Ejournal with:", {
      id: numericId,
      counts,
      language,
      updateData,
    });

    // Update the main List_EJournal record
    await db.list_EJournal.update({
      where: { id: numericId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });

    // Update or create counts entry
    const existingCounts = await db.list_EJournal_Counts.findFirst({
      where: { listejournal: numericId },
    });

    if (existingCounts) {
      await db.list_EJournal_Counts.update({
        where: { id: existingCounts.id },
        data: {
          journals: Number(counts),
          updatedat: new Date(),
        },
      });
    } else {
      await db.list_EJournal_Counts.create({
        data: {
          listejournal: numericId,
          journals: Number(counts),
          updatedat: new Date(),
          ishidden: false,
        },
      });
    }

    // Update language mappings
    if (Array.isArray(language)) {
      await db.list_EJournal_Language.deleteMany({
        where: { listejournal_id: numericId },
      });

      await db.list_EJournal_Language.createMany({
        data: language
          .map((langId: string) => Number(langId))
          .filter((id) => !isNaN(id))
          .map((id) => ({
            listejournal_id: numericId,
            language_id: id,
          })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to update Ejournal." },
      { status: 500 }
    );
  }
}
