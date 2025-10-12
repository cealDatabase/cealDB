// /app/api/ejournal/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
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
      journals, // required number
      dbs, // optional number | ""
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

    const j = Number(journals);
    if (!Number.isFinite(j)) {
      return NextResponse.json(
        { error: "Missing or invalid journals count" },
        { status: 400 }
      );
    }

    const d = dbs == null || dbs === "" ? null : Number(dbs);

    const newJournal = await db.$transaction(async (tx) => {
      // 1) parent row
      const journal = await tx.list_EJournal.create({
        data: {
          title: title?.trim() ?? null,
          subtitle: subtitle?.trim() ?? null,
          series: series?.trim() ?? null,
          vendor: vendor?.trim() ?? null,
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

      // 2) m-m link - only for non-global records
      if (!is_global && libraryYearId) {
        await tx.libraryYear_ListEJournal.createMany({
          data: [{ libraryyear_id: libraryYearId, listejournal_id: journal.id }],
          skipDuplicates: true,
        });
      }

      // 3) per-year counts
      await tx.list_EJournal_Counts.create({
        data: {
          listejournal: journal.id,
          year: year,
          journals: j,
          dbs: d, // may be null
          updatedat: new Date(),
          ishidden: false,
        },
      });

      // 4) languages
      if (Array.isArray(language) && language.length) {
        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({
            listejournal_id: journal.id,
            language_id: langId,
          }));

        if (rows.length) {
          await tx.list_EJournal_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }

      return journal;
    });

    return NextResponse.json({ success: true, newJournal });
  } catch (err: any) {
    console.error("E-Journal create failed:", err);
    
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
      { error: "Failed to create E-Journal", detail: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
