import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import db from './db';

// JWT secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

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
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '3d', // 3 days
    algorithm: 'HS256'
  });
}

// Verify JWT token
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Generate secure random password reset token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Session token management
export function generateSessionToken(username: string): string {
  const payload = {
    username: username.toLowerCase(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60) // 3 days
  };
  
  const secret = process.env.AUTH_SECRET || 'default-secret-key';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');
    
  return `${header}.${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return null;
    }
    
    // Verify signature
    const secret = process.env.AUTH_SECRET || 'default-secret-key';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      username: decodedPayload.username
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
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

// Set session cookies
export async function setSessionCookies(user: SessionUser, token: string) {
  const cookieStore = await cookies();
  const expireTime = Date.now() + 24 * 60 * 60 * 1000 * 3; // 3 days

  // Set session token
  cookieStore.set('session', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(expireTime),
    path: '/',
    sameSite: 'strict',
  });

  // Set user info for quick access
  cookieStore.set('uinf', user.username.toLowerCase(), {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    expires: new Date(expireTime),
    path: '/',
  });

  // Set role cookie if available
  if (user.role) {
    cookieStore.set('role', user.role, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      expires: new Date(expireTime),
      path: '/',
    });
  }

  // Set library cookie if available
  if (user.library) {
    cookieStore.set('library', user.library.toString(), {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      expires: new Date(expireTime),
      path: '/',
    });
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
