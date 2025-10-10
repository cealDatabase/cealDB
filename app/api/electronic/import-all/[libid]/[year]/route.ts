import { NextResponse } from "next/server";
import db from "@/lib/db";
import { filterEBookSubscriptions, filterEJournalSubscriptions, filterAVSubscriptions } from "@/lib/subscription-filter";

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
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: currentYear,
      },
      select: { id: true }
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: `Library year ${currentYear} not found for library ${libraryId}` },
        { status: 404 }
      );
    }

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
                year: currentYear,
              },
            },
          },
        },
      },
    });

    // Process E-Books (only from subscriptions - no global items unless subscribed)
    const allEBooks = ebookSubscriptions.map(sub => sub.List_EBook).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEBooks = filterEBookSubscriptions(allEBooks);

    for (const ebook of filteredEBooks) {
      if (!ebook) continue;
      const count = ebook.List_EBook_Counts?.[0]?.titles || 0;

      for (const langEntry of ebook.List_EBook_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
          countsByLanguage.chinese += count;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += count;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += count;
        } else if (langShort === "NON") {
          countsByLanguage.noncjk += count;
        }
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
                year: currentYear,
              },
            },
          },
        },
      },
    });

    // Process E-Journals (only from subscriptions - no global items unless subscribed)
    const allEJournals = ejournalSubscriptions.map(sub => sub.List_EJournal).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEJournals = filterEJournalSubscriptions(allEJournals);

    for (const ejournal of filteredEJournals) {
      if (!ejournal) continue;
      const count = ejournal.List_EJournal_Counts?.[0]?.journals || 0;

      for (const langEntry of ejournal.List_EJournal_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
          countsByLanguage.chinese += count;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += count;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += count;
        } else if (langShort === "NON") {
          countsByLanguage.noncjk += count;
        }
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
                year: currentYear,
              },
            },
          },
        },
      },
    });

    // Process AVs (only from subscriptions - no global items unless subscribed)
    const allAVs = avSubscriptions.map(sub => sub.List_AV).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredAVs = filterAVSubscriptions(allAVs);

    for (const av of filteredAVs) {
      if (!av) continue;
      const count = av.List_AV_Counts?.[0]?.titles || 0;

      for (const langEntry of av.List_AV_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
          countsByLanguage.chinese += count;
        } else if (langShort === "JPN") {
          countsByLanguage.japanese += count;
        } else if (langShort === "KOR") {
          countsByLanguage.korean += count;
        } else if (langShort === "NON") {
          countsByLanguage.noncjk += count;
        }
      }
    }

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
