import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { filterEJournalSubscriptions } from '@/lib/subscription-filter';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ libid: string; year: string }> }
) {
  try {
    const resolvedParams = await params;
    const libraryId = parseInt(resolvedParams.libid);
    const year = parseInt(resolvedParams.year);

    if (isNaN(libraryId) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid library ID or year' },
        { status: 400 }
      );
    }

    // Find Library_Year record for the library and year
    const libraryYear = await db.library_Year.findFirst({
      where: {
        library: libraryId,
        year: year,
      },
      select: { id: true }
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: `Library year ${year} not found for library ${libraryId}` },
        { status: 404 }
      );
    }

    // Fetch E-Journal subscriptions for this library and year (ONLY subscribed items)
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
                year: year,
              },
            },
          },
        },
      },
    });

    // Process only library-specific subscriptions (no global items unless subscribed)
    const allEJournals = ejournalSubscriptions.map(sub => sub.List_EJournal).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEJournals = filterEJournalSubscriptions(allEJournals);

    // Group by language
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Journal entry
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

    return NextResponse.json({
      chinese: countsByLanguage.chinese,
      japanese: countsByLanguage.japanese,
      korean: countsByLanguage.korean,
      noncjk: countsByLanguage.noncjk,
      total: countsByLanguage.chinese + countsByLanguage.japanese + countsByLanguage.korean + countsByLanguage.noncjk,
      message: 'E-Journal subscription titles fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching E-Journal subscription titles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch E-Journal subscription titles' },
      { status: 500 }
    );
  }
}
