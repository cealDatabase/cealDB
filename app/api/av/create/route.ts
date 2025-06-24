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
      libraryyear, // this should be a number
      is_global,
    } = body;

    // Step 1: Create main AV entry
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

    // Step 2: Link AV to year in LibraryYear_ListAV
    await db.libraryYear_ListAV.create({
      data: {
        libraryyear_id: Number(libraryyear),
        listav_id: newAV.id,
      },
    });

    // Step 3: Insert into List_AV_Counts
    await db.list_AV_Counts.create({
      data: {
        titles: Number(counts),
        updatedat: new Date(),
        ishidden: false,
        listav: newAV.id,
      },
    });

    // Step 4: Insert languages
    if (Array.isArray(language)) {
      await db.list_AV_Language.createMany({
        data: language.map((langId: string) => ({
          listav_id: newAV.id,
          language_id: Number(langId),
        })),
      });
    }

    return NextResponse.json({ success: true, newAV });
  } catch (error) {
    console.error("API error (create AV):", error);
    return NextResponse.json(
      { error: "Failed to create AV record" },
      { status: 500 }
    );
  }
}
