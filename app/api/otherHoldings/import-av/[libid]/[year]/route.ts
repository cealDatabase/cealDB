import { NextResponse } from "next/server";
import db from "@/lib/db";
import { filterAVSubscriptions } from "@/lib/subscription-filter";

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

    // Fetch AV subscriptions for this library and year (ONLY subscribed items)
    // Include language information
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

    // Process only library-specific subscriptions (no global items unless subscribed)
    const allAVEntries = avSubscriptions.map(sub => sub.List_AV).filter(Boolean);

    // Filter to prefer library-specific records over global (prevents duplicate counting)
    const filteredAVEntries = filterAVSubscriptions(allAVEntries);

    // Group by type and language
    const countsByType = {
      "online map": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "online image/photograph": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "streaming audio/music": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
      "streaming film/video": { chinese: 0, japanese: 0, korean: 0, noncjk: 0 },
    };

    // Process each AV entry (using filtered list to avoid duplicates)
    for (const av of filteredAVEntries) {
      if (!av || !av.type) continue;

      const type = av.type.toLowerCase();
      if (!countsByType[type as keyof typeof countsByType]) continue;

      // Get counts for this year
      const count = av.List_AV_Counts?.[0]?.titles || 0;

      // Map languages
      for (const langEntry of av.List_AV_Language) {
        const langShort = langEntry.Language.short?.toUpperCase();
        
        if (langShort === "CHN") {
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
