import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const roleValue = cookieStore.get("role")?.value;
    const libraryValue = cookieStore.get("library")?.value;
    
    // Parse user roles
    let userRoles: string[] = [];
    try {
      userRoles = roleValue ? JSON.parse(roleValue) : [];
    } catch {
      userRoles = roleValue ? [roleValue] : [];
    }
    
    // Check if user is Super Admin (role 1) or Editor (role 3)
    const isSuperAdminOrEditor = userRoles.includes("1") || userRoles.includes("3");
    
    // For Super Admin and Editor: return all years
    if (isSuperAdminOrEditor) {
      const years = await db.library_Year.findMany({
        select: {
          year: true,
        },
        distinct: ['year'],
        orderBy: {
          year: 'desc',
        },
        where: {
          year: {
            not: 1900,
          },
        },
      });

      const yearList = years.map((y: { year: number }) => y.year.toString());

      return NextResponse.json({
        success: true,
        years: yearList,
      });
    }
    
    // For regular members: only return years where their library has espublished = true
    if (!libraryValue) {
      return NextResponse.json({
        success: true,
        years: [],
      });
    }
    
    const libraryId = parseInt(libraryValue);
    if (isNaN(libraryId)) {
      return NextResponse.json({
        success: true,
        years: [],
      });
    }
    
    // Get Library_Year records for this library where espublished = true
    const publishedYears = await db.library_Year.findMany({
      where: {
        library: libraryId,
        year: {
          not: 1900,
        },
        Entry_Status: {
          espublished: true,
        },
      },
      select: {
        year: true,
      },
      distinct: ['year'],
      orderBy: {
        year: 'desc',
      },
    });
    
    const yearList = publishedYears.map((y: { year: number }) => y.year.toString());

    return NextResponse.json({
      success: true,
      years: yearList,
    });
  } catch (error) {
    console.error("Error fetching available years:", error);
    return NextResponse.json(
      { error: "Failed to fetch available years" },
      { status: 500 }
    );
  }
}
