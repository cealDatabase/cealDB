import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPasswordMD5Crypt, detectPasswordFormat } from '@/lib/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, firstname, lastname } = body;

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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }

    console.log(`Signup attempt for username: ${username}`);

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      }
    });

    if (existingUser) {
      console.log(`User already exists: ${username}`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username already exists. Please choose a different username.' 
        },
        { status: 409 }
      );
    }

    // Hash password using MD5-crypt (preferred method)
    console.log('Hashing password with MD5-crypt...');
    const hashedPassword = hashPasswordMD5Crypt(password);

    if (!hashedPassword) {
      console.error('Failed to hash password');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error processing password. Please try again.' 
        },
        { status: 500 }
      );
    }

    console.log(`Password hashed successfully: ${detectPasswordFormat(hashedPassword)}`);

    // Create new user
    const newUser = await db.user.create({
      data: {
        username: username,
        password: hashedPassword,
        firstname: firstname || null,
        lastname: lastname || null,
        isactive: true,
        lastlogin_at: null
      }
    });

    console.log(`User created successfully: ID ${newUser.id}, Username: ${newUser.username}`);

    // Return success response (don't include sensitive data)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          isactive: newUser.isactive
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown error type'
    });
    
    // More specific error messages for debugging
    let errorMessage = 'An error occurred during signup. Please try again.';
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('Unique constraint')) {
      errorMessage = 'Username already exists. Please choose a different username.';
    } else if (errorMsg.includes('password')) {
      errorMessage = 'Error processing password. Please try again.';
    } else if (errorMsg.includes('database') || errorMsg.includes('connect')) {
      errorMessage = 'Database connection error. Please try again.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      },
      { status: 500 }
    );
  }
}
