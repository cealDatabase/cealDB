// /app/api/av/update/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    // Debug logging
    console.log('🔧 AV Update Request:', {
      avId,
      year: y,
      counts: safeCounts,
      originalCounts: counts,
    });

    const updated = await db.$transaction(async (tx) => {
      // 1) main row
      const av = await tx.list_AV.update({
        where: { id: avId },
        data: { ...updateData, updated_at: new Date() },
      });

      // 2) counts for the selected year (use the composite unique)
      if (y !== null) {
        const countsResult = await tx.list_AV_Counts.upsert({
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
        console.log('✅ Counts updated:', countsResult);
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

    // Verify the update in the database
    if (y !== null) {
      const verifyCount = await db.list_AV_Counts.findFirst({
        where: { listav: avId, year: y }
      });
      console.log('🔍 Verify count in DB:', verifyCount);
    }

    // Revalidate the AV list pages to show updated counts
    if (y !== null) {
      revalidatePath(`/admin/survey/avdb/${y}`);
      revalidatePath('/admin/survey/avdb');
      console.log(`✨ Revalidated paths for year ${y}`);
    }

    return NextResponse.json({ success: true, id: updated.id, counts: safeCounts });
  } catch (error: any) {
    console.error("API error (update AV):", error);
    return NextResponse.json(
      { error: "Failed to update AV record.", detail: error?.message },
      { status: 500 }
    );
  }
}
