// /app/api/ebook/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db"; // <- your Prisma client wrapper

export async function POST(req: Request) {
  /*──────────────────────────────
   * 1.  Parse + basic validation
   *──────────────────────────────*/
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
    counts, // total titles / records
    volumes,
    chapters,
    language, // array of language-id numbers
    libraryyear,
    is_global,
  } = body;

  if (!libraryyear || isNaN(+libraryyear)) {
    return NextResponse.json(
      { error: "Missing or invalid libraryyear" },
      { status: 400 }
    );
  }
  if (counts === undefined || isNaN(+counts)) {
    return NextResponse.json(
      { error: "Missing or invalid counts" },
      { status: 400 }
    );
  }

  /*──────────────────────────────
   * 2.  Create parent List_EBook
   *──────────────────────────────*/
  const newBook = await db.list_EBook.create({
    data: {
      title: title || null,
      subtitle: subtitle || null,
      sub_series_number: sub_series_number || null,
      description: description || null,
      notes: notes || null,
      publisher: publisher || null,
      data_source: data_source || null,
      cjk_title: cjk_title || null,
      romanized_title: romanized_title || null,
      is_global: is_global ?? false,
      updated_at: new Date(),
      libraryyear: +libraryyear,
    },
  });

  /*──────────────────────────────
   * 3.  Link to Library_Year (m-m)
   *──────────────────────────────*/
  await db.libraryYear_ListEBook.create({
    data: {
      libraryyear_id: +libraryyear,
      listebook_id: newBook.id,
    },
  });

  /*──────────────────────────────
   * 4.  Insert counts row
   *──────────────────────────────*/
  await db.list_EBook_Counts.create({
    data: {
      titles: +counts,
      volumes: volumes ? +volumes : null,
      chapters: chapters ? +chapters : null,
      year: +libraryyear,
      updatedat: new Date(),
      ishidden: false,
      listebook: newBook.id,
    },
  });

  /*──────────────────────────────
   * 5.  Languages (1-n join table)
   *──────────────────────────────*/
  if (Array.isArray(language) && language.length) {
    for (const id of language) {
      if (!isNaN(+id)) {
        await db.list_EBook_Language.create({
          data: {
            listebook_id: newBook.id,
            language_id: +id,
          },
        });
      }
    }
  }

  /*──────────────────────────────*/
  return NextResponse.json({ success: true, newBook });
}
