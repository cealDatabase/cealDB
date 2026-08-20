import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdminDb, getSessionUserId } from '@/lib/auth';
import db from '@/lib/db';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db as any;

// Verified against the database via the signed session JWT. The `role` cookie
// is unsigned and therefore forgeable, so it must not gate writes.
async function requireSuperAdmin() {
  return isSuperAdminDb();
}

// Derived from the signed session JWT. This previously read a `user_id`/`userId`
// cookie that is never set anywhere, so it always returned null.
async function currentUserId() {
  return getSessionUserId();
}

/**
 * GET /api/admin/published-reports
 *
 * Returns ALL rows (published and unpublished) for the admin editor.
 * Ordered by academicYear DESC, displayOrder ASC.
 */
export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }
  try {
    const rows = await prisma.publishedReport.findMany({
      orderBy: [{ academicYear: 'desc' }, { displayOrder: 'asc' }, { id: 'asc' }],
    });
    return NextResponse.json({ success: true, reports: rows });
  } catch (err) {
    console.error('[published-reports GET]', err);
    return NextResponse.json(
      { error: 'Failed to load reports', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/published-reports
 * Body: { academicYear, title, url, journal?, appendix?, displayOrder?, isPublished? }
 */
export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const academicYear = Number(body?.academicYear);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const url = typeof body?.url === 'string' ? body.url.trim() : '';

  if (!Number.isInteger(academicYear) || academicYear < 1900 || academicYear > 2999) {
    return NextResponse.json({ error: 'academicYear must be an integer between 1900 and 2999' }, { status: 400 });
  }
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
  // url is optional: historical placeholder rows have title only.

  const userId = await currentUserId();
  try {
    const created = await prisma.publishedReport.create({
      data: {
        academicYear,
        title,
        url: url || null,
        journal: typeof body?.journal === 'string' ? body.journal : null,
        appendix: typeof body?.appendix === 'string' ? body.appendix : null,
        displayOrder: Number.isFinite(Number(body?.displayOrder)) ? Number(body.displayOrder) : 0,
        isPublished: body?.isPublished !== false,
        createdBy: userId,
      },
    });

    await logUserAction(
      'CREATE',
      'PublishedReport',
      String(created.id),
      null,
      { academicYear, title, url },
      true,
      undefined,
      request,
    ).catch(() => {});

    return NextResponse.json({ success: true, report: created });
  } catch (err) {
    console.error('[published-reports POST]', err);
    return NextResponse.json(
      { error: 'Failed to create report', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
