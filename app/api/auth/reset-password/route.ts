import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    // Validate input
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'MISSING_FIELDS',
          message: 'Token, new password, and confirmation are required.',
          hint: 'Please fill in all required fields.',
          suggestions: [
            'Enter your new password',
            'Confirm your new password',
            'Make sure passwords match'
          ]
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match.',
          hint: 'Please make sure both password fields contain the same value.',
          suggestions: [
            'Check that both password fields match exactly',
            'Retype your password carefully'
          ]
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'WEAK_PASSWORD',
          message: 'Password does not meet security requirements.',
          hint: 'Your password must meet all security requirements listed below.',
          suggestions: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    console.log(`🔄 PASSWORD RESET ATTEMPT with token: ${token.substring(0, 8)}...`);

    // Find user with this reset token
    const user = await db.user.findFirst({
      where: { 
        password_reset_token: token,
        password_reset_expires: {
          gt: new Date() // Token hasn't expired
        }
      }
    });

    if (!user) {
      console.log(`❌ INVALID OR EXPIRED TOKEN: ${token.substring(0, 8)}...`);
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'INVALID_TOKEN',
          message: 'Invalid or expired password reset token.',
          hint: 'Your password reset link may have expired or been used already.',
          suggestions: [
            'Request a new password reset link',
            'Check that you\'re using the latest reset email',
            'Contact CEAL admin if you continue having issues'
          ]
        },
        { status: 401 }
      );
    }

    console.log(`✅ VALID TOKEN for user: "${user.username}" (ID: ${user.id})`);

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user with new password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        requires_password_reset: false,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date()
      }
    });

    console.log(`🎉 PASSWORD RESET SUCCESSFUL for user: "${user.username}"`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset successful',
        hint: 'Your password has been updated successfully. You can now sign in with your new password.',
        redirectUrl: '/signin'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred during password reset.',
        hint: 'This appears to be a system issue. Please try again or contact the CEAL admin.',
        suggestions: [
          'Try again in a moment',
          'Request a new password reset link',
          'Contact CEAL admin if the problem persists'
        ]
      },
      { status: 500 }
    );
  }
}

// GET endpoint to validate reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'MISSING_TOKEN',
          message: 'Reset token is required.'
        },
        { status: 400 }
      );
    }

    // Check if token is valid and not expired
    const user = await db.user.findFirst({
      where: { 
        password_reset_token: token,
        password_reset_expires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'INVALID_TOKEN',
          message: 'Invalid or expired password reset token.'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Valid reset token',
        user: {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred.'
      },
      { status: 500 }
    );
  }
}
