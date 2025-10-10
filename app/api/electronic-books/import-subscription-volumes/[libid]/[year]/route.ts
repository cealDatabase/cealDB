import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { filterEBookSubscriptions } from '@/lib/subscription-filter';

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

    // Fetch E-Book subscriptions for this library and year (ONLY subscribed items)
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
                year: year,
              },
            },
          },
        },
      },
    });

    // Process only library-specific subscriptions (no global items unless subscribed)
    const allEBooks = ebookSubscriptions.map(sub => sub.List_EBook).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEBooks = filterEBookSubscriptions(allEBooks);

    // Group by language
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Book entry
    for (const ebook of filteredEBooks) {
      if (!ebook) continue;
      const count = ebook.List_EBook_Counts?.[0]?.volumes || 0;

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

    return NextResponse.json({
      chinese: countsByLanguage.chinese,
      japanese: countsByLanguage.japanese,
      korean: countsByLanguage.korean,
      noncjk: countsByLanguage.noncjk,
      total: countsByLanguage.chinese + countsByLanguage.japanese + countsByLanguage.korean + countsByLanguage.noncjk,
      message: 'Subscription volumes fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching subscription volumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription volumes' },
      { status: 500 }
    );
  }
}
