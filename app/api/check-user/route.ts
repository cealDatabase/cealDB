import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateResetToken } from '@/lib/auth';
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
          hint: 'Please enter your email address to continue.'
        },
        { status: 400 }
      );
    }

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
        requires_password_reset: true,
        password_reset_token: true,
        password_reset_expires: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'USER_NOT_FOUND',
          message: 'No account found with this email address.',
          hint: 'Please check your email address or contact your CEAL administrator.',
          suggestions: [
            'Double-check the email address spelling',
            'Contact your CEAL administrator for account setup',
            'Ensure you are using the correct email address'
          ]
        },
        { status: 404 }
      );
    }

    if (!user.isactive) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated.',
          hint: 'Please contact your CEAL administrator to reactivate your account.',
          suggestions: [
            'Contact your CEAL administrator',
            'Provide your email address for account verification'
          ]
        },
        { status: 401 }
      );
    }

    // Check if user needs password setup/reset
    const needsPasswordSetup = !user.password;
    const needsPasswordReset = user.requires_password_reset === true;

    if (needsPasswordSetup || needsPasswordReset) {
      console.log(`🔄 PASSWORD ${needsPasswordSetup ? 'SETUP' : 'RESET'} REQUIRED for user: "${email}"`);
      
      // Generate reset token if one doesn't exist or is expired
      let resetToken = user.password_reset_token;
      let resetExpires = user.password_reset_expires;
      
      if (!resetToken || !resetExpires || resetExpires < new Date()) {
        resetToken = generateResetToken();
        resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await db.user.update({
          where: { id: user.id },
          data: {
            password_reset_token: resetToken,
            password_reset_expires: resetExpires,
            requires_password_reset: true
          }
        });
      }

      // Send appropriate email
      const emailSent = await sendPasswordResetEmail(
        user.username,
        user.firstname || user.lastname || user.username,
        resetToken,
        needsPasswordSetup
      );

      console.log(`📧 ${needsPasswordSetup ? 'Password setup' : 'Password reset'} email sent to ${user.username}: ${emailSent}`);

      return NextResponse.json(
        {
          success: true,
          userStatus: 'NEEDS_PASSWORD_SETUP',
          needsPasswordSetup,
          needsPasswordReset,
          message: needsPasswordSetup ? 
            'Welcome! Your account needs a password to be set up.' :
            'Your account requires a password reset.',
          hint: 'A password setup link has been sent to your email address.',
          suggestions: [
            'Check your email for the password setup link',
            'The link will expire in 24 hours',
            'Check your spam/junk folder if you don\'t see the email',
            'Contact CEAL admin if you need assistance'
          ],
          user: {
            email: user.username,
            name: user.firstname && user.lastname ? 
              `${user.firstname} ${user.lastname}` : 
              user.firstname || user.lastname || user.username
          }
        },
        { status: 200 }
      );
    }

    // User has password and doesn't need reset - ready for password input
    return NextResponse.json(
      {
        success: true,
        userStatus: 'READY_FOR_PASSWORD',
        message: 'Please enter your password to continue.',
        user: {
          email: user.username,
          name: user.firstname && user.lastname ? 
            `${user.firstname} ${user.lastname}` : 
            user.firstname || user.lastname || user.username
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      {
        success: false,
        errorType: 'SERVER_ERROR',
        message: 'A technical error occurred.',
        hint: 'Please try again in a moment or contact the CEAL admin.'
      },
      { status: 500 }
    );
  }
}
