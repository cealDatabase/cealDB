// /app/api/ejournal/update/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      year, // required
      journals, // preferred field
      counts, // legacy alias → used if journals is undefined
      dbs, // optional
      language, // number[] or string[]
      ...updateData // scalar fields for List_EJournal
    } = body;

    const ejId = Number(id);
    if (!Number.isFinite(ejId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const y = Number(year);
    if (!Number.isFinite(y)) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    const j = Number.isFinite(Number(journals ?? counts))
      ? Number(journals ?? counts)
      : 0;
    const d = dbs == null || dbs === "" ? null : Number(dbs);

    await db.$transaction(async (tx) => {
      // 1) Update parent row
      await tx.list_EJournal.update({
        where: { id: ejId },
        data: { ...updateData, updated_at: new Date() },
      });

      // 2) Manual upsert of counts by (listejournal, year)
      const { count } = await tx.list_EJournal_Counts.updateMany({
        where: { listejournal: ejId, year: y },
        data: { journals: j, dbs: d, updatedat: new Date(), ishidden: false },
      });

      if (count === 0) {
        await tx.list_EJournal_Counts.create({
          data: {
            listejournal: ejId,
            year: y,
            journals: j,
            dbs: d,
            updatedat: new Date(),
            ishidden: false,
          },
        });
      }

      // 3) Replace language mappings
      await tx.list_EJournal_Language.deleteMany({
        where: { listejournal_id: ejId },
      });

      if (Array.isArray(language) && language.length) {
        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({ listejournal_id: ejId, language_id: langId }));

        if (rows.length) {
          await tx.list_EJournal_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("E-Journal update failed:", error);
    return NextResponse.json(
      { error: "Failed to update E-Journal", detail: error?.message },
      { status: 500 }
    );
  }
}

