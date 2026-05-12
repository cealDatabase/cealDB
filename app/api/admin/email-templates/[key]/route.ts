import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import {
  DEFAULT_TEMPLATES,
  TemplateKey,
  buildTemplateContext,
  renderTemplateString,
} from '@/lib/emailTemplate';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

async function getCookieData(): Promise<{ roles: string[] | null; userId: number | null }> {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('role')?.value;
    const userIdCookie = cookieStore.get('user_id')?.value || cookieStore.get('userId')?.value;
    let roles: string[] | null = null;
    if (roleCookie) {
      try {
        roles = JSON.parse(roleCookie);
      } catch {
        roles = [roleCookie];
      }
    }
    return { roles, userId: userIdCookie ? Number(userIdCookie) : null };
  } catch {
    return { roles: null, userId: null };
  }
}

function isValidKey(key: string): key is TemplateKey {
  return Object.prototype.hasOwnProperty.call(DEFAULT_TEMPLATES, key);
}

async function ensureSuperAdmin() {
  const { roles } = await getCookieData();
  if (!roles || !roles.includes('1')) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * GET /api/admin/email-templates/[key]
 * Returns a single template (DB row if customized, otherwise default).
 * Optional `?preview=1&year=YYYY` returns a rendered preview using either the
 * latest SurveySession dates or default dates for `year`.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const guard = await ensureSuperAdmin();
  if (guard) return guard;

  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 404 });
  }

  const def = DEFAULT_TEMPLATES[key];
  let row: any = null;
  try {
    row = await (prisma as any).emailTemplate.findUnique({ where: { key } });
  } catch (err) {
    console.warn('[email-templates] DB read failed:', err);
  }

  const subject = row?.subject ?? def.subject;
  const html = row?.html ?? def.html;

  const url = new URL(request.url);
  let preview: { subject: string; html: string; context: any } | null = null;
  if (url.searchParams.get('preview') === '1') {
    const yearParam = url.searchParams.get('year');
    let year = yearParam ? Number(yearParam) : NaN;
    let openDate: Date | null = null;
    let closeDate: Date | null = null;

    // Prefer the latest SurveySession (matches what the broadcast page shows)
    try {
      const session = await prisma.surveySession.findFirst({
        orderBy: { academicYear: 'desc' },
        where: yearParam ? { academicYear: year } : undefined,
      });
      if (session) {
        year = session.academicYear;
        openDate = new Date(session.openingDate);
        closeDate = new Date(session.closingDate);
      }
    } catch (err) {
      console.warn('[email-templates] SurveySession lookup failed:', err);
    }

    if (!year || isNaN(year)) year = new Date().getFullYear();
    if (!openDate) openDate = new Date(Date.UTC(year, 9, 1, 7, 0, 0));   // Oct 1
    if (!closeDate) closeDate = new Date(Date.UTC(year, 11, 2, 6, 59, 0)); // Dec 2

    const ctx = buildTemplateContext(year, openDate, closeDate);
    preview = {
      subject: renderTemplateString(subject, ctx),
      html: renderTemplateString(html, ctx),
      context: ctx,
    };
  }

  return NextResponse.json({
    success: true,
    template: {
      key,
      name: def.name,
      description: def.description,
      delivery: def.delivery,
      subject,
      html,
      isCustomized: !!row,
      updated_at: row?.updated_at ?? null,
      updated_by: row?.updated_by ?? null,
    },
    defaults: {
      subject: def.subject,
      html: def.html,
    },
    preview,
  });
}

/**
 * PUT /api/admin/email-templates/[key]
 * Body: { subject: string, html: string }
 * Upserts the template row.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { roles, userId } = await getCookieData();
  if (!roles || !roles.includes('1')) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 },
    );
  }

  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.subject !== 'string' || typeof body.html !== 'string') {
    return NextResponse.json(
      { error: 'Body must include `subject` and `html` strings' },
      { status: 400 },
    );
  }
  const subject = body.subject.trim();
  const html = body.html;
  if (!subject) {
    return NextResponse.json({ error: 'Subject cannot be empty' }, { status: 400 });
  }
  if (!html.trim()) {
    return NextResponse.json({ error: 'HTML body cannot be empty' }, { status: 400 });
  }

  const def = DEFAULT_TEMPLATES[key];
  try {
    const row = await (prisma as any).emailTemplate.upsert({
      where: { key },
      update: { subject, html, updated_by: userId ?? undefined },
      create: {
        key,
        name: def.name,
        description: def.description,
        subject,
        html,
        updated_by: userId ?? undefined,
      },
    });

    await logUserAction(
      'UPDATE',
      'EmailTemplate',
      key,
      null,
      { key, subject_length: subject.length, html_length: html.length },
      true,
      undefined,
      request,
    );

    return NextResponse.json({ success: true, template: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[email-templates] PUT failed:', err);
    return NextResponse.json(
      {
        error: 'Failed to save template',
        detail: msg,
        hint: msg.includes('does not exist') || msg.includes('relation')
          ? 'Run the migration: psql $DATABASE_URL -f prisma/migrations/add_email_templates.sql'
          : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/email-templates/[key]
 * Resets a template back to the built-in default by removing the DB row.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const guard = await ensureSuperAdmin();
  if (guard) return guard;

  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 404 });
  }

  try {
    await (prisma as any).emailTemplate.delete({ where: { key } });
  } catch (err) {
    // If the row doesn't exist, treat as success (idempotent).
    console.warn('[email-templates] DELETE: row missing or table not migrated:', err);
  }

  await logUserAction(
    'DELETE',
    'EmailTemplate',
    key,
    null,
    { key, action: 'reset_to_default' },
    true,
    undefined,
    request,
  );

  return NextResponse.json({ success: true, message: `Template ${key} reset to default` });
}
