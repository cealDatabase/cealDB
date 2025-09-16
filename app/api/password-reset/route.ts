import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'MISSING_EMAIL',
          message: 'Email address is required.',
          hint: 'Please provide your email address.',
        },
        { status: 400 }
      );
    }

    // Request password reset
    return handlePasswordResetRequest(email);
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred.',
        hint: 'Please try again in a moment or contact the CEAL admin.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token and password are required.',
        },
        { status: 400 }
      );
    }

    // Handle password reset with token
    return handlePasswordReset(token, password);
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'A technical error occurred.',
      },
      { status: 500 }
    );
  }
}

async function handlePasswordResetRequest(email: string) {
  try {
    // Find user by username (same as email)
    const user = await db.user.findUnique({
      where: { username: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        isactive: true,
      }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
          hint: 'Check your email for password reset instructions.',
        },
        { status: 200 }
      );
    }

    if (!user.isactive) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'ACCOUNT_INACTIVE',
          message: 'Account is deactivated.',
          hint: 'Please contact the CEAL administrator.',
        },
        { status: 401 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        requires_password_reset: true
      }
    });

    // Send reset email
    const emailSent = await sendPasswordResetEmail(
      user.username, 
      user.firstname || user.lastname || user.username, 
      resetToken
    );

    console.log(`📧 Password reset email sent to ${user.username}: ${emailSent}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
        hint: 'Check your email for the reset link. It will expire in 24 hours.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      {
        success: false,
        errorType: 'SERVER_ERROR',
        message: 'Failed to send reset email.',
        hint: 'Please try again or contact the CEAL admin.',
      },
      { status: 500 }
    );
  }
}

async function handlePasswordReset(token: string, newPassword: string) {
  try {
    // Validate password strength
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
          hint: 'Please choose a stronger password with at least 8 characters.',
        },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          gt: new Date() // Token not expired
        },
        isactive: true
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token.',
          hint: 'Please request a new password reset if needed.',
        },
        { status: 401 }
      );
    }

    // Hash new password with Argon2id
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        requires_password_reset: false,
        updated_at: new Date()
      }
    });

    console.log(`🔐 Password reset successful for user: ${user.username}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully.',
        hint: 'You can now sign in with your new password.',
        redirectUrl: '/signin'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset completion error:', error);
    return NextResponse.json(
      {
        success: false,
        errorType: 'SERVER_ERROR',
        message: 'Failed to reset password.',
        hint: 'Please try again or contact the CEAL admin.',
      },
      { status: 500 }
    );
  }
}
