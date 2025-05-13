import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, counts, language, ...updateData } = body;

    const numericId = Number(id);

    // ✅ Update the main List_AV entry
    await db.list_AV.update({
      where: { id: numericId },
      data: { ...updateData, updated_at: new Date() },
    });

    // ✅ Update or create a counts record
    const existingCounts = await db.list_AV_Counts.findFirst({
      where: { listav: numericId },
    });

    if (existingCounts) {
      await db.list_AV_Counts.update({
        where: { id: existingCounts.id },
        data: { titles: Number(counts), updatedat: new Date() },
      });
    } else {
      await db.list_AV_Counts.create({
        data: {
          listav: numericId,
          titles: Number(counts),
          updatedat: new Date(),
          ishidden: false, // or whatever default value is appropriate
        },
      });
    }

    // ✅ Replace List_AV_Language records
    if (Array.isArray(language)) {
      await db.list_AV_Language.deleteMany({ where: { listav_id: numericId } });

      // console.log("Parsed language IDs:", language);

      await db.list_AV_Language.createMany({
        data: language
          .map((langId: string) => Number(langId))
          .filter((n) => !isNaN(n))
          .map((validId) => ({ listav_id: numericId, language_id: validId })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to update AV record." },
      { status: 500 }
    );
  }
}
