import { NextRequest } from 'next/server';
import * as jose from 'jose';
import { logAuditEvent } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    // Get user information from JWT token before signing out
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    let userId: number | undefined;
    let username: string | undefined;

    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        userId = parseInt(payload.sub || '0');
        
        // Get username from database if we have userId
        if (userId) {
          const db = (await import('@/lib/db')).default;
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { username: true }
          });
          username = user?.username;
        }
      } catch (error) {
        console.error('Token verification failed during signout:', error);
      }
    }

    // Log signout event
    await logAuditEvent({
      userId,
      username,
      action: 'SIGNOUT',
      success: true,
    }, request);

    return Response.json({ message: 'Signed out successfully' });
    
  } catch (error) {
    console.error('Signout error:', error);
    
    // Log failed signout
    await logAuditEvent({
      action: 'SIGNOUT',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }, request);

    return Response.json(
      { error: 'Signout failed' },
      { status: 500 }
    );
  }
}
