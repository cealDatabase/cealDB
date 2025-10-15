import { execSync } from 'child_process';

/**
 * Password utility functions for the CEAL Statistics Database
 * Provides MD5-crypt hashing for new users and password verification
 */

/**
 * Generate a random salt for MD5-crypt hashing
 * @returns {string} Random 8-character salt
 */
function generateRandomSalt(): string {
  const saltChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
  let salt = '';
  for (let i = 0; i < 8; i++) {
    salt += saltChars.charAt(Math.floor(Math.random() * saltChars.length));
  }
  return salt;
}

/**
 * Create MD5-crypt hash using OpenSSL system call
 * This is the preferred method for new user passwords
 * @param {string} password - The plain text password to hash
 * @returns {string|null} The MD5-crypt hash starting with $1$ or null if failed
 */
export function hashPasswordMD5Crypt(password: string): string | null {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    const salt = generateRandomSalt();
    
    // Use shell escaping to handle special characters in password
    const escapedPassword = password.replace(/'/g, "'\"'\"'");
    
    const hash = execSync(
      `openssl passwd -1 -salt '${salt}' '${escapedPassword}'`,
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    
    // Verify the hash format
    if (!hash.startsWith('$1$')) {
      throw new Error('Generated hash does not have expected MD5-crypt format');
    }
    
    return hash;
  } catch (error) {
    console.error('Error creating MD5-crypt hash:', error);
    return null;
  }
}

/**
 * Verify a password against an MD5-crypt hash
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The MD5-crypt hash to verify against
 * @returns {boolean} True if password matches hash
 */
export function verifyMD5CryptPassword(password: string, hash: string): boolean {
  try {
    if (!password || !hash || typeof password !== 'string' || typeof hash !== 'string') {
      return false;
    }

    const parts = hash.split('$');
    if (parts.length < 4 || parts[1] !== '1') {
      return false;
    }
    
    const salt = parts[2];
    
    // Use shell escaping to handle special characters in password
    const escapedPassword = password.replace(/'/g, "'\"'\"'");
    
    const computedHash = execSync(
      `openssl passwd -1 -salt '${salt}' '${escapedPassword}'`,
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    
    return computedHash === hash;
  } catch (error) {
    console.error('Error verifying MD5-crypt password:', error);
    return false;
  }
}

/**
 * Detect password format
 * @param {string} password - The password/hash to analyze
 * @returns {string} The detected format: 'bcrypt', 'md5-crypt', 'plaintext', 'empty', or 'unknown'
 */
export function detectPasswordFormat(password: string): string {
  if (!password) return 'empty';
  if (password.startsWith('$2y$') || password.startsWith('$2b$') || password.startsWith('$2a$')) {
    return 'bcrypt';
  } else if (password.startsWith('$1$')) {
    return 'md5-crypt';
  } else if (password.length < 20 && !/^\$/.test(password)) {
    return 'plaintext';
  }
  return 'unknown';
}

/**
 * Generate a secure random password
 * @param {number} length - The length of the password (default: 12)
 * @returns {string} A random password
 */
export function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
