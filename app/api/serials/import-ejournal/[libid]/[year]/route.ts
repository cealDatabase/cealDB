import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    // Fetch all E-Journal subscriptions for this library and year
    // Include language information
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

    // Also fetch global subscriptions
    const globalSubscriptions = await db.list_EJournal.findMany({
      where: {
        is_global: true,
      },
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
    });

    // Combine library-specific and global subscriptions
    const allEJournalEntries = [
      ...ejournalSubscriptions.map(sub => sub.List_EJournal),
      ...globalSubscriptions,
    ];

    // Group by language for purchased electronic serials
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Journal entry
    for (const ejournal of allEJournalEntries) {
      if (!ejournal) continue;

      // Get counts for this year (journals count)
      const count = ejournal.List_EJournal_Counts?.[0]?.journals || 0;

      // Map languages
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

    return NextResponse.json({
      success: true,
      data: countsByLanguage,
    });

  } catch (error: any) {
    console.error("API error (import E-Journal to serials):", error);

    return NextResponse.json(
      { error: "Failed to fetch E-Journal subscription data", detail: error?.message },
      { status: 500 }
    );
  }
}
