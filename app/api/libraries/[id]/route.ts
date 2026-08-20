import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';
import { isSuperAdminDb, getSessionUserId } from "@/lib/auth";

const prisma = db;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const libraryId = parseInt(resolvedParams.id);
    
    if (isNaN(libraryId)) {
      return NextResponse.json(
        { error: "Invalid library ID" },
        { status: 400 }
      );
    }

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: {
        libraryRegion: true,
        libraryType: true,
      },
    });

    if (!library) {
      return NextResponse.json(
        { error: "Library not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: library,
    });

  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch library",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const libraryId = parseInt(resolvedParams.id);
    
    if (isNaN(libraryId)) {
      return NextResponse.json(
        { error: "Invalid library ID" },
        { status: 400 }
      );
    }

    // Check authentication and authorization.
    //
    // Both facts are derived from the signed session JWT and the database.
    // Previously this trusted the `role` and `library` cookies, which were
    // client-writable: a member could set role=["1"] to become super admin, or
    // set library=<any id> to claim ownership of any institution. The old role
    // test was also a substring match on the raw cookie string.
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const isSuperAdmin = await isSuperAdminDb();
    const isOwnLibrary =
      (await db.user_Library.findFirst({
        where: { user_id: sessionUserId, library_id: libraryId },
        select: { user_id: true },
      })) !== null;

    if (!isSuperAdmin && !isOwnLibrary) {
      return NextResponse.json(
        { error: "Unauthorized - You can only edit your own library or need super admin privileges" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.library_name || !body.plie_mail) {
      return NextResponse.json(
        { error: "Library name and email are required" },
        { status: 400 }
      );
    }

    // Update library data
    const updatedLibrary = await prisma.library.update({
      where: { id: libraryId },
      data: {
        library_name: body.library_name,
        type: body.type ? parseInt(body.type) : undefined,
        plilaw: body.plilaw,
        plimed: body.plimed,
        plisubmitter_first_name: body.plisubmitter_first_name,
        plisubmitter_last_name: body.plisubmitter_last_name,
        pliposition_title: body.pliposition_title,
        pliwork_phone: body.pliwork_phone,
        plie_mail: body.plie_mail,
        plifax_number: body.plifax_number,
        plibibliographic: body.plibibliographic,
        pliconsortia: body.pliconsortia,
        plisystem_vendor: body.plisystem_vendor,
        pliopac: body.pliopac,
        plihome_page: body.plihome_page,
        plionline_catalog: body.plionline_catalog,
        pliestablishedyear: body.pliestablishedyear,
        pliregion: body.pliregion ? parseInt(body.pliregion) : undefined,
        notes: body.notes,
        date_last_changed: new Date(),
      },
      include: {
        libraryRegion: true,
        libraryType: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLibrary,
      message: "Library updated successfully",
    });

  } catch (error) {
    console.error('Error updating library:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update library",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
