// /app/api/ejournal/edit/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Editing E-Journal with body:", body);

    const {
      id, // original record ID
      libid,
      year,
      title,
      subtitle,
      series,
      vendor,
      description,
      notes,
      publisher,
      data_source,
      cjk_title,
      romanized_title,
      journals,
      dbs,
      language,
    } = body;

    // Validate required fields
    const ejournalId = Number(id);
    const libraryId = Number(libid);
    const yearNum = Number(year);

    if (!Number.isFinite(ejournalId)) {
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
    const originalRecord = await db.list_EJournal.findUnique({
      where: { id: ejournalId },
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
    const safeJournals = Number.isFinite(Number(journals)) ? Number(journals) : 0;
    const safeDbs = Number.isFinite(Number(dbs)) ? Number(dbs) : 0;

    let resultRecord: any;
    let isNewRecord = false;

    // KEY LOGIC: If the record is global, create a NEW library-specific record
    if (originalRecord.is_global) {
      console.log("Original record is global - creating library-specific copy");

      // Create a NEW library-specific record
      const newEJournal = await db.$transaction(async (tx) => {
        // 1) Create new List_EJournal record
        const ejournal = await tx.list_EJournal.create({
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            series: series?.trim() || null,
            vendor: vendor?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            is_global: false, // IMPORTANT: NOT global
            libraryyear: libraryYearId,
            updated_at: new Date(),
          },
        });

        // 2) Create counts for the year
        await tx.list_EJournal_Counts.create({
          data: {
            listejournal: ejournal.id,
            year: yearNum,
            journals: safeJournals,
            dbs: safeDbs,
            updatedat: new Date(),
            ishidden: false,
          },
        });

        // 3) Link languages
        if (Array.isArray(language) && language.length > 0) {
          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listejournal_id: ejournal.id,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_EJournal_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        // 4) Remove old subscription (global record)
        await tx.libraryYear_ListEJournal.deleteMany({
          where: {
            libraryyear_id: libraryYearId,
            listejournal_id: ejournalId,
          },
        });

        // 5) Add new subscription (library-specific record)
        await tx.libraryYear_ListEJournal.create({
          data: {
            libraryyear_id: libraryYearId,
            listejournal_id: ejournal.id,
          },
        });

        return ejournal;
      });

      resultRecord = newEJournal;
      isNewRecord = true;

      await logUserAction(
        "CREATE",
        "List_EJournal",
        newEJournal.id.toString(),
        { original_id: ejournalId, is_global: true },
        {
          title: newEJournal.title,
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
        const ejournal = await tx.list_EJournal.update({
          where: { id: ejournalId },
          data: {
            title: title.trim(),
            subtitle: subtitle?.trim() || null,
            series: series?.trim() || null,
            vendor: vendor?.trim() || null,
            description: description?.trim() || null,
            notes: notes?.trim() || null,
            publisher: publisher?.trim() || null,
            data_source: data_source?.trim() || null,
            cjk_title: cjk_title?.trim() || null,
            romanized_title: romanized_title?.trim() || null,
            updated_at: new Date(),
          },
        });

        // 2) Update counts for the year
        await tx.list_EJournal_Counts.updateMany({
          where: { listejournal: ejournalId, year: yearNum },
          data: { journals: safeJournals, dbs: safeDbs, updatedat: new Date() },
        });

        // 3) Update languages (replace set)
        if (Array.isArray(language)) {
          await tx.list_EJournal_Language.deleteMany({ where: { listejournal_id: ejournalId } });

          const languageEntries = language
            .filter((langId) => !isNaN(Number(langId)))
            .map((langId) => ({
              listejournal_id: ejournalId,
              language_id: Number(langId),
            }));

          if (languageEntries.length > 0) {
            await tx.list_EJournal_Language.createMany({
              data: languageEntries,
              skipDuplicates: true,
            });
          }
        }

        return ejournal;
      });

      resultRecord = updated;

      await logUserAction(
        "UPDATE",
        "List_EJournal",
        ejournalId.toString(),
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
    console.error("API error (edit E-Journal):", error);

    await logUserAction(
      "UPDATE",
      "List_EJournal",
      undefined,
      undefined,
      undefined,
      false,
      error?.message || "Unknown error",
      req
    );

    return NextResponse.json(
      { error: "Failed to edit E-Journal record", detail: error?.message },
      { status: 500 }
    );
  }
}
