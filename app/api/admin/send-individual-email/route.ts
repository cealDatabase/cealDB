import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { cookies } from 'next/headers';
import { logUserAction } from '@/lib/auditLogger';

const prisma = new PrismaClient();

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

    // Format dates as in broadcast template
    const formattedOpenDate = new Date(openDate).toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedCloseDate = new Date(closeDate).toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Email HTML (based on broadcast email)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h3 style="color: #1e40af; margin-bottom: 20px;">Dear Coordinator of the CEAL Statistics Survey,</h3>
        <p style="margin-bottom: 16px;"><strong>Greetings! The annual CEAL Statistics online surveys are now open.</strong></p>
        <div style="margin: 24px 0;">
          <p style="color: #1e40af; margin-top: 0; margin-bottom: 12px;">Reporting Period:</p>
          <p style="margin: 0;">Please report data for <strong>Fiscal Year (FY) ${year - 1}–${year}</strong>, generally <strong>July 1, ${year - 1} through June 30, ${year}</strong>.</p>
        </div>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <h4 style="color: #92400e; margin-top: 0; margin-bottom: 12px;">Data Collection Period:</h4>
          <p style="margin: 0;">The CEAL Online Survey will be open from <strong>${formattedOpenDate} through ${formattedCloseDate} (11:59 PM Pacific Time)</strong>.</p>
        </div>
        <div style="margin: 24px 0;">
          <h4 style="color: #374151; margin-top: 0; margin-bottom: 12px;">Accessing the Surveys:</h4>
          <p style="margin-bottom: 16px;">Visit the CEAL Statistics Database at <a href="https://cealstats.org/" style="color: #2563eb; text-decoration: none; font-weight: 600;">https://cealstats.org/</a> to access the online survey forms and instructions.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://cealstats.org/" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Access Survey Forms</a>
        </div>
        <p style="margin-bottom: 8px;">Thank you for your continued participation and support!</p>
        <p style="margin-bottom: 20px;"><strong>Warm regards,</strong><br/>CEAL Statistics Committee</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;"/>
        <p style="font-size: 12px; color: #6b7280; text-align: left;">This message was sent to you individually by a super admin upon request.</p>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'CEAL Statistics Database <noreply@cealstats.org>',
      to: email,
      subject: `CEAL Statistics Online Surveys Are Now Open`,
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
    );
  } finally {
    await prisma.$disconnect();
  }
}
