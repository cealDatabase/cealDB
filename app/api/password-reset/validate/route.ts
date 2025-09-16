import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required.',
        },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await db.user.findFirst({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          gt: new Date() // Token must not be expired
        }
      },
      select: {
        id: true,
        username: true,
        password_reset_expires: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset token.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token is valid.',
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to validate token.',
      },
      { status: 500 }
    );
  }
}
