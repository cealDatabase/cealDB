import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth';
import db from '@/lib/db';
import { generateResetToken } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'MISSING_CREDENTIALS',
          message: 'Both email and password are required.',
          hint: 'Please enter both your email address and password to sign in.',
          suggestions: [
            'Enter your email address',
            'Enter your password',
            'Contact CEAL admin if you need account assistance'
          ]
        },
        { status: 400 }
      );
    }

    console.log(`\n🚀 AUTH.JS SIGNIN ATTEMPT for email: "${email}"`);
    console.log(`📊 Request timestamp: ${new Date().toISOString()}`);

    // Check if user exists and needs password reset before attempting Auth.js signin
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password_hash: true,
        name: true,
        firstname: true,
        lastname: true,
        isactive: true,
        requires_password_reset: true,
      }
    });

    if (!user) {
      console.log(`❌ USER NOT FOUND: "${email}"`);
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'USER_NOT_FOUND',
          message: 'Email address not found in the system.',
          hint: 'Please double-check your email address or contact the CEAL admin for assistance.',
          suggestions: [
            'Verify your email address spelling',
            'Contact CEAL admin if you believe this is an error',
            'Check if you have an active account'
          ]
        },
        { status: 401 }
      );
    }

    console.log(`✅ USER FOUND: "${user.email}" (ID: ${user.id})`);
    
    // Check if user account is active
    if (!user.isactive) {
      console.log(`❌ INACTIVE ACCOUNT: "${email}"`);
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated.',
          hint: 'Please contact the CEAL administrator to reactivate your account.',
          suggestions: [
            'Contact CEAL admin for account reactivation',
            'Verify your account status'
          ]
        },
        { status: 401 }
      );
    }

    // Check if user needs password reset (password_hash is null or requires_password_reset is true)
    if (!user.password_hash || user.requires_password_reset) {
      console.log(`🔄 PASSWORD RESET REQUIRED for user: "${email}"`);
      console.log(`Password hash exists: ${!!user.password_hash}, Requires reset: ${user.requires_password_reset}`);
      
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
      console.log(`📧 Password reset email sent: ${emailSent}`);

      return NextResponse.json(
        { 
          success: false, 
          errorType: 'PASSWORD_RESET_REQUIRED',
          message: 'Password reset required.',
          hint: 'As part of our security enhancement, you must set a new password. Check your email for reset instructions.',
          suggestions: [
            'Check your email for password reset instructions',
            'Use the password reset link sent to your email',
            'Contact CEAL admin if you don\'t receive the email within 10 minutes'
          ],
          resetToken: resetToken, // Include for immediate password reset if needed
          hasEmail: true
        },
        { status: 403 }
      );
    }

    // Attempt Auth.js signin
    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        console.log(`❌ AUTH.JS AUTHENTICATION FAILED for user: "${email}"`);
        return NextResponse.json(
          { 
            success: false, 
            errorType: 'INVALID_PASSWORD',
            message: 'Incorrect password.',
            hint: 'Please check your password and try again. If you\'ve forgotten your password, use the "Forgot Password" option below.',
            suggestions: [
              'Double-check your password (case-sensitive)',
              'Use "Forgot Password" to reset your password',
              'Contact CEAL admin if you continue having issues'
            ]
          },
          { status: 401 }
        );
      }

      console.log(`🎉 SUCCESSFUL AUTH.JS SIGNIN for user: "${email}"`);

      // Successful authentication
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            firstname: user.firstname,
            lastname: user.lastname,
          },
          redirectUrl: '/admin'
        },
        { status: 200 }
      );

    } catch (authError) {
      console.error('Auth.js signin error:', authError);
      return NextResponse.json(
        { 
          success: false, 
          errorType: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
          hint: 'Please check your credentials and try again.',
          suggestions: [
            'Verify your email address and password',
            'Use "Forgot Password" if needed',
            'Contact CEAL admin if you continue having issues'
          ]
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { 
        success: false, 
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred during signin.',
        hint: 'This appears to be a system issue. Please try again in a moment or contact the CEAL admin.',
        suggestions: [
          'Wait a moment and try signing in again',
          'Check your internet connection',
          'Contact CEAL admin if the problem persists'
        ]
      },
      { status: 500 }
    );
  }
}