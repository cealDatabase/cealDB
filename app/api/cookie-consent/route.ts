import { NextRequest, NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body; // 'accepted' or 'declined'

    await logAuditEvent({
      action: 'COOKIE_CONSENT',
      tableName: 'cookie_consent',
      newValues: { consent: action },
      success: true,
    }, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cookie consent log error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
