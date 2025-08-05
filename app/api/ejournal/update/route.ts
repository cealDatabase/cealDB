// /app/api/ejournal/update/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    /*───────────────────────────────
     * 1.  Parse & validate payload
     *───────────────────────────────*/
    const body = await req.json();

    const {
      id,
      year, // survey year (needed for counts row)
      journals, // number of individual journals
      dbs, // number of databases (optional)
      language, // array of language-id (string|number)
      ...updateData // scalar fields for List_EJournal
    } = body;

    const ejId = Number(id);
    if (isNaN(ejId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    if (!year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    /*───────────────────────────────
     * 2.  Run everything in one tx
     *───────────────────────────────*/
    await db.$transaction(async (tx) => {
      /* 2-A update parent row  */
      await tx.list_EJournal.update({
        where: { id: ejId },
        data: {
          ...updateData, // title, vendor, series, etc.
          updated_at: new Date(),
        },
      });

      /* 2-B upsert counts row without composite key */
      const existing = await tx.list_EJournal_Counts.findFirst({
        where: { listejournal: ejId, year: Number(year) },
      });

      if (existing) {
        await tx.list_EJournal_Counts.update({
          where: { id: existing.id },
          data: {
            journals: Number(journals),
            dbs: dbs ? Number(dbs) : null,
            updatedat: new Date(),
          },
        });
      } else {
        await tx.list_EJournal_Counts.create({
          data: {
            listejournal: ejId,
            year: Number(year),
            journals: Number(journals),
            dbs: dbs ? Number(dbs) : null,
            updatedat: new Date(),
            ishidden: false,
          },
        });
      }

      /* 2-C replace language mappings */
      await tx.list_EJournal_Language.deleteMany({
        where: { listejournal_id: ejId },
      });

      if (Array.isArray(language) && language.length) {
        await tx.list_EJournal_Language.createMany({
          data: language
            .map((id: string | number) => Number(id))
            .filter((n) => !isNaN(n))
            .map((langId) => ({
              listejournal_id: ejId,
              language_id: langId,
            })),
        });
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
