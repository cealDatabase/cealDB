// /app/api/av/create/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logUserAction } from "@/lib/auditLogger";

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
      year, // year number from form
      is_global,
      library_id, // optional library ID for member-created entries
    } = body;

    // ✅ Validate required fields
    const yearNum = Number(year);
    if (!yearNum || isNaN(yearNum)) {
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
            year: yearNum,
            library: Number(library_id)
          },
          select: { id: true }
        });

        if (!libraryYearRecord) {
          return NextResponse.json(
            { error: `Library year ${yearNum} not found for your institution. Please ensure the year is open for editing.` },
            { status: 404 }
          );
        }
        libraryYearId = libraryYearRecord.id;
      } else {
        // Admin-created entry: find any Library_Year by year
        const libraryYearRecord = await db.library_Year.findFirst({
          where: { year: yearNum },
          select: { id: true }
        });

        if (!libraryYearRecord) {
          return NextResponse.json(
            { error: `Library year ${yearNum} not found. Please ensure the year exists in the system.` },
            { status: 404 }
          );
        }
        libraryYearId = libraryYearRecord.id;
      }
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
        libraryyear: libraryYearId,
      },
    });

    // ✅ Step 2: Link to Library_Year (m-m) - only for non-global records
    if (!is_global && libraryYearId) {
      await db.libraryYear_ListAV.createMany({
        data: [{ libraryyear_id: libraryYearId, listav_id: newAV.id }],
        skipDuplicates: true,
      });
    }

    // ✅ Step 3: Create AV counts entry
    await db.list_AV_Counts.upsert({
      where: {
        listav_year_unique: {
          listav: newAV.id,
          year: yearNum,
        },
      },
      update: {
        titles: Number(counts),
        updatedat: new Date(),
        ishidden: false,
      },
      create: {
        titles: Number(counts),
        year: yearNum,
        updatedat: new Date(),
        ishidden: false,
        listav: newAV.id,
      },
    });

    // ✅ Step 4: Insert languages
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
          skipDuplicates: true,
        });
      }
    }

    // ✅ Log successful creation
    await logUserAction(
      'CREATE',
      'List_AV',
      newAV.id.toString(),
      undefined, // oldValues
      {
        title: newAV.title,
        type: newAV.type,
        year: yearNum,
        counts: Number(counts),
        languages: language.length,
      },
      true, // success
      undefined, // errorMessage
      req
    );

    // ✅ Return response
    return NextResponse.json({ 
      success: true, 
      newAV,
      message: `AV entry "${title}" created successfully for year ${yearNum}`,
      data: {
        id: newAV.id,
        title: newAV.title,
        type: newAV.type,
        year: yearNum,
        counts: Number(counts),
        languages: language.length,
      }
    });
  } catch (error: any) {
    console.error("API error (create AV):", error);

    // Log failed creation
    await logUserAction(
      'CREATE',
      'List_AV',
      undefined, // recordId
      undefined, // oldValues
      undefined, // newValues
      false, // success
      error?.message || 'Unknown error',
      req
    );

    // Handle Prisma P2002 unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: "Duplicate entry detected", 
          detail: "A record with these values already exists. Please check your data and try again.",
          field: error.meta?.target || 'unknown'
        },
        { status: 409 } // Conflict status
      );
    }
    
    // Handle other Prisma errors
    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: "Database error", detail: "Please try again or contact support." },
        { status: 500 }
      );
    }

    // Handle general errors
    return NextResponse.json(
      { error: "Failed to create AV record", detail: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
