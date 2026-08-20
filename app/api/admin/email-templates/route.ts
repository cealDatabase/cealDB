import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdminDb } from '@/lib/auth';
import db from '@/lib/db';
import { DEFAULT_TEMPLATES, TemplateKey } from '@/lib/emailTemplate';
import { logUserAction } from '@/lib/auditLogger';

const prisma = db;

// Verified against the database via the signed session JWT. The `role` cookie
// is unsigned and therefore forgeable, so it must not gate template writes.
async function ensureSuperAdmin() {
  if (!(await isSuperAdminDb())) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 },
    );
  }
  return null;
}

/**
 * GET /api/admin/email-templates
 * Lists all known templates (DB row if it exists, otherwise the default).
 */
export async function GET() {
  const guard = await ensureSuperAdmin();
  if (guard) return guard;

  const keys = Object.keys(DEFAULT_TEMPLATES) as TemplateKey[];
  let dbRows: any[] = [];
  try {
    dbRows = await (prisma as any).emailTemplate.findMany({
      where: { key: { in: keys } },
    });
  } catch (err) {
    // Table missing — return defaults only
    console.warn('[email-templates] DB read failed, returning defaults only:', err);
  }
  const dbByKey = new Map<string, any>(dbRows.map((r) => [r.key, r]));

  // Pull the latest SurveySession once so we can surface useful side-info
  // (when the announcement was last sent, when the closing reminder will fire,
  // etc.) for each template in the UI.
  let latestSession: any = null;
  try {
    latestSession = await (prisma as any).surveySession.findFirst({
      orderBy: { academicYear: 'desc' },
    });
  } catch (err) {
    console.warn('[email-templates] SurveySession lookup failed:', err);
  }

  const templates = keys.map((key) => {
    const def = DEFAULT_TEMPLATES[key];
    const row = dbByKey.get(key);
    return {
      key,
      name: def.name,
      description: def.description,
      delivery: def.delivery,
      subject: row?.subject ?? def.subject,
      html: row?.html ?? def.html,
      isCustomized: !!row,
      updated_at: row?.updated_at ?? null,
      updated_by: row?.updated_by ?? null,
      // Per-delivery-mode metadata, only filled when relevant:
      announcementSentAt:
        def.delivery === 'manual_broadcast'
          ? latestSession?.announcementSentAt ?? null
          : null,
      closingReminderSent:
        def.delivery === 'auto_one_week_before_close'
          ? latestSession?.notifiedClosingReminder ?? null
          : null,
    };
  });

  return NextResponse.json({
    success: true,
    templates,
    session: latestSession
      ? {
          year: latestSession.academicYear,
          openingDate: latestSession.openingDate,
          closingDate: latestSession.closingDate,
          isOpen: latestSession.isOpen,
        }
      : null,
  });
}
