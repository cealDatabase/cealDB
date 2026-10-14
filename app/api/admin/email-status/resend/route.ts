import { NextRequest, NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getBroadcastStatus, getEmailStatus, getRecentEmails, isResendId } from '@/lib/emailActivity';

export const dynamic = 'force-dynamic';
// A broadcast takes a few Resend requests, spaced out for its rate limit.
export const maxDuration = 30;

/**
 * GET /api/admin/email-status/resend
 *
 *   ?broadcastId=<id>  status, delivery totals and bounces of one broadcast
 *   ?emailId=<id>      latest event of one transactional email
 *   ?recent=1          transactional emails of the last 24 hours
 *
 * Reads from Resend only; nothing is sent. Super Admin only.
 */
export async function GET(request: NextRequest) {
  if (!(await requireRoles(1))) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const broadcastId = params.get('broadcastId');
  const emailId = params.get('emailId');

  try {
    if (broadcastId !== null) {
      if (!isResendId(broadcastId)) return NextResponse.json({ error: 'Invalid broadcast id' }, { status: 400 });
      return NextResponse.json(await getBroadcastStatus(broadcastId));
    }
    if (emailId !== null) {
      if (!isResendId(emailId)) return NextResponse.json({ error: 'Invalid email id' }, { status: 400 });
      return NextResponse.json(await getEmailStatus(emailId));
    }
    if (params.get('recent')) {
      return NextResponse.json(await getRecentEmails());
    }
    return NextResponse.json({ error: 'Pass broadcastId, emailId or recent=1' }, { status: 400 });
  } catch (error) {
    console.error('Resend status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Resend status lookup failed' },
      { status: 502 },
    );
  }
}
