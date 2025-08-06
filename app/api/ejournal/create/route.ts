// /app/api/ejournal/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
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
    journals, // number of individual journals
    dbs, // number of databases
    language, // array of language-id numbers
    libraryyear,
    is_global,
  } = body;

  /*── basic validation ───────────────────────*/
  if (!libraryyear || isNaN(+libraryyear)) {
    return NextResponse.json(
      { error: "Missing or invalid libraryyear" },
      { status: 400 }
    );
  }
  if (journals === undefined || isNaN(+journals)) {
    return NextResponse.json(
      { error: "Missing or invalid journals count" },
      { status: 400 }
    );
  }

  /*── parent row ─────────────────────────────*/
  const newJournal = await db.list_EJournal.create({
    data: {
      title: title || null,
      subtitle: subtitle || null,
      series: series || null,
      sub_series_number: sub_series_number || null,
      vendor: vendor || null,
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

  /*── m-m link to year ───────────────────────*/
  await db.libraryYear_ListEJournal.create({
    data: {
      libraryyear_id: +libraryyear,
      listejournal_id: newJournal.id,
    },
  });

  /*── counts row ─────────────────────────────*/
  await db.list_EJournal_Counts.create({
    data: {
      journals: +journals,
      dbs: dbs ? +dbs : null,
      year: +libraryyear,
      updatedat: new Date(),
      ishidden: false,
      listejournal: newJournal.id,
    },
  });

  /*── languages ─────────────────────────────*/
  if (Array.isArray(language) && language.length) {
    for (const id of language) {
      if (!isNaN(+id)) {
        await db.list_EJournal_Language.create({
          data: { listejournal_id: newJournal.id, language_id: +id },
        });
      }
    }
  }

  return NextResponse.json({ success: true, newJournal });
}
