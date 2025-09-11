// lib/password.ts (server-only)
import { hash as aHash, verify as aVerify } from '@node-rs/argon2';

const ARGON2_OPTS = {
  // Reasonable starting point for typical Vercel/Node servers
  memoryCost: 64 * 1024, // 64 MiB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
  // argon2id is the modern variant
  type: 2, // 0=argon2d, 1=argon2i, 2=argon2id
};

export async function hashPassword(plain: string): Promise<string> {
  return aHash(plain, ARGON2_OPTS);
}

export async function verifyPassword(plain: string, encodedHash: string): Promise<boolean> {
  return aVerify(encodedHash, plain);
}

// Optional: rehash when params change (very simple check)
export function needsRehash(encodedHash: string): boolean {
  // Example heuristic: if it doesn't contain "m=65536,t=3,p=1" (64MiB,3,1), rehash.
  // A more robust parser is better, but this works as a starter.
  return !/m=65536,t=3,p=1/.test(encodedHash);
}

// Password validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate secure random token for password reset
export function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
