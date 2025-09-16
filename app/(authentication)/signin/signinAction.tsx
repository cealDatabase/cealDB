"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { verifyPassword, generateJWTToken } from '@/lib/auth';

export default async function signinAction(
  currentState: any,
  formData: FormData
): Promise<any> {
  // Get data off form - using username field but treating it as email
  const usernameRaw = formData.get("email")?.toString() || formData.get("username")?.toString();
  const username = usernameRaw && usernameRaw.toLowerCase();
  const password = formData.get("password")?.toString();
  
  // Validate input
  if (!username || !password) {
    return {
      success: false,
      errorType: 'MISSING_CREDENTIALS',
      message: 'Both username and password are required.',
      hint: 'Please enter both your username and password to sign in.',
    };
  }

  try {
    // Find user in database
    const user = await db.user.findFirst({
      where: { username: username },
      select: {
        id: true,
        username: true,
        password: true,
        firstname: true,
        lastname: true,
      }
    });

    if (!user) {
      return {
        success: false,
        errorType: 'USER_NOT_FOUND',
        message: 'No account found with this email address.',
        hint: 'Please check your email address or contact your administrator.',
      };
    }

    // Verify password - handle null password
    if (!user.password) {
      return {
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        message: 'Account has no password set.',
        hint: 'Please contact your administrator.',
      };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      // Check if this is due to old password format
      if (!user.password.startsWith('$argon2id$')) {
        return {
          success: false,
          errorType: 'PASSWORD_MIGRATION_REQUIRED',
          message: 'Password format migration required.',
          hint: 'Your account uses an outdated password format. Please reset your password to continue.',
          suggestions: [
            'Click "Forgot Password" to reset your password',
            'Your new password will use modern Argon2id encryption',
            'Contact admin if you need assistance'
          ]
        };
      }

      return {
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        hint: 'Please check your credentials and try again.',
      };
    }

    // Generate JWT token
    const token = generateJWTToken({
      userId: user.id,
      username: user.username,
    });

    // Set cookies using Server Action cookies API
    const cookieStore = await cookies();
    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3); // 3 days
    
    const cookieOptions = {
      secure: false, // For development
      httpOnly: true,
      expires: expireTime,
      path: '/',
      sameSite: 'lax' as const,
    };

    // Set essential authentication cookies
    cookieStore.set('session', token, cookieOptions);
    cookieStore.set('uinf', user.username.toLowerCase(), cookieOptions);
    
    // Set basic role (we'll add proper role/library lookup later)
    cookieStore.set('role', 'ROLE_ADMIN', cookieOptions);
    cookieStore.set('library', '56', cookieOptions);

    console.log(`✅ Server Action: Login successful for ${username}`);
    console.log(`🍪 Server Action: Cookies set directly via cookies() API`);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      }
    };

  } catch (error) {
    console.error('Server Action signin error:', error);
    return {
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'An error occurred during authentication.',
      hint: 'Please try again or contact support if the problem persists.',
    };
  }
}
