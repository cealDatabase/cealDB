import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, validatePassword, generateResetToken } from '@/lib/password';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstname, lastname, name } = body;

    console.log(`\n🚀 SIGNUP ATTEMPT for email: "${email}"`);
    console.log(`📊 Request timestamp: ${new Date().toISOString()}`);

    // Validate required fields
    if (!email || !firstname || !lastname) {
      console.log(`❌ MISSING REQUIRED FIELDS`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email, first name, and last name are required',
          error: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 Normalized email: "${normalizedEmail}"`);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      console.log(`❌ INVALID EMAIL FORMAT: "${normalizedEmail}"`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format',
          error: 'INVALID_EMAIL_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      console.log(`❌ USER ALREADY EXISTS: email="${existingUser.email}"`);
      return NextResponse.json(
        { 
          success: false, 
          message: 'An account with this email address already exists',
          error: 'USER_ALREADY_EXISTS' 
        },
        { status: 400 }
      );
    }

    let passwordHash = null;
    let requiresPasswordReset = true;
    let resetToken = null;
    let resetExpires = null;

    // If password is provided, validate and hash it
    if (password) {
      console.log(`🔒 Password provided, validating...`);
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        console.log(`❌ PASSWORD VALIDATION FAILED: ${passwordValidation.errors.join(', ')}`);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors,
            error: 'INVALID_PASSWORD' 
          },
          { status: 400 }
        );
      }

      passwordHash = await hashPassword(password);
      requiresPasswordReset = false; // Password was set during signup
      console.log(`✅ Password validated and hashed`);
    } else {
      console.log(`🔄 No password provided, will require password reset`);
      // Generate reset token for password setup
      resetToken = generateResetToken();
      resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }

    // Create the user
    const newUser = await db.user.create({
      data: {
        email: normalizedEmail,
        password_hash: passwordHash,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        name: name?.trim() || `${firstname.trim()} ${lastname.trim()}`,
        isactive: true,
        created_at: new Date(),
        requires_password_reset: requiresPasswordReset,
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        email_verified: false, // Will be verified through email workflow
      }
    });

    console.log(`✅ USER CREATED: ID=${newUser.id}, email="${newUser.email}"`);

    // Send welcome email
    const emailSent = await sendWelcomeEmail(
      normalizedEmail, 
      firstname, 
      resetToken || undefined // Send reset token only if no password was set
    );
    console.log(`📧 Welcome email sent: ${emailSent}`);

    // Return success response
    const response = {
      success: true,
      message: password 
        ? 'Account created successfully! You can now sign in with your email address.'
        : 'Account created successfully! Please check your email to set up your password.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        name: newUser.name,
        requiresPasswordReset: requiresPasswordReset
      },
      ...(resetToken && { resetToken }) // Include reset token if generated
    };

    console.log(`🎉 SIGNUP SUCCESSFUL for email: "${normalizedEmail}"`);
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during signup. Please try again.',
        error: 'SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}
