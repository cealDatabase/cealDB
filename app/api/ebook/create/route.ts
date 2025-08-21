// /app/api/ebook/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      subtitle,
      description,
      notes,
      publisher,
      data_source,
      cjk_title,
      romanized_title,
      sub_series_number,
      counts, // required number
      volumes, // optional number | ""
      chapters, // optional number | ""
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
    if (counts === undefined || !Number.isFinite(Number(counts))) {
      return NextResponse.json(
        { error: "Missing or invalid counts" },
        { status: 400 }
      );
    }

    const titles = Number(counts);
    const vol = volumes == null || volumes === "" ? null : Number(volumes);
    const ch = chapters == null || chapters === "" ? null : Number(chapters);

    const newBook = await db.$transaction(async (tx) => {
      // 1) Parent row
      const book = await tx.list_EBook.create({
        data: {
          title: title?.trim() ?? null,
          subtitle: subtitle?.trim() ?? null,
          sub_series_number: sub_series_number?.trim() ?? null,
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

      // 2) Link to Library_Year (m–m)
      await tx.libraryYear_ListEBook.create({
        data: { libraryyear_id: year, listebook_id: book.id },
      });

      // 3) Per-year counts row (includes volumes/chapters)
      await tx.list_EBook_Counts.create({
        data: {
          listebook: book.id,
          year,
          titles,
          volumes: vol,
          chapters: ch,
          updatedat: new Date(),
          ishidden: false,
        },
      });

      // 4) Languages
      if (Array.isArray(language) && language.length) {
        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({ listebook_id: book.id, language_id: langId }));

        if (rows.length) {
          await tx.list_EBook_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }

      return book;
    });

    return NextResponse.json({ success: true, newBook });
  } catch (err: any) {
    console.error("EBook create failed:", err);
    return NextResponse.json(
      { error: "Failed to create E-Book", detail: err?.message },
      { status: 500 }
    );
  }
}
