import { hash, verify } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import db from './db';

// Authentication secret - should be in environment variables in production
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-change-in-production';

// Argon2id configuration
const ARGON2_OPTS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
  saltLength: 16,
  type: 2, // 0=argon2d, 1=argon2i, 2=argon2id
};

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
    return await hash(password, ARGON2_OPTS);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Verify password with Argon2id only
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    // Only support Argon2id - modern, secure password hashing
    if (!hashedPassword.startsWith('$argon2id$')) {
      console.error('Unsupported password format. Only Argon2id is supported.');
      console.error('Password hash starts with:', hashedPassword.substring(0, 15));
      return false;
    }

    return await verify(hashedPassword, plainPassword);
  } catch (error) {
    console.error('Argon2id password verification error:', error);
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

  // Official Next.js cookie options
  const cookieOptions = {
    secure: isProduction,
    httpOnly: true,
    expires: new Date(expireTime),
    path: '/',
    sameSite: 'lax' as const,
    priority: 'high' as const,
  };

  // Set authentication cookies using Next.js cookies API
  cookieStore.set('session', token, cookieOptions);
  cookieStore.set('uinf', user.username.toLowerCase(), cookieOptions);
  
  if (user.role) {
    cookieStore.set('role', user.role, cookieOptions);
  }
  
  if (user.library) {
    cookieStore.set('library', user.library.toString(), cookieOptions);
  }
}

// Clear session cookies
export async function clearSessionCookies() {
  const cookieStore = await cookies();
  
  const cookieNames = ['session', 'uinf', 'role', 'library'];
  cookieNames.forEach(name => {
    cookieStore.delete(name);
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
