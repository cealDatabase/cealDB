// /app/api/av/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Creating AV with body:", body);

    const {
      title,
      subtitle,
      description,
      notes,
      publisher,
      data_source,
      cjk_title,
      romanized_title,
      type,
      counts,
      language,
      libraryyear, // should be a number
      is_global,
    } = body;

    // ✅ Validate required fields
    if (!libraryyear || isNaN(Number(libraryyear))) {
      return NextResponse.json(
        { error: "Missing or invalid libraryyear" },
        { status: 400 }
      );
    }

    if (!counts || isNaN(Number(counts))) {
      return NextResponse.json(
        { error: "Missing or invalid counts" },
        { status: 400 }
      );
    }

    // ✅ Optional: confirm related records exist
    const existingYear = await db.library_Year.findUnique({
      where: { id: Number(libraryyear) },
    });
    if (!existingYear) {
      return NextResponse.json(
        { error: "libraryyear ID does not exist" },
        { status: 404 }
      );
    }

    // ✅ Step 1: Create main AV entry
    const newAV = await db.list_AV.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        notes: notes || null,
        publisher: publisher || null,
        data_source: data_source || null,
        cjk_title: cjk_title || null,
        romanized_title: romanized_title || null,
        type: type || null,
        is_global: is_global ?? false,
        updated_at: new Date(),
        libraryyear: Number(libraryyear),
      },
    });

    // ✅ Step 2: Link AV to year in LibraryYear_ListAV
    await db.libraryYear_ListAV.create({
      data: {
        libraryyear_id: Number(libraryyear),
        listav_id: newAV.id,
      },
    });

    // ✅ Step 3: Insert into List_AV_Counts
    await db.list_AV_Counts.create({
      data: {
        titles: Number(counts),
        year: Number(libraryyear), // 👈 add this
        updatedat: new Date(),
        ishidden: false,
        listav: newAV.id,
      },
    });

    // ✅ Step 4: Insert languages (safely with individual inserts)
    if (Array.isArray(language) && language.length > 0) {
      for (const langId of language) {
        if (!isNaN(Number(langId))) {
          await db.list_AV_Language.create({
            data: {
              listav_id: newAV.id,
              language_id: Number(langId),
            },
          });
        }
      }
    }

    // ✅ Return response
    return NextResponse.json({ success: true, newAV });
  } catch (error: any) {
    console.error("API error (create AV):", error);

    return NextResponse.json(
      { error: "Failed to create AV record", detail: error?.message },
      { status: 500 }
    );
  }
}
