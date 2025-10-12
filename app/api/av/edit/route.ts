// /app/api/av/edit/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id, // original record ID
      libid,
      year,
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
    } = body;

    // Validate required fields
    const avId = Number(id);
    const libraryId = Number(libid);
    const yearNum = Number(year);

    if (!Number.isFinite(avId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    if (!Number.isFinite(libraryId)) {
      return NextResponse.json({ error: "Invalid library ID" }, { status: 400 });
    }

    if (!Number.isFinite(yearNum)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Fetch the original record to check if it's global
    const originalRecord = await db.list_AV.findUnique({
      where: { id: avId },
      select: { is_global: true },
    });

    if (!originalRecord) {
      return NextResponse.json(
        { error: "Original record not found" },
        { status: 404 }
      );
    }

    // Find or create Library_Year record
    let libraryYearRecord = await db.library_Year.findFirst({
      where: { library: libraryId, year: yearNum },
    });

    if (!libraryYearRecord) {
      libraryYearRecord = await db.library_Year.create({
        data: {
          library: libraryId,
          year: yearNum,
          updated_at: new Date(),
          is_open_for_editing: true,
          is_active: true,
        },
      });
    }

    const libraryYearId = libraryYearRecord.id;
    const safeCounts = Number.isFinite(Number(counts)) ? Number(counts) : 0;

    let resultRecord: any;
    let isNewRecord = false;

    // KEY LOGIC: If the record is global, create a NEW library-specific record
    if (originalRecord.is_global) {
      console.log("Original record is global - creating library-specific copy");

      // Create a NEW library-specific record
      const newAV = await db.$transaction(async (tx) => {
        // 1) Create new List_AV record
        const av = await tx.list_AV.create({
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            type: type?.trim() || null,
            is_global: false, // IMPORTANT: NOT global
            libraryyear: libraryYearId,
            updated_at: new Date(),
          },
        });

        // 2) Create counts for the year
        await tx.list_AV_Counts.create({
          data: {
            listav: av.id,
            year: yearNum,
            titles: safeCounts,
            updatedat: new Date(),
            ishidden: false,
          },
        });

        // 3) Link languages
        if (Array.isArray(language) && language.length > 0) {
          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listav_id: av.id,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_AV_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        // 4) Keep subscription to global record (don't delete it!)
        // The library should remain subscribed to the global record
        // This maintains the relationship while having custom counts

        // 5) Add new subscription (library-specific record)
        await tx.libraryYear_ListAV.create({
          data: {
            libraryyear_id: libraryYearId,
            listav_id: av.id,
          },
        });

        return av;
      });

      resultRecord = newAV;
      isNewRecord = true;

      await logUserAction(
        "CREATE",
        "List_AV",
        newAV.id.toString(),
        { original_id: avId, is_global: true },
        {
          title: newAV.title,
          type: newAV.type,
          is_global: false,
          libraryyear: libraryYearId,
        },
        true,
        undefined,
        req
      );
    } else {
      // Record is already library-specific - just update it
      console.log("Record is library-specific - updating in place");

      const updated = await db.$transaction(async (tx) => {
        // 1) Update main record
        const av = await tx.list_AV.update({
          where: { id: avId },
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            type: type?.trim() || null,
            updated_at: new Date(),
          },
        });

        // 2) Update counts for the year
        await tx.list_AV_Counts.upsert({
          where: { listav_year_unique: { listav: avId, year: yearNum } },
          update: { titles: safeCounts, updatedat: new Date() },
          create: {
            listav: avId,
            year: yearNum,
            titles: safeCounts,
            updatedat: new Date(),
            ishidden: false,
          },
        });

        // 3) Update languages (replace set)
        if (Array.isArray(language)) {
          await tx.list_AV_Language.deleteMany({ where: { listav_id: avId } });

          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listav_id: avId,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_AV_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        return av;
      });

      resultRecord = updated;

      await logUserAction(
        "UPDATE",
        "List_AV",
        avId.toString(),
        undefined,
        {
          title: updated.title,
          type: updated.type,
        },
        true,
        undefined,
        req
      );
    }

    return NextResponse.json({
      success: true,
      id: resultRecord.id,
      isNewRecord,
      message: isNewRecord
        ? "Created library-specific copy successfully"
        : "Updated record successfully",
    });
  } catch (error: any) {
    console.error("API error (edit AV):", error);

    await logUserAction(
      "UPDATE",
      "List_AV",
      undefined,
      undefined,
      undefined,
      false,
      error?.message || "Unknown error",
      req
    );

    return NextResponse.json(
      { error: "Failed to edit AV record", detail: error?.message },
      { status: 500 }
    );
  }
}
