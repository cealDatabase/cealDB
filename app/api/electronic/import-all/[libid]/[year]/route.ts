import { NextResponse } from "next/server";
import db from "@/lib/db";
import { heldAVAccess, heldEBookAccess, heldEJournalAccess } from "@/lib/heldAccess";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { logAuditEvent } from "@/lib/auditLogger";
import { canAccessLibrary } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ libid: string; year: string }> }
) {
  try {
    const { libid, year } = await params;

    // Validate required fields
    if (!libid || isNaN(Number(libid)) || !year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Missing or invalid library ID or year" },
        { status: 400 }
      );
    }

    const libraryId = Number(libid);
    const currentYear = Number(year);

    // One institution's numbers: only for those who may act on it.
    if (!(await canAccessLibrary(libraryId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find Library_Year record for the library and year
    let libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
      select: { id: true, year: true }
    });

    // Super admin: fall back to most recent year if current year not found
    if (!libraryYear) {
      const superAdmin = await isSuperAdmin();
      if (superAdmin) {
        libraryYear = await db.library_Year.findFirst({
          where: { library: libraryId },
          orderBy: { year: 'desc' },
          select: { id: true, year: true }
        });
      }
    }

    if (!libraryYear) {
      return NextResponse.json(
        { error: `Library year ${currentYear} not found for library ${libraryId}` },
        { status: 404 }
      );
    }

    const resolvedYear = libraryYear.year;

    // Initialize aggregated counts
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // 1. E-Books this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const filteredEBooks = (await heldEBookAccess(libraryYear.id, resolvedYear)).map(sub => sub.List_EBook);
    console.log(`[Import All] E-Books held: ${filteredEBooks.length}`);

    // Count number of access records (subscriptions) by language
    for (const ebook of filteredEBooks) {
      if (!ebook) continue;
      
      // Each access record should be counted once for its primary language
      // If it has multiple languages, count for each (user requirement)
      const languages = ebook.List_EBook_Language || [];
      console.log(`[Import All] E-Book ID ${ebook.id}:`, languages.map(l => l.Language.short).join(', '));
      
      // Track if this record was counted to ensure at least one increment
      let counted = false;
      
      for (const langEntry of languages) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHI" || langShort === "CHN") {
          countsByLanguage.chinese += 1;
          counted = true;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += 1;
          counted = true;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += 1;
          counted = true;
        } else if (langShort === "NON" || langShort === "NONCJK" || langShort === "NON-CJK") {
          countsByLanguage.noncjk += 1;
          counted = true;
        }
      }
      
      // If no language matched, log warning
      if (!counted && languages.length > 0) {
        console.warn(`[Import All] E-Book ID ${ebook.id} has unmatched languages:`, languages.map(l => l.Language.short));
      }
    }

    // 2. E-Journals this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const filteredEJournals = (await heldEJournalAccess(libraryYear.id, resolvedYear)).map(sub => sub.List_EJournal);
    console.log(`[Import All] E-Journals held: ${filteredEJournals.length}`);

    // Count number of access records (subscriptions) by language
    for (const ejournal of filteredEJournals) {
      if (!ejournal) continue;
      
      const languages = ejournal.List_EJournal_Language || [];
      console.log(`[Import All] E-Journal ID ${ejournal.id}:`, languages.map(l => l.Language.short).join(', '));
      
      let counted = false;
      
      for (const langEntry of languages) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHI" || langShort === "CHN") {
          countsByLanguage.chinese += 1;
          counted = true;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += 1;
          counted = true;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += 1;
          counted = true;
        } else if (langShort === "NON" || langShort === "NONCJK" || langShort === "NON-CJK") {
          countsByLanguage.noncjk += 1;
          counted = true;
        }
      }
      
      if (!counted && languages.length > 0) {
        console.warn(`[Import All] E-Journal ID ${ejournal.id} has unmatched languages:`, languages.map(l => l.Language.short));
      }
    }

    // 3. AVs this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const filteredAVs = (await heldAVAccess(libraryYear.id, resolvedYear)).map(sub => sub.List_AV);
    console.log(`[Import All] AVs held: ${filteredAVs.length}`);

    // Count number of access records (subscriptions) by language
    for (const av of filteredAVs) {
      if (!av) continue;
      
      const languages = av.List_AV_Language || [];
      console.log(`[Import All] AV ID ${av.id}:`, languages.map(l => l.Language.short).join(', '));
      
      let counted = false;
      
      for (const langEntry of languages) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHI" || langShort === "CHN") {
          countsByLanguage.chinese += 1;
          counted = true;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += 1;
          counted = true;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += 1;
          counted = true;
        } else if (langShort === "NON" || langShort === "NONCJK" || langShort === "NON-CJK") {
          countsByLanguage.noncjk += 1;
          counted = true;
        }
      }
      
      if (!counted && languages.length > 0) {
        console.warn(`[Import All] AV ID ${av.id} has unmatched languages:`, languages.map(l => l.Language.short));
      }
    }

    console.log(`[Import All] Library ${libraryId}, Year ${resolvedYear}`);
    console.log(`[Import All] Access counts:`, {
      ebooks: filteredEBooks.length,
      ejournals: filteredEJournals.length,
      avs: filteredAVs.length,
    });
    console.log(`[Import All] Counts by language:`, countsByLanguage);

    // Audit log the import operation
    await logAuditEvent({
      action: 'IMPORT',
      tableName: 'Electronic',
      newValues: { countsByLanguage, breakdown: { ebooks: filteredEBooks.length, ejournals: filteredEJournals.length, avs: filteredAVs.length } },
      success: true,
      metadata: {
        academicYear: resolvedYear,
        libraryId: libraryId,
        formType: 'electronic',
        changeReason: 'Import from AV, E-Book, and E-Journal Databases',
      }
    }, req);

    return NextResponse.json({
      success: true,
      data: countsByLanguage,
      breakdown: {
        ebooks: filteredEBooks.length,
        ejournals: filteredEJournals.length,
        avs: filteredAVs.length,
      },
    });

  } catch (error: any) {
    console.error("API error (import all subscriptions to electronic):", error);

    return NextResponse.json(
      { error: "Failed to fetch subscription data", detail: error?.message },
      { status: 500 }
    );
  }
}
