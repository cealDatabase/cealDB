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
      year, // year value from form
      is_global,
    } = body;

    // ✅ Validate required fields
    if (!year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(language) || language.length === 0) {
      return NextResponse.json(
        { error: "At least one language must be selected" },
        { status: 400 }
      );
    }

    if (counts === undefined || isNaN(Number(counts)) || Number(counts) < 0) {
      return NextResponse.json(
        { error: "Missing or invalid counts" },
        { status: 400 }
      );
    }

    // ✅ Step 1: Create main AV entry
    const newAV = await db.list_AV.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        publisher: publisher?.trim() || null,
        data_source: data_source?.trim() || null,
        cjk_title: cjk_title?.trim() || null,
        romanized_title: romanized_title?.trim() || null,
        type: type.trim() || null,
        is_global: is_global ?? false,
        updated_at: new Date(),
      },
    });

    // ✅ Step 2: Create AV counts entry
    await db.list_AV_Counts.upsert({
      where: {
        listav_year_unique: {
          listav: newAV.id,
          year: Number(year),
        },
      },
      update: {
        titles: Number(counts),
        updatedat: new Date(),
        ishidden: false,
      },
      create: {
        titles: Number(counts),
        year: Number(year),
        updatedat: new Date(),
        ishidden: false,
        listav: newAV.id,
      },
    });

    // ✅ Step 3: Insert languages
    if (Array.isArray(language) && language.length > 0) {
      const languageEntries = language
        .filter(langId => !isNaN(Number(langId)))
        .map(langId => ({
          listav_id: newAV.id,
          language_id: Number(langId),
        }));
      
      if (languageEntries.length > 0) {
        await db.list_AV_Language.createMany({
          data: languageEntries,
        });
      }
    }

    // ✅ Return response
    return NextResponse.json({ 
      success: true, 
      newAV,
      message: `AV entry "${title}" created successfully for year ${year}`,
      data: {
        id: newAV.id,
        title: newAV.title,
        type: newAV.type,
        year: Number(year),
        counts: Number(counts),
        languages: language.length,
      }
    });
  } catch (error: any) {
    console.error("API error (create AV):", error);

    return NextResponse.json(
      { error: "Failed to create AV record", detail: error?.message },
      { status: 500 }
    );
  }
}
