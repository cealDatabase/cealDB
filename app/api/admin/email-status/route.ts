import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/auth';
import { findSendRecordByRef, getSendRecords } from '@/lib/emailActivity';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/email-status
 *
 * Every email the system sent, newest first, read from the audit log
 * (lib/emailActivity.ts). For the Email Send Status page; Super Admin only.
 * With ?ref=EM-…, only the entry that error code points to.
 */
export async function GET(request: Request) {
  if (!(await requireRoles(1))) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
  }
  try {
    const ref = new URL(request.url).searchParams.get('ref');
    const records = ref ? await findSendRecordByRef(ref) : await getSendRecords();
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Email status error:', error);
    return NextResponse.json({ error: 'Failed to read the send records' }, { status: 500 });
  }
}
