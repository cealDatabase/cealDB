import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { logUserAction } from "@/lib/auditLogger";

export async function POST(req: Request) {
  if (!(await requireRoles(1, 3))) return NextResponse.json({ error: "Only Super Admin or Editor can promote an entry." }, { status: 403 });
  try {
    const { id, year } = await req.json(); const entryId = Number(id); const selectedYear = Number(year);
    if (!Number.isFinite(entryId) || !Number.isFinite(selectedYear)) return NextResponse.json({ error: "Invalid entry or year." }, { status: 400 });
    const original = await db.list_AV.findUnique({ where: { id: entryId }, select: { id: true, is_global: true, libraryyear: true, promoted_from_libraryyear_id: true } });
    if (!original || original.is_global || original.promoted_from_libraryyear_id != null || original.libraryyear == null) return NextResponse.json({ error: "Only an unpromoted local entry can be promoted." }, { status: 400 });
    const promoted = await db.list_AV.update({ where: { id: entryId }, data: { is_global: true, libraryyear: null, shared_by_admin_edit: false, promoted_from_libraryyear_id: original.libraryyear, updated_at: new Date() } });
    await logUserAction("UPDATE", "List_AV", promoted.id, { is_global: false, libraryyear: original.libraryyear }, { is_global: true, libraryyear: null, promoted_from_libraryyear_id: original.libraryyear, promoted_to_global: true, year: selectedYear }, true, undefined, req);
    revalidatePath(`/admin/survey/avdb/${selectedYear}`);
    return NextResponse.json({ success: true, id: promoted.id });
  } catch (error: any) {
    console.error("Promote AV to global failed:", error);
    return NextResponse.json({ error: "Failed to promote entry to global.", detail: error?.message }, { status: 500 });
  }
}
