// /app/api/ejournal/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      subtitle,
      series,
      sub_series_number,
      vendor,
      description,
      notes,
      publisher,
      data_source,
      cjk_title,
      romanized_title,
      journals, // required number
      dbs, // optional number | ""
      language, // number[] | string[]
      libraryyear, // required number
      is_global,
    } = body;

    const year = Number(libraryyear);
    if (!Number.isFinite(year)) {
      return NextResponse.json(
        { error: "Missing or invalid libraryyear" },
        { status: 400 }
      );
    }

    const j = Number(journals);
    if (!Number.isFinite(j)) {
      return NextResponse.json(
        { error: "Missing or invalid journals count" },
        { status: 400 }
      );
    }

    const d = dbs == null || dbs === "" ? null : Number(dbs);

    const newJournal = await db.$transaction(async (tx) => {
      // 1) parent row
      const journal = await tx.list_EJournal.create({
        data: {
          title: title?.trim() ?? null,
          subtitle: subtitle?.trim() ?? null,
          series: series?.trim() ?? null,
          sub_series_number: sub_series_number?.trim() ?? null,
          vendor: vendor?.trim() ?? null,
          description: description?.trim() ?? null,
          notes: notes?.trim() ?? null,
          publisher: publisher?.trim() ?? null,
          data_source: data_source?.trim() ?? null,
          cjk_title: cjk_title?.trim() ?? null,
          romanized_title: romanized_title?.trim() ?? null,
          is_global: Boolean(is_global),
          updated_at: new Date(),
          libraryyear: year,
        },
      });

      // 2) m-m link
      await tx.libraryYear_ListEJournal.create({
        data: { libraryyear_id: year, listejournal_id: journal.id },
      });

      // 3) per-year counts
      await tx.list_EJournal_Counts.create({
        data: {
          listejournal: journal.id,
          year: year,
          journals: j,
          dbs: d, // may be null
          updatedat: new Date(),
          ishidden: false,
        },
      });

      // 4) languages
      if (Array.isArray(language) && language.length) {
        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({
            listejournal_id: journal.id,
            language_id: langId,
          }));

        if (rows.length) {
          await tx.list_EJournal_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }

      return journal;
    });

    return NextResponse.json({ success: true, newJournal });
  } catch (err: any) {
    console.error("E-Journal create failed:", err);
    return NextResponse.json(
      { error: "Failed to create E-Journal", detail: err?.message },
      { status: 500 }
    );
  }
}
