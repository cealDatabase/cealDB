import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { copiesMadeOf } from "@/lib/editedCopies";

export async function POST(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  if (!(await requireRoles(1, 3))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { year } = await context.params;
  const yearNum = Number(year);
  const body = await request.json().catch(() => null);
  const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [...new Set(rawIds.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0))];

  if (!Number.isInteger(yearNum) || ids.length === 0 || ids.length > 500) {
    return NextResponse.json({ error: "Provide between 1 and 500 valid entry IDs" }, { status: 400 });
  }

  try {
    const editedVersions = await copiesMadeOf("av", ids);
    const [result] = await db.$transaction([
      db.list_AV_Counts.deleteMany({
        where: { listav: { in: ids }, year: yearNum },
      }),
      // Out of this year's list, the entry is no longer held this year: take
      // it, and institutions' edited versions of it, out of their My Access.
      db.libraryYear_ListAV.deleteMany({
        where: { listav_id: { in: [...ids, ...editedVersions] }, Library_Year: { year: yearNum } },
      }),
    ]);
    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("Bulk delete AV failed:", error);
    return NextResponse.json({ error: "Failed to delete AV entries" }, { status: 500 });
  }
}
