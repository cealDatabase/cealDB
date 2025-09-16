import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, generateJWTToken, generateResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { logDebug } from '@/app/api/debug-logs/route';

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

    console.log(`\n🚀 ARGON2ID SIGNIN ATTEMPT for email: "${email}"`);
    console.log(`📊 Request timestamp: ${new Date().toISOString()}`);

    // Find user by email (treating username as email)
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: email.toLowerCase() },
          { username: email.toLowerCase().trim() }
        ]
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        isactive: true,
        password: true,
        requires_password_reset: true
      }
    });

    if (!user) {
      console.log(`❌ USER NOT FOUND: "${email}"`);
      return NextResponse.json(
        {
          success: false,
          errorType: 'USER_NOT_FOUND',
          message: 'Email not found.',
          hint: 'Double-check your email address or contact the CEAL administrator.',
          suggestions: [
            'Double-check the email address spelling',
            'Contact your CEAL administrator for account setup',
            'Ensure you are using the correct email address'
          ]
        },
        { status: 404 }
      );
    }

    console.log(`✅ USER FOUND: "${user.username}" (ID: ${user.id})`);
    
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

    // Check if user needs password reset (password is null or requires_password_reset is true)
    if (!user.password || user.requires_password_reset) {
      console.log(`🔄 PASSWORD RESET REQUIRED for user: "${email}"`);
      console.log(`Password hash exists: ${!!user.password}, Requires reset: ${user.requires_password_reset}`);
      
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

      // Determine if this is initial password setup (NULL password) or reset
      const isInitialSetup = !user.password;
      
      // Send appropriate email
      const emailSent = await sendPasswordResetEmail(
        user.username, 
        user.firstname || user.lastname || user.username, 
        resetToken,
        isInitialSetup
      );

      console.log(`📧 ${isInitialSetup ? 'Initial password setup' : 'Password reset'} email sent to ${user.username}: ${emailSent}`);

      return NextResponse.json(
        {
          success: false,
          errorType: isInitialSetup ? 'PASSWORD_SETUP_REQUIRED' : 'PASSWORD_RESET_REQUIRED',
          message: isInitialSetup ? 'Password setup required for your account.' : 'Password reset required.',
          hint: isInitialSetup ? 
            'A password setup link has been sent to your email address.' :
            'As part of our security enhancement, you must set a new password. Check your email for reset instructions.',
          suggestions: [
            'Check your email for password reset instructions',
            'Link expires in 24 hours',
            'Contact CEAL admin if you don\'t receive the email',
            'Check your spam/junk folder'
          ],
          hasEmail: true,
          resetToken: resetToken
        },
        { status: 200 }
      );
    }

    // Verify password using Argon2id
    try {
      const isValidPassword = await verifyPassword(user.password!, password);
      
      if (!isValidPassword) {
        console.log(`❌ CREDENTIALS NOT MATCH for user: "${email}"`);
        return NextResponse.json(
          { 
            success: false, 
            errorType: 'INVALID_PASSWORD',
            message: 'Credentials not match.',
            hint: 'Either click on "Forgot Password" to reset your password or contact the CEAL administrator.',
            suggestions: [
              'Click "Forgot Password" to reset your password',
              'Double-check your password (case-sensitive)',
              'Contact CEAL administrator if you continue having issues'
            ]
          },
          { status: 401 }
        );
      }

      console.log(`🎉 SUCCESSFUL ARGON2ID SIGNIN for user: "${email}"`);

      // Get user role and library information
      const userLibrary = await db.user_Library.findFirst({
        where: { user_id: user.id },
        select: { library_id: true }
      });

      const userRole = await db.users_Roles.findFirst({
        where: { user_id: user.id },
        include: { Role: true }
      });

      // Create session user object
      const sessionUser = {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        role: userRole?.Role?.role || null,
        library: userLibrary?.library_id || null,
      };

      // Generate JWT token
      const token = generateJWTToken({
        userId: user.id,
        username: user.username,
      });

      console.log(`🎉 SUCCESSFUL ARGON2ID SIGNIN for user: "${email}"`);
      console.log(`📋 Session User:`, {
        id: sessionUser.id,
        username: sessionUser.username,
        role: sessionUser.role,
        library: sessionUser.library
      });

      // Create response with cookies set in headers (Vercel compatible)
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Login successful',
          token: token, // Return token for compatibility
          user: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
          },
          redirectUrl: '/admin'
        },
        { status: 200 }
      );

      // Enhanced cookie configuration for production/Vercel compatibility
      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3); // 3 days
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction ? 'cealstats.org' : undefined; // Set domain for production

      // Cookie configuration for production
      const cookieConfig = {
        secure: isProduction,
        httpOnly: true,
        expires: expireTime,
        path: '/',
        sameSite: 'lax' as const,
        ...(domain && { domain }),
        priority: 'high' as const,
      };

      // Set authentication cookies
      response.cookies.set('session', token, cookieConfig);
      response.cookies.set('uinf', sessionUser.username.toLowerCase(), cookieConfig);
      
      if (sessionUser.role) {
        response.cookies.set('role', sessionUser.role, cookieConfig);
      }
      
      if (sessionUser.library) {
        response.cookies.set('library', sessionUser.library.toString(), cookieConfig);
      }

      console.log(`✅ Login successful: ${email}`);
      return response;

    } catch (authError) {
      console.error('Argon2id signin error:', authError);
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