// /app/api/ebook/edit/route.ts
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
      sub_series_number,
      titles,
      volumes,
      chapters,
      language,
    } = body;

    // Validate required fields
    const ebookId = Number(id);
    const libraryId = Number(libid);
    const yearNum = Number(year);

    if (!Number.isFinite(ebookId)) {
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
    const originalRecord = await db.list_EBook.findUnique({
      where: { id: ebookId },
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
    const safeTitles = Number.isFinite(Number(titles)) ? Number(titles) : 0;
    const safeVolumes = Number.isFinite(Number(volumes)) ? Number(volumes) : 0;
    const safeChapters = Number.isFinite(Number(chapters)) ? Number(chapters) : 0;

    let resultRecord: any;
    let isNewRecord = false;

    // KEY LOGIC: If the record is global, create a NEW library-specific record
    if (originalRecord.is_global) {
      console.log("Original record is global - creating library-specific copy");

      // Create a NEW library-specific record
      const newEBook = await db.$transaction(async (tx) => {
        // 1) Create new List_EBook record
        const ebook = await tx.list_EBook.create({
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            sub_series_number: sub_series_number?.trim() || null,
            is_global: false, // IMPORTANT: NOT global
            libraryyear: libraryYearId,
            updated_at: new Date(),
          },
        });

        // 2) Create counts for the year
        await tx.list_EBook_Counts.create({
          data: {
            listebook: ebook.id,
            year: yearNum,
            titles: safeTitles,
            volumes: safeVolumes,
            chapters: safeChapters,
            updatedat: new Date(),
            ishidden: false,
          },
        });

        // 3) Link languages
        if (Array.isArray(language) && language.length > 0) {
          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listebook_id: ebook.id,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_EBook_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        // 4) Keep subscription to global record (don't delete it!)
        // The library should remain subscribed to the global record
        // This maintains the relationship while having custom counts

        // 5) Add new subscription (library-specific record)
        await tx.libraryYear_ListEBook.create({
          data: {
            libraryyear_id: libraryYearId,
            listebook_id: ebook.id,
          },
        });

        return ebook;
      });

      resultRecord = newEBook;
      isNewRecord = true;

      await logUserAction(
        "CREATE",
        "List_EBook",
        newEBook.id.toString(),
        { original_id: ebookId, is_global: true },
        {
          title: newEBook.title,
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
        const ebook = await tx.list_EBook.update({
          where: { id: ebookId },
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            sub_series_number: sub_series_number?.trim() || null,
            updated_at: new Date(),
          },
        });

        // 2) Update counts for the year
        await tx.list_EBook_Counts.updateMany({
          where: { listebook: ebookId, year: yearNum },
          data: { 
            titles: safeTitles, 
            volumes: safeVolumes,
            chapters: safeChapters,
            updatedat: new Date() 
          },
        });

        // 3) Update languages (replace set)
        if (Array.isArray(language)) {
          await tx.list_EBook_Language.deleteMany({ where: { listebook_id: ebookId } });

          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listebook_id: ebookId,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_EBook_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        return ebook;
      });

      resultRecord = updated;

      await logUserAction(
        "UPDATE",
        "List_EBook",
        ebookId.toString(),
        undefined,
        { title: updated.title },
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
    console.error("API error (edit E-Book):", error);

    await logUserAction(
      "UPDATE",
      "List_EBook",
      undefined,
      undefined,
      undefined,
      false,
      error?.message || "Unknown error",
      req
    );

    return NextResponse.json(
      { error: "Failed to edit E-Book record", detail: error?.message },
      { status: 500 }
    );
  }
}
