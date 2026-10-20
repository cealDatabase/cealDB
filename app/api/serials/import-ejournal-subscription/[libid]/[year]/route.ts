import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { heldEJournalAccess } from '@/lib/heldAccess';
import { canAccessLibrary } from '@/lib/auth';

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

    // One institution's numbers: only for those who may act on it.
    if (!(await canAccessLibrary(libraryId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // The E-Journals this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const heldEJournals = await heldEJournalAccess(libraryYear.id, year);

    // Group by language
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Journal entry
    for (const { List_EJournal: ejournal, custom_count } of heldEJournals) {
      if (!ejournal) continue;
      const count = custom_count ?? ejournal.List_EJournal_Counts?.[0]?.journals ?? 0;

      for (const langEntry of ejournal.List_EJournal_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHI" || langShort === "CHN") {
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
