// /app/api/av/update/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getSessionRoleIds, requireRoles } from "@/lib/auth";
import { logUserAction } from "@/lib/auditLogger";
import { catalogueEntryForAudit, changedFields } from "@/lib/auditChanges";

export async function POST(req: Request) {
  let auditId: number | null = null;
  try {
  // Mutates the shared, cross-institution catalog record, so this is limited to
  // Super Admin / E-Resource Editor — matching the
  // /admin/survey/* pages this is called from. hasValidSession() only proved
  // the caller was logged in, which let any member edit the global catalog.
  if (!(await requireRoles(1, 3))) {
    return NextResponse.json(
      { error: "Unauthorized: E-Resource Editor or Super Admin access required" },
      { status: 403 }
    );
  }
  const canShareLocalEntry = (await getSessionRoleIds()).some((role) => role === 1 || role === 3);

    const body = await req.json();
    // Entry scope is assigned when it is created/imported. Never let an edit
    // turn a local institution entry into a global one (or vice versa).
    const { id, counts, language, year, is_global: _ignoredIsGlobal, ...updateData } = body;

    const avId = Number(id);
    if (!Number.isFinite(avId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const existingEntry = await db.list_AV.findUnique({ where: { id: avId }, select: { is_global: true } });
    const sharesLocalEntry = canShareLocalEntry && existingEntry?.is_global === false;

    const y = year == null ? null : Number(year);
    const safeCounts = Number.isFinite(Number(counts)) ? Number(counts) : 0;
    auditId = avId;
    const before = await catalogueEntryForAudit("av", avId, y);

    // Debug logging
    console.log('🔧 AV Update Request:', {
      avId,
      year: y,
      counts: safeCounts,
      originalCounts: counts,
    });

    const updated = await db.$transaction(async (tx) => {
      // 1) main row
      const av = await tx.list_AV.update({
        where: { id: avId },
        data: { ...updateData, updated_at: new Date(), ...(sharesLocalEntry ? { shared_by_admin_edit: true } : {}) },
      });

      // 2) counts for the selected year (use the composite unique)
      if (y !== null) {
        const countsResult = await tx.list_AV_Counts.upsert({
          where: { listav_year_unique: { listav: avId, year: y } },
          update: { titles: safeCounts, updatedat: new Date() },
          create: {
            listav: avId,
            year: y,
            titles: safeCounts,
            updatedat: new Date(),
            ishidden: false,
          },
        });
        console.log('✅ Counts updated:', countsResult);
      }

      // 3) languages (replace set)
      if (Array.isArray(language)) {
        await tx.list_AV_Language.deleteMany({ where: { listav_id: avId } });

        const rows = language
          .map((v: any) => Number(v))
          .filter((n) => Number.isFinite(n))
          .map((langId) => ({ listav_id: avId, language_id: langId }));

        if (rows.length) {
          await tx.list_AV_Language.createMany({
            data: rows,
            skipDuplicates: true,
          });
        }
      }

      return av;
    });

    // The dialog sends every field; log only what this save changed.
    const changes = changedFields(before, await catalogueEntryForAudit("av", avId, y));
    await logUserAction("UPDATE", "List_AV", avId, changes.old, { ...changes.new, year: y }, true, undefined, req);

    // Verify the update in the database
    if (y !== null) {
      const verifyCount = await db.list_AV_Counts.findFirst({
        where: { listav: avId, year: y }
      });
      console.log('🔍 Verify count in DB:', verifyCount);
    }

    // Revalidate the AV list pages to show updated counts
    if (y !== null) {
      revalidatePath(`/admin/survey/avdb/${y}`);
      revalidatePath('/admin/survey/avdb');
      console.log(`✨ Revalidated paths for year ${y}`);
    }

    return NextResponse.json({ success: true, id: updated.id, counts: safeCounts });
  } catch (error: any) {
    console.error("API error (update AV):", error);
    await logUserAction("UPDATE", "List_AV", auditId ?? undefined, undefined, undefined, false, error?.message || "Unknown error", req);
    return NextResponse.json(
      { error: "Failed to update AV record.", detail: error?.message },
      { status: 500 }
    );
  }
}
