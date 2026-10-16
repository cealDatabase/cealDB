import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { getSendRecords } from '@/lib/emailActivity';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/email-status
 *
 * Every email the system sent, newest first, read from the audit log
 * (lib/emailActivity.ts). For the Email Send Status page; Super Admin only.
 */
export async function GET() {
  if (!(await requireRoles(1))) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }
  try {
    const records = await getSendRecords();
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Email status error:', error);
    return NextResponse.json({ error: 'Failed to read the send records' }, { status: 500 });
  }
}
