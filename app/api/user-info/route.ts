import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByUserName, getLibraryById } from "@/data/fetchPrisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const rawCookieValue = cookieStore.get("uinf")?.value;
    const userEmail = rawCookieValue ? decodeURIComponent(rawCookieValue).toLowerCase() : undefined;
    const roleIds = cookieStore.get("role")?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let userRoleIds: string[] = [];
    try {
      userRoleIds = roleIds ? JSON.parse(roleIds) : [];
    } catch (error) {
      console.error("Failed to parse role IDs:", error);
      userRoleIds = [];
    }

    const user = await getUserByUserName(userEmail);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let libraryId: number | null = null;
    let libraryName: string | null = null;

    if (user.User_Library && user.User_Library.length > 0) {
      const userLibraryId = user.User_Library[0].library_id;
      if (userLibraryId) {
        const library = await getLibraryById(userLibraryId);
        if (library) {
          libraryId = Number(library.id);
          libraryName = String(library.library_name);
        }
      }
    }

    return NextResponse.json({
      roleIds: userRoleIds,
      libraryId,
      libraryName,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
