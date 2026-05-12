import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Resend } from 'resend';
import { cookies } from 'next/headers';
import { logUserAction } from '@/lib/auditLogger';
import { buildTemplateContext, renderTemplate } from '@/lib/emailTemplate';

const prisma = db;

async function getUserRolesFromCookies(): Promise<string[] | null> {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('role')?.value;
    if (!roleCookie) return null;
    try {
      return JSON.parse(roleCookie);
    } catch {
      return [roleCookie];
    }
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // AuthZ: Super Admin (role "1") only
    const roles = await getUserRolesFromCookies();
    if (!roles || !roles.includes('1')) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { email, year: yearInput } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 });
    }

    // Find the session: use provided year or the most recent session
    let session: any = null;

    if (yearInput) {
      session = await prisma.surveySession.findUnique({ where: { academicYear: Number.parseInt(String(yearInput)) } });
    } else {
      session = await prisma.surveySession.findFirst({ orderBy: { academicYear: 'desc' } });
    }

    if (!session) {
      return NextResponse.json({ error: 'No survey session found. Create a session first on the Survey Dates page.' }, { status: 404 });
    }

    const year = session.academicYear;
    const openDate = new Date(session.openingDate);
    const closeDate = new Date(session.closingDate);

    // Render editable template (DB-backed, falls back to default)
    const ctx = buildTemplateContext(year, openDate, closeDate);
    const { subject: emailSubject, html: emailHtml } = await renderTemplate('individual_open_forms', ctx);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'CEAL Statistics Database <noreply@cealstats.org>',
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send individual email:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Audit log
    try {
      await logUserAction(
        'CREATE',
        'Email',
        data?.id || 'resend',
        null,
        { to: email, year, openingDate: openDate.toISOString(), closingDate: closeDate.toISOString(), mode: 'individual' },
        true,
        undefined,
        request,
      );
    } catch (logErr) {
      console.error('Audit log failed for individual email:', logErr);
    }

    return NextResponse.json({ success: true, id: data?.id, message: `Email sent to ${email}` });
  } catch (err) {
    console.error('Send individual email error:', err);
    return NextResponse.json(
      { error: 'Unexpected error sending email' },
      { status: 500 },
    );}
}
