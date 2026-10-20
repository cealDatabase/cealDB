import { NextResponse } from "next/server";
import db from "@/lib/db";
import { heldAVAccess } from "@/lib/heldAccess";
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

    // The AV entries this institution holds this year, exactly as its Manage
    // Access lists them (lib/heldAccess.ts).
    const heldAV = await heldAVAccess(libraryYear.id, resolvedYear);

    // Group by type and language
    const countsByType = {
      "online map": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "online image/photograph": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "streaming audio/music": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "streaming film/video": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
    };

    // Process each AV entry (using filtered list to avoid duplicates)
    for (const { List_AV: av, custom_count } of heldAV) {
      if (!av || !av.type) continue;

      const type = av.type.toLowerCase();
      if (!countsByType[type as keyof typeof countsByType]) continue;

      // Get counts for this year
      // A count of the institution's own replaces the list's, as in Manage Access.
      const count = custom_count ?? av.List_AV_Counts?.[0]?.titles ?? 0;

      // Map languages
      for (const langEntry of av.List_AV_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHI" || langShort === "CHN") {
          countsByType[type as keyof typeof countsByType].chinese += count;
        } else if (langShort === "JPN") {
          countsByType[type as keyof typeof countsByType].japanese += count;
        } else if (langShort === "KOR") {
          countsByType[type as keyof typeof countsByType].korean += count;
        } else if (langShort === "NON") {
          countsByType[type as keyof typeof countsByType].noncjk += count;
        }
      }
    }

    // Audit log the import operation
    await logAuditEvent({
      action: 'IMPORT',
      tableName: 'Other_Holdings',
      newValues: countsByType,
      success: true,
      metadata: {
        academicYear: resolvedYear,
        libraryId: libraryId,
        formType: 'otherHoldings',
        changeReason: 'Import from Audio/Video Databases',
      }
    }, req);

    return NextResponse.json({
      success: true,
      data: countsByType,
    });

  } catch (error: any) {
    console.error("API error (import AV to other holdings):", error);

    return NextResponse.json(
      { error: "Failed to fetch AV subscription data", detail: error?.message },
      { status: 500 }
    );
  }
}
