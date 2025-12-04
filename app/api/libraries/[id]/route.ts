import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';
import { cookies } from "next/headers";

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

    // Check authentication and authorization
    const cookieStore = await cookies();
    const userLibraryId = cookieStore.get("library")?.value;
    const userRole = cookieStore.get("role")?.value;
    
    // Parse user role to check for super admin (role "1")
    const isSuperAdmin = userRole?.includes("1") || false;
    const isOwnLibrary = parseInt(userLibraryId ?? "-1") === libraryId;
    
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
