import { NextResponse } from "next/server";
import db from "@/lib/db";
import { heldEJournalAccess } from "@/lib/heldAccess";
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

    // The E-Journals this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const heldEJournals = await heldEJournalAccess(libraryYear.id, resolvedYear);

    // Group by language for purchased electronic serials
    const countsByLanguage = {
      chinese: 0,
      japanese: 0,
      korean: 0,
      noncjk: 0,
    };

    // Process each E-Journal entry (using filtered list to avoid duplicates)
    for (const { List_EJournal: ejournal, custom_count } of heldEJournals) {
      if (!ejournal) continue;

      // Get counts for this year (journals count)
      // A count of the institution's own replaces the list's, as in Manage Access.
      const count = custom_count ?? ejournal.List_EJournal_Counts?.[0]?.journals ?? 0;

      // Map languages
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
