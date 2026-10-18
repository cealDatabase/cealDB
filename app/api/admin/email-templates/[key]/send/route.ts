import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdminDb } from '@/lib/auth';
import { Resend } from 'resend';
import { sendBroadcastNow } from '@/lib/email';
import db from '@/lib/db';
import {
  DEFAULT_TEMPLATES,
  TemplateKey,
  buildTemplateContext,
  renderTemplate,
} from '@/lib/emailTemplate';
import { logUserAction } from '@/lib/auditLogger';
import { EmailFailure, emailErrorFrom, emailErrorLogFields } from '@/lib/emailError';

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
  // Super Admin only, verified against the database via the signed session JWT.
  // The `role` cookie is unsigned, so it must not gate a bulk email broadcast.
  if (!(await isSuperAdminDb())) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 },
    );
  }

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
  const apiKey = process.env.RESEND_API_KEY;
  let broadcastId: string | undefined;
  try {
    if (!audienceId) throw new EmailFailure('RESEND_BROADCAST_LIST_ID is not configured.', 'config_missing');
    if (!apiKey) throw new EmailFailure('RESEND_API_KEY is not configured.', 'config_missing');
    const resend = new Resend(apiKey);
    // Throws if Resend does not create or send it. The send result used to
    // go unchecked, so a refused send was still reported as sent.
    broadcastId = (await sendBroadcastNow(resend, {
      audienceId,
      subject: rendered.subject,
      html: rendered.html,
    })).id;
  } catch (err) {
    console.error(`[email-templates/${templateKey}/send] Resend error:`, err);
    // An error code the super admin can copy (lib/emailError.ts).
    const emailError = emailErrorFrom(err, 'template-broadcast');
    // Recorded so the Email Send Status page shows the failure and why.
    try {
      await logUserAction(
        'CREATE',
        'EmailBroadcast',
        `manual:${templateKey}`,
        null,
        { templateKey, academicYear: session.academicYear, subject: rendered.subject, ...emailErrorLogFields(emailError) },
        false,
        err instanceof Error ? err.message : String(err),
        request,
      );
    } catch (logErr) {
      console.warn('[email-templates] Audit log failed:', logErr);
    }
    return NextResponse.json(
      {
        error: emailError.code === 'config_missing' ? 'Email service not configured' : 'Resend rejected the broadcast',
        detail: err instanceof Error ? err.message : String(err),
        broadcastId,
        emailError,
      },
      { status: emailError.code === 'config_missing' ? 500 : 502 },
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
