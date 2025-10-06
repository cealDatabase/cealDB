// /app/api/ebook/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { handleP2002WithSequenceFix, SEQUENCE_TABLES } from "@/lib/sequenceFixer";

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
      libraryyear, // year number (not Library_Year ID)
      is_global,
      library_id, // optional library ID for member-created entries
    } = body;

    const year = Number(libraryyear);
    if (!Number.isFinite(year)) {
      return NextResponse.json(
        { error: "Missing or invalid year" },
        { status: 400 }
      );
    }

    // For global records, we don't need Library_Year ID
    let libraryYearId = null;
    
    if (!is_global) {
      // For library-specific entries, find the Library_Year record
      if (library_id) {
        // Member-created entry: find Library_Year by both year and library
        const libraryYearRecord = await db.library_Year.findFirst({
          where: { 
            year: year,
            library: Number(library_id)
          },
          select: { id: true }
        });

        if (!libraryYearRecord) {
          return NextResponse.json(
            { error: `Library year ${year} not found for your institution. Please ensure the year is open for editing.` },
            { status: 404 }
          );
        }
        libraryYearId = libraryYearRecord.id;
      } else {
        // Admin-created entry: find any Library_Year by year
        const libraryYearRecord = await db.library_Year.findFirst({
          where: { year: year },
          select: { id: true }
        });

        if (!libraryYearRecord) {
          return NextResponse.json(
            { error: `Library year ${year} not found. Please ensure the year exists in the system.` },
            { status: 404 }
          );
        }
        libraryYearId = libraryYearRecord.id;
      }
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

    const newBook = await handleP2002WithSequenceFix(
      () => db.$transaction(async (tx) => {
        // 1) Parent row - handle potential duplicates gracefully
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
            libraryyear: libraryYearId,
          },
        });

        // 2) Link to Library_Year (m–m) - only for non-global records
        if (!is_global && libraryYearId) {
          await tx.libraryYear_ListEBook.createMany({
            data: [{ libraryyear_id: libraryYearId, listebook_id: book.id }],
            skipDuplicates: true,
          });
        }

        // 3) Per-year counts row - wrapped with sequence fix
        await handleP2002WithSequenceFix(
          () => tx.list_EBook_Counts.create({
            data: {
              listebook: book.id,
              year,
              titles,
              volumes: vol,
              chapters: ch,
              updatedat: new Date(),
              ishidden: false,
            },
          }),
          SEQUENCE_TABLES.EBOOK_COUNTS
        );

        // 4) Languages - already using skipDuplicates
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
      }),
      SEQUENCE_TABLES.EBOOK
    );

    return NextResponse.json({ success: true, newBook });
  } catch (err: any) {
    console.error("EBook create failed:", err);
    
    // Handle Prisma P2002 unique constraint violations
    if (err.code === 'P2002') {
      return NextResponse.json(
        { 
          error: "Duplicate entry detected", 
          detail: "A record with these values already exists. Please check your data and try again.",
          field: err.meta?.target || 'unknown'
        },
        { status: 409 } // Conflict status
      );
    }
    
    // Handle other Prisma errors
    if (err.code?.startsWith('P')) {
      return NextResponse.json(
        { error: "Database error", detail: "Please try again or contact support." },
        { status: 500 }
      );
    }
    
    // Handle general errors
    return NextResponse.json(
      { error: "Failed to create E-Book", detail: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
