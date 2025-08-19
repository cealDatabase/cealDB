// /app/api/av/update/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, counts, language, year, ...updateData } = body;

    const avId = Number(id);
    if (!Number.isFinite(avId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const y = year == null ? null : Number(year);
    const safeCounts = Number.isFinite(Number(counts)) ? Number(counts) : 0;

    const updated = await db.$transaction(async (tx) => {
      // 1) main row
      const av = await tx.list_AV.update({
        where: { id: avId },
        data: { ...updateData, updated_at: new Date() },
      });

      // 2) counts for the selected year (use the composite unique)
      if (y !== null) {
        await tx.list_AV_Counts.upsert({
          where: { listav_year_unique: { listav: avId, year: y } },
          update: { titles: safeCounts, updatedat: new Date() },
          create: {
            listav: avId,
            year: y,
            titles: safeCounts,
            updatedat: new Date(),
            ishidden: false,
          },
        });
      }

      // 3) languages (replace set)
      if (Array.isArray(language)) {
        await tx.list_AV_Language.deleteMany({ where: { listav_id: avId } });

        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({ listav_id: avId, language_id: langId }));

        if (rows.length) {
          await tx.list_AV_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }

      return av;
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error: any) {
    console.error("API error (update AV):", error);
    return NextResponse.json(
      { error: "Failed to update AV record.", detail: error?.message },
      { status: 500 }
    );
  }
}
