// /app/api/survey/av/save-selections/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isSuperAdmin } from "@/lib/libraryYearHelper";
import { logUserAction } from "@/lib/auditLogger";

interface AVSelection {
  listId: number;
  isSelected: boolean;
  customCount?: number | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, libraryId, selections } = body as {
      year: number;
      libraryId: number;
      selections: AVSelection[];
    };

    // Validate required fields
    if (!year || !libraryId || !Array.isArray(selections)) {
      return NextResponse.json(
        { error: "Missing required fields: year, libraryId, selections" },
        { status: 400 }
      );
    }

    // Get Library_Year record
    const libraryYear = await db.library_Year.findFirst({
      where: { 
        year: year,
        library: libraryId 
      },
      select: { 
        id: true, 
        is_open_for_editing: true,
        year: true,
      }
    });

    if (!libraryYear) {
      return NextResponse.json(
        { error: `Library year ${year} not found for library ${libraryId}` },
        { status: 404 }
      );
    }

    // Check if editing is allowed
    const canEdit = libraryYear.is_open_for_editing || await isSuperAdmin();
    if (!canEdit) {
      return NextResponse.json(
        { error: "Survey is closed. Cannot save selections." },
        { status: 403 }
      );
    }

    const libraryYearId = libraryYear.id;

    // Split selections: meaningful (selected OR has custom_count) vs default (delete)
    const meaningful = selections.filter(
      (sel) => sel.isSelected === true || (sel.customCount != null)
    );
    const toDelete = selections.filter(
      (sel) => sel.isSelected === false && (sel.customCount == null)
    );

    // Batch upsert meaningful selections + delete default-state records
    const results = await db.$transaction([
      ...meaningful.map((sel) =>
        db.libraryYear_ListAV.upsert({
          where: {
            libraryyear_id_listav_id: {
              libraryyear_id: libraryYearId,
              listav_id: sel.listId,
            },
          },
          update: {
            is_selected: sel.isSelected,
            custom_count: sel.customCount ?? null,
            updated_at: new Date(),
          },
          create: {
            libraryyear_id: libraryYearId,
            listav_id: sel.listId,
            is_selected: sel.isSelected,
            custom_count: sel.customCount ?? null,
            updated_at: new Date(),
          },
        })
      ),
      ...(toDelete.length > 0
        ? [
            db.libraryYear_ListAV.deleteMany({
              where: {
                libraryyear_id: libraryYearId,
                listav_id: { in: toDelete.map((s) => s.listId) },
              },
            }),
          ]
        : []),
    ]);

    // Log the action
    await logUserAction(
      'UPDATE',
      'LibraryYear_ListAV',
      libraryYearId.toString(),
      undefined,
      { 
        year, 
        libraryId, 
        selectionCount: selections.length,
        selectedCount: selections.filter(s => s.isSelected).length,
      },
      true,
      undefined,
      req
    );

    return NextResponse.json({
      success: true,
      message: `Saved ${results.length} AV selections`,
      data: {
        year,
        libraryId,
        savedCount: results.length,
        selectedCount: selections.filter(s => s.isSelected).length,
      },
    });

  } catch (error: any) {
    console.error("[AV Save Selections] Error:", error);

    // Log failed action
    await logUserAction(
      'UPDATE',
      'LibraryYear_ListAV',
      undefined,
      undefined,
      undefined,
      false,
      error?.message || 'Unknown error',
      req
    );

    return NextResponse.json(
      { 
        error: "Failed to save AV selections",
        detail: error?.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
