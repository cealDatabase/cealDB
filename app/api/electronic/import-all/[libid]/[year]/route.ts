import { NextResponse } from "next/server";
import db from "@/lib/db";
import { filterEBookSubscriptions, filterEJournalSubscriptions, filterAVSubscriptions } from "@/lib/subscription-filter";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { logAuditEvent } from "@/lib/auditLogger";

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

    // 1. Fetch E-Book subscriptions (ONLY library-specific subscriptions)
    const ebookSubscriptions = await db.libraryYear_ListEBook.findMany({
      where: {
        libraryyear_id: libraryYear.id,
      },
      include: {
        List_EBook: {
          include: {
            List_EBook_Language: {
              include: {
                Language: true,
              },
            },
            List_EBook_Counts: {
              where: {
                year: resolvedYear,
              },
            },
          },
        },
      },
    });

    // Process E-Books (only from subscriptions - no global items unless subscribed)
    const allEBooks = ebookSubscriptions.map(sub => sub.List_EBook).filter(Boolean);
    console.log(`[Import All] E-Books before filter: ${allEBooks.length}`);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEBooks = filterEBookSubscriptions(allEBooks);
    console.log(`[Import All] E-Books after filter: ${filteredEBooks.length}`);

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
        
        if (langShort === "CHN") {
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

    // 2. Fetch E-Journal subscriptions (ONLY library-specific subscriptions)
    const ejournalSubscriptions = await db.libraryYear_ListEJournal.findMany({
      where: {
        libraryyear_id: libraryYear.id,
      },
      include: {
        List_EJournal: {
          include: {
            List_EJournal_Language: {
              include: {
                Language: true,
              },
            },
            List_EJournal_Counts: {
              where: {
                year: resolvedYear,
              },
            },
          },
        },
      },
    });

    // Process E-Journals (only from subscriptions - no global items unless subscribed)
    const allEJournals = ejournalSubscriptions.map(sub => sub.List_EJournal).filter(Boolean);
    console.log(`[Import All] E-Journals before filter: ${allEJournals.length}`);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEJournals = filterEJournalSubscriptions(allEJournals);
    console.log(`[Import All] E-Journals after filter: ${filteredEJournals.length}`);

    // Count number of access records (subscriptions) by language
    for (const ejournal of filteredEJournals) {
      if (!ejournal) continue;
      
      const languages = ejournal.List_EJournal_Language || [];
      console.log(`[Import All] E-Journal ID ${ejournal.id}:`, languages.map(l => l.Language.short).join(', '));
      
      let counted = false;
      
      for (const langEntry of languages) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
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

    // 3. Fetch Audio-Visual subscriptions (ONLY library-specific subscriptions)
    const avSubscriptions = await db.libraryYear_ListAV.findMany({
      where: {
        libraryyear_id: libraryYear.id,
      },
      include: {
        List_AV: {
          include: {
            List_AV_Language: {
              include: {
                Language: true,
              },
            },
            List_AV_Counts: {
              where: {
                year: resolvedYear,
              },
            },
          },
        },
      },
    });

    // Process AVs (only from subscriptions - no global items unless subscribed)
    const allAVs = avSubscriptions.map(sub => sub.List_AV).filter(Boolean);
    console.log(`[Import All] AVs before filter: ${allAVs.length}`);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredAVs = filterAVSubscriptions(allAVs);
    console.log(`[Import All] AVs after filter: ${filteredAVs.length}`);

    // Count number of access records (subscriptions) by language
    for (const av of filteredAVs) {
      if (!av) continue;
      
      const languages = av.List_AV_Language || [];
      console.log(`[Import All] AV ID ${av.id}:`, languages.map(l => l.Language.short).join(', '));
      
      let counted = false;
      
      for (const langEntry of languages) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
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
