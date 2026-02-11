import { NextResponse } from "next/server";
import db from "@/lib/db";
import { filterEJournalSubscriptions } from "@/lib/subscription-filter";
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

    // Fetch E-Journal subscriptions for this library and year (ONLY subscribed items)
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
                year: resolvedYear,
              },
            },
          },
        },
      },
    });

    // Process only library-specific subscriptions (no global items unless subscribed)
    const allEJournalEntries = ejournalSubscriptions.map(sub => sub.List_EJournal).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredEJournalEntries = filterEJournalSubscriptions(allEJournalEntries);

    // Group by language for purchased electronic serials
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Journal entry (using filtered list to avoid duplicates)
    for (const ejournal of filteredEJournalEntries) {
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

    // Audit log the import operation
    await logAuditEvent({
      action: 'IMPORT',
      tableName: 'Serials',
      newValues: countsByLanguage,
      success: true,
      metadata: {
        academicYear: resolvedYear,
        libraryId: libraryId,
        formType: 'serials',
        changeReason: 'Import from E-Journal Databases',
      }
    }, req);

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
