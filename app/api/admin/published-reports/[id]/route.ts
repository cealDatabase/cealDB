import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db as any;

async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  let roles: string[] = [];
  if (roleCookie) {
    try { roles = JSON.parse(roleCookie); } catch { roles = [roleCookie]; }
  }
  return roles.includes('1');
}

/**
 * PATCH /api/admin/published-reports/[id]
 * Body may contain any subset of: academicYear, title, url, journal, appendix,
 *                                 displayOrder, isPublished
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const data: Record<string, any> = {};

  if (body.academicYear !== undefined) {
    const y = Number(body.academicYear);
    if (!Number.isInteger(y) || y < 1900 || y > 2999) {
      return NextResponse.json({ error: 'academicYear must be an integer between 1900 and 2999' }, { status: 400 });
    }
    data.academicYear = y;
  }
  if (typeof body.title === 'string') data.title = body.title.trim();
  if (typeof body.url === 'string') data.url = body.url.trim() || null;
  if (body.journal !== undefined) data.journal = typeof body.journal === 'string' ? body.journal : null;
  if (body.appendix !== undefined) data.appendix = typeof body.appendix === 'string' ? body.appendix : null;
  if (body.displayOrder !== undefined && Number.isFinite(Number(body.displayOrder))) {
    data.displayOrder = Number(body.displayOrder);
  }
  if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const updated = await prisma.publishedReport.update({ where: { id: reportId }, data });

    await logUserAction(
      'UPDATE',
      'PublishedReport',
      String(reportId),
      null,
      data,
      true,
      undefined,
      request,
    ).catch(() => {});

    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    console.error('[published-reports PATCH]', err);
    return NextResponse.json(
      { error: 'Failed to update report', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/published-reports/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    await prisma.publishedReport.delete({ where: { id: reportId } });

    await logUserAction(
      'DELETE',
      'PublishedReport',
      String(reportId),
      null,
      { id: reportId },
      true,
      undefined,
      request,
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[published-reports DELETE]', err);
    return NextResponse.json(
      { error: 'Failed to delete report', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
