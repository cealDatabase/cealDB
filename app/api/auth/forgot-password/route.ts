import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateResetToken } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input - require email
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'MISSING_EMAIL',
          message: 'Email address is required.',
          hint: 'Please enter your email address to reset your password.',
          suggestions: [
            'Enter your email address',
            'Make sure the email is correctly spelled',
            'Contact CEAL admin if you don\'t remember your email'
          ]
        },
        { status: 400 }
      );
    }

    console.log(`🔄 FORGOT PASSWORD REQUEST for email: ${email}`);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success message for security (don't reveal if user exists)
    const successResponse = {
      success: true,
      message: 'Password reset instructions sent.',
      hint: 'If an account with that information exists, you will receive password reset instructions via email within a few minutes.',
      suggestions: [
        'Check your email inbox and spam folder',
        'Click the reset link in the email',
        'Contact CEAL admin if you don\'t receive an email within 15 minutes'
      ]
    };

    if (!user) {
      console.log(`❌ USER NOT FOUND for forgot password: ${email}`);
      // Return success message anyway for security
      return NextResponse.json(successResponse, { status: 200 });
    }

    console.log(`✅ USER FOUND for forgot password: "${user.email}" (ID: ${user.id})`);

    // Check if user account is active
    if (!user.isactive) {
      console.log(`❌ INACTIVE ACCOUNT for forgot password: "${user.email}"`);
      // Return success message anyway for security
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Generate password reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        requires_password_reset: true
      }
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, user.name || user.email, resetToken);
    console.log(`📧 Forgot password email sent: ${emailSent} to ${user.email}`);

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred.',
        hint: 'This appears to be a system issue. Please try again or contact the CEAL admin.',
        suggestions: [
          'Try again in a moment',
          'Contact CEAL admin if the problem persists'
        ]
      },
      { status: 500 }
    );
  }
}
