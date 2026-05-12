import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import db from '@/lib/db';
import {
  DEFAULT_TEMPLATES,
  TemplateKey,
  buildTemplateContext,
  renderTemplate,
} from '@/lib/emailTemplate';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

/**
 * POST /api/admin/email-templates/[key]/send
 *
 * Manually sends a broadcast template via Resend, immediately, to the audience
 * configured in RESEND_BROADCAST_LIST_ID. Only allowed for templates whose
 * `delivery` is `manual_broadcast` (currently: `broadcast_announcement`).
 *
 * Source of placeholder values:
 *   - Latest SurveySession (must exist; we don't want to send an announcement
 *     before a session has been scheduled).
 *
 * Body (optional): { confirm: true } — required to actually send.
 *                  If `confirm` is missing or false, returns a dry-run preview.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  // --- Auth -----------------------------------------------------------------
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('role')?.value;
  let roles: string[] = [];
  if (roleCookie) {
    try { roles = JSON.parse(roleCookie); } catch { roles = [roleCookie]; }
  }
  if (!roles.includes('1')) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 },
    );
  }
  const userIdCookie = cookieStore.get('user_id')?.value || cookieStore.get('userId')?.value;
  const userId = userIdCookie ? Number(userIdCookie) : null;

  // --- Validate key ---------------------------------------------------------
  const { key } = await params;
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_TEMPLATES, key)) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 404 });
  }
  const templateKey = key as TemplateKey;
  const def = DEFAULT_TEMPLATES[templateKey];
  if (def.delivery !== 'manual_broadcast') {
    return NextResponse.json(
      {
        error: `Template "${templateKey}" is not manually sendable from this endpoint.`,
        detail: `Its delivery type is "${def.delivery}". Only "manual_broadcast" templates can be sent here.`,
      },
      { status: 400 },
    );
  }

  // --- Find the session that provides placeholder values --------------------
  const session = await prisma.surveySession.findFirst({
    orderBy: { academicYear: 'desc' },
  });
  if (!session) {
    return NextResponse.json(
      { error: 'No SurveySession found. Schedule a session on /admin/broadcast (or /admin/survey-dates) before sending an announcement.' },
      { status: 400 },
    );
  }

  const ctx = buildTemplateContext(
    session.academicYear,
    new Date(session.openingDate),
    new Date(session.closingDate),
  );
  const rendered = await renderTemplate(templateKey, ctx);

  // --- Dry-run (no `confirm: true` in body) ---------------------------------
  const body = await request.json().catch(() => ({}));
  if (!body?.confirm) {
    return NextResponse.json({
      dryRun: true,
      message: 'No email was sent. Re-POST with body { "confirm": true } to actually send.',
      subject: rendered.subject,
      htmlPreview: rendered.html,
      context: ctx,
      session: {
        year: session.academicYear,
        openingDate: session.openingDate,
        closingDate: session.closingDate,
        announcementSentAt: (session as any).announcementSentAt ?? null,
      },
    });
  }

  // --- Actually send via Resend --------------------------------------------
  const audienceId = process.env.RESEND_BROADCAST_LIST_ID;
  if (!audienceId) {
    return NextResponse.json(
      { error: 'RESEND_BROADCAST_LIST_ID is not configured.' },
      { status: 500 },
    );
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured.' },
      { status: 500 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let broadcastId: string | undefined;
  try {
    const created = await resend.broadcasts.create({
      audienceId,
      from: 'CEAL Statistics Database <noreply@cealstats.org>',
      subject: rendered.subject,
      html: rendered.html,
    });
    broadcastId = created.data?.id;
    if (!broadcastId) {
      throw new Error('Resend did not return a broadcast id');
    }
    await resend.broadcasts.send(broadcastId);
  } catch (err) {
    console.error(`[email-templates/${templateKey}/send] Resend error:`, err);
    return NextResponse.json(
      {
        error: 'Resend rejected the broadcast',
        detail: err instanceof Error ? err.message : String(err),
        broadcastId,
      },
      { status: 502 },
    );
  }

  // --- Stamp the session so the UI shows it's already been sent ------------
  try {
    await prisma.surveySession.update({
      where: { id: session.id },
      data: { announcementSentAt: new Date() } as any,
    });
  } catch (err) {
    // Migration may not have run yet — non-fatal, just log.
    console.warn('[email-templates] Could not stamp announcementSentAt (migration pending?):', err);
  }

  try {
    await logUserAction(
      'CREATE',
      'EmailBroadcast',
      `manual:${templateKey}`,
      null,
      {
        templateKey,
        broadcastId,
        academicYear: session.academicYear,
        subject: rendered.subject,
      },
      true,
      undefined,
      request,
    );
  } catch (err) {
    console.warn('[email-templates] Audit log failed:', err);
  }

  return NextResponse.json({
    success: true,
    sent: true,
    broadcastId,
    subject: rendered.subject,
    audienceId,
    session: { year: session.academicYear },
  });
}
