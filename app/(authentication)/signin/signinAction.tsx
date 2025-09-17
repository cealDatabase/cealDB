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
    // Find user in database with role and library information
    const user = await db.user.findFirst({
      where: { username: username },
      select: {
        id: true,
        username: true,
        password: true,
        firstname: true,
        lastname: true,
        User_Roles: {
          select: {
            Role: {
              select: {
                id: true,
                role: true,
                name: true,
              }
            }
          }
        },
        User_Library: {
          select: {
            Library: {
              select: {
                id: true,
                library_name: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      // Create audit log entry for failed signin attempt
      await db.auditLog.create({
        data: {
          user_id: null,
          username: username,
          action: 'SIGNIN',
          success: false,
          error_message: 'User not found',
          timestamp: new Date(),
          ip_address: null,
          user_agent: null
        }
      });
      
      return {
        success: false,
        errorType: 'USER_NOT_FOUND',
        message: 'No user found with this email address.',
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
      // Create audit log entry for failed password attempt
      await db.auditLog.create({
        data: {
          user_id: user.id,
          username: user.username,
          action: 'SIGNIN',
          success: false,
          error_message: 'Invalid password',
          timestamp: new Date(),
          ip_address: null,
          user_agent: null
        }
      });

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
    
    // Set user's actual role and library from database
    console.log(`🔍 Raw User_Roles data:`, JSON.stringify(user.User_Roles, null, 2));
    const userRoleIds = user.User_Roles?.map(userRole => userRole.Role.id.toString()) || ['2'];
    const userLibraryId = user.User_Library?.[0]?.Library?.id?.toString() || '';
    
    console.log(`🎭 Processed Role IDs: [${userRoleIds.join(', ')}]`);
    
    // Store role IDs array as JSON string in cookie
    cookieStore.set('role', JSON.stringify(userRoleIds), cookieOptions);
    cookieStore.set('library', userLibraryId, cookieOptions);

    // Update user's last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastlogin_at: new Date() }
    });

    // Create a session record
    const sessionRecord = await db.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expires: expireTime
      }
    });

    // Create audit log entry for successful signin
    await db.auditLog.create({
      data: {
        user_id: user.id,
        username: user.username,
        action: 'SIGNIN',
        success: true,
        timestamp: new Date(),
        ip_address: null, // We don't have access to IP in server actions
        user_agent: null  // We don't have access to user agent in server actions
      }
    });

    console.log(`✅ Server Action: Login successful for ${username}`);
    console.log(`🍪 Server Action: Cookies set directly via cookies() API`);
    console.log(`👤 User Role IDs: [${userRoleIds.join(', ')}], Library ID: ${userLibraryId}`);
    console.log(`📊 Session created: ${sessionRecord.id}, Last login updated`);

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
    
    // Try to create audit log entry for the error (but don't fail if this fails)
    try {
      await db.auditLog.create({
        data: {
          user_id: null,
          username: username || 'unknown',
          action: 'SIGNIN',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          ip_address: null,
          user_agent: null
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log for signin error:', auditError);
    }
    
    return {
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'An error occurred during authentication.',
      hint: 'Please try again or contact support if the problem persists.',
    };
  }
}
