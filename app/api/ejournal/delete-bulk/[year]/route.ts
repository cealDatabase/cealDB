import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  if (!(await requireRoles(1, 3, 4))) {
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
    const result = await db.list_EJournal_Counts.deleteMany({
      where: { listejournal: { in: ids }, year: yearNum },
    });
    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("Bulk delete E-Journal failed:", error);
    return NextResponse.json({ error: "Failed to delete E-Journal entries" }, { status: 500 });
  }
}
