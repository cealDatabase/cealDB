// /app/api/admin/libraries/visibility/route.ts
//
// Which institutions are hidden. A hidden institution (hideinlibrarylist) is
// left out of the institution list on /libraries, the Sign Up New User
// list, the Participation and Supplementary reports and the Organizational
// Structure export. Most are institutions that last reported decades ago;
// until now the flag could only be set when an institution was created, so
// one hidden by mistake could only be shown again with SQL.
//
// Super Admin and Assistant Admin, the roles that may create institutions.

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { logUserAction } from "@/lib/auditLogger";

const notAllowed = () =>
  NextResponse.json(
    { error: "Only a Super Admin or Assistant Admin can show or hide institutions." },
    { status: 403 }
  );

// GET - every institution, hidden or not, with how many users it has
export async function GET() {
  if (!(await requireRoles(1, 4))) return notAllowed();

  try {
    const libraries = await db.library.findMany({
      select: {
        id: true,
        library_name: true,
        hideinlibrarylist: true,
        _count: { select: { User_Library: true } },
      },
      orderBy: { library_name: "asc" },
    });

    return NextResponse.json({
      success: true,
      libraries: libraries.map((library) => ({
        id: library.id,
        library_name: library.library_name,
        hidden: library.hideinlibrarylist === true,
        users: library._count.User_Library,
      })),
    });
  } catch (error) {
    console.error("Error fetching institution visibility:", error);
    return NextResponse.json({ error: "Could not load the institutions." }, { status: 500 });
  }
}

// POST { id, hidden } - show or hide one institution
export async function POST(request: NextRequest) {
  if (!(await requireRoles(1, 4))) return notAllowed();

  let id: number | null = null;
  try {
    const body = await request.json();
    id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0 || typeof body?.hidden !== "boolean") {
      return NextResponse.json({ error: "Send the institution's id and hidden: true or false." }, { status: 400 });
    }
    const hidden: boolean = body.hidden;

    const before = await db.library.findUnique({
      where: { id },
      select: { id: true, library_name: true, hideinlibrarylist: true },
    });
    if (!before) {
      return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    }

    if ((before.hideinlibrarylist === true) !== hidden) {
      await db.library.update({ where: { id }, data: { hideinlibrarylist: hidden } });
      await logUserAction(
        "UPDATE",
        "Library",
        id,
        { hideinlibrarylist: before.hideinlibrarylist },
        { hideinlibrarylist: hidden, library_name: before.library_name },
        true,
        undefined,
        request
      );
    }

    return NextResponse.json({ success: true, id, library_name: before.library_name, hidden });
  } catch (error) {
    console.error("Error changing institution visibility:", error);
    await logUserAction(
      "UPDATE",
      "Library",
      id ?? undefined,
      undefined,
      undefined,
      false,
      error instanceof Error ? error.message : "Unknown error",
      request
    );
    return NextResponse.json({ error: "Could not change the institution." }, { status: 500 });
  }
}
