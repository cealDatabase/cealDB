import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

// Function to detect password hash format
function detectPasswordFormat(hash: string): 'bcrypt' | 'md5-crypt' | 'unknown' {
  if (hash.startsWith('$2y$') || hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    return 'bcrypt';
  } else if (hash.startsWith('$1$')) {
    return 'md5-crypt';
  }
  return 'unknown';
}

// Function to compare MD5-crypt passwords
async function compareMD5Crypt(plainPassword: string, hash: string): Promise<boolean> {
  try {
    // Extract salt from hash (format: $1$salt$hash)
    const parts = hash.split('$');
    if (parts.length < 4) return false;
    
    const salt = parts[2];
    
    // Use system openssl command for MD5-crypt verification
    const { execSync } = require('child_process');
    
    try {
      const computedHash = execSync(
        `openssl passwd -1 -salt "${salt}" "${plainPassword}"`,
        { encoding: 'utf8', timeout: 5000 }
      ).trim();
      
      // console.log(`MD5-crypt verification: computed=${computedHash}, expected=${hash}`);
      return computedHash === hash;
    } catch (execError) {
      console.error('OpenSSL execution error:', execError);
      
      // Fallback: try unix-crypt-td-js as backup
      try {
        const cryptModule = await import('unix-crypt-td-js');
        const crypt = (cryptModule as any).default || (cryptModule as any);
        const computedHash = crypt(plainPassword, hash);
        return computedHash === hash;
      } catch (fallbackError) {
        console.error('Fallback MD5-crypt error:', fallbackError);
        return false;
      }
    }
  } catch (error) {
    console.error('MD5-crypt comparison error:', error);
    return false;
  }
}

// Function to compare bcrypt passwords
async function compareBcrypt(plainPassword: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (error) {
    console.error('Bcrypt comparison error:', error);
    return false;
  }
}

// Main password comparison function
async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  const format = detectPasswordFormat(hash);
  
  console.log(`Comparing password with format: ${format}`);
  
  switch (format) {
    case 'bcrypt':
      return await compareBcrypt(plainPassword, hash);
    case 'md5-crypt':
      return await compareMD5Crypt(plainPassword, hash);
    default:
      console.error('Unknown password hash format:', hash.substring(0, 10) + '...');
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username and password are required' 
        },
        { status: 400 }
      );
    }

    // console.log(`Signin attempt for username: ${username}`);

    // Look up user in database with case-sensitive search first, then fallback to lowercase
    let user = await db.user.findFirst({
      where: { username: username }
    });

    // If not found with exact case, try lowercase
    if (!user) {
      user = await db.user.findFirst({
        where: { username: username.toLowerCase() }
      });
    }

    if (!user) {
      console.log(`User not found: ${username}`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found. Please check your username or contact the CEAL admin.' 
        },
        { status: 401 }
      );
    }

    // console.log(`User found: ${user.username}, password format: ${detectPasswordFormat(user.password)}`);

    // Compare password using appropriate method based on hash format
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${username}`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Incorrect password. Please try again or use "Forgot Password" if needed.' 
        },
        { status: 401 }
      );
    }

    console.log(`Successful signin for user: ${username}`);

    // Successful authentication
    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          // Add other non-sensitive user fields as needed
        },
        redirectUrl: '/admin'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during signin. Please try again.' 
      },
      { status: 500 }
    );
  }
}