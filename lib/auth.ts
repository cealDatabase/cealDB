import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import db from './db';

// Authentication secret - should be in environment variables in production
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';

export interface SessionUser {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string | null;
  role?: string | null;
  library?: number | null;
}

export interface JWTPayload {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
}

// Password hashing with Argon2id
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Verify password with Argon2id
export async function verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Generate JWT token
export function generateJWTToken(payload: JWTPayload): string {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: '3d', // 3 days
    algorithm: 'HS256'
  });
}

// Verify JWT token
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Generate secure random password reset token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Session token management (using jsonwebtoken library for consistency)
export function generateSessionToken(username: string): string {
  const payload: JWTPayload = {
    userId: 0, // Will be set by caller if needed
    username: username.toLowerCase()
  };
  
  return generateJWTToken(payload);
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  const payload = verifyJWTToken(token);
  return payload ? { username: payload.username } : null;
}

// Get current user session
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const payload = verifyJWTToken(sessionToken);
    if (!payload) {
      return null;
    }

    // Get user from database with additional info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        isactive: true,
      }
    });

    if (!user || !user.isactive) {
      return null;
    }

    // Get user role and library info
    const userLibrary = await db.user_Library.findFirst({
      where: { user_id: user.id },
      select: { library_id: true }
    });

    const userRole = await db.users_Roles.findFirst({
      where: { user_id: user.id },
      include: { Role: true }
    });

    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: userRole?.Role?.role || null,
      library: userLibrary?.library_id || null,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Set session cookies with consistent configuration
export async function setSessionCookies(user: SessionUser, token: string) {
  const cookieStore = await cookies();
  const expireTime = Date.now() + 24 * 60 * 60 * 1000 * 3; // 3 days
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? 'cealstats.org' : undefined;

  const cookieConfig = {
    secure: isProduction,
    httpOnly: true,
    expires: new Date(expireTime),
    path: '/',
    sameSite: 'lax' as const,
    ...(domain && { domain }),
    priority: 'high' as const,
  };

  // Set authentication cookies
  cookieStore.set('session', token, cookieConfig);
  // Set user info (uinf = username/email) for quick access  
  cookieStore.set('uinf', user.username.toLowerCase(), cookieConfig);
  
  if (user.role) {
    cookieStore.set('role', user.role, cookieConfig);
  }
  
  if (user.library) {
    cookieStore.set('library', user.library.toString(), cookieConfig);
  }
}

// Clear session cookies with production domain handling
export async function clearSessionCookies() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? 'cealstats.org' : undefined;
  
  const cookieNames = ['session', 'uinf', 'role', 'library'];
  cookieNames.forEach(name => {
    if (domain) {
      cookieStore.set(name, '', {
        domain,
        expires: new Date(0),
        path: '/',
      });
    } else {
      cookieStore.delete(name);
    }
  });
}

// Check if user requires password reset
export async function userRequiresPasswordReset(userId: number): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        password: true, 
        requires_password_reset: true 
      }
    });

    return !user?.password || user?.requires_password_reset === true;
  } catch (error) {
    console.error('Check password reset error:', error);
    return true; // Fail safe - require reset if error
  }
}
