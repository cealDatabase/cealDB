import db from "@/lib/db";
import { getUserByUserName } from "@/data/fetchPrisma";
import { generateResetToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // read data off request body
    const body = await request.json();
    const { username, institution, userrole } = body;
    const institutionId = parseInt(institution);
    const userroleId = parseInt(userrole);

    // Validate required fields
    if (!username || !institution || !userrole) {
      return Response.json(
        { 
          success: false,
          errorType: 'MISSING_FIELDS',
          message: "Missing required fields.",
          hint: "Please fill in all required fields."
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return Response.json(
        { 
          success: false,
          errorType: 'INVALID_EMAIL',
          message: "Invalid email format.",
          hint: "Please enter a valid email address."
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const searchUser = await getUserByUserName(username);
    if (searchUser?.username.toLowerCase() === username.toLowerCase()) {
      return Response.json(
        { 
          success: false,
          errorType: 'USER_EXISTS',
          message: "Email already registered!",
          hint: "This email is already in use. Try signing in or use password reset if you forgot your password."
        },
        { status: 409 }
      );
    }

    // Generate password reset token for initial setup
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ----------------- Create user in db -----------------
    // Create user with no password (they'll set it via email link)
    const newUser = await db.user.create({
      data: {
        username: username.toLowerCase(),
        password: null, // No password initially - user will set via email
        isactive: true,
        requires_password_reset: true,
        email_verified: false, // Email not verified until they click the setup link
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        created_at: new Date(),
        updated_at: new Date()
      },
    });

    // Create user-library relationship
    if (institutionId) {
      await db.user_Library.create({
        data: {
          user_id: newUser.id,
          library_id: institutionId,
        },
      });
    }

    // Create user-role relationship
    if (userroleId) {
      await db.users_Roles.create({
        data: {
          user_id: newUser.id,
          role_id: userroleId,
        },
      });
    }

    console.log(`✅ NEW USER CREATED: ${username} (ID: ${newUser.id})`);

    // Create audit log entry for successful account creation
    await db.auditLog.create({
      data: {
        user_id: newUser.id,
        username: username.toLowerCase(),
        action: 'ACCOUNT_CREATED',
        success: true,
        timestamp: new Date(),
        ip_address: null,
        user_agent: null
      }
    });

    // ----------------- Send welcome email with password setup -----------------
    try {
      const emailSent = await sendWelcomeEmail(username, username, resetToken);
      
      if (emailSent) {
        console.log(`📧 Welcome email sent to: ${username}`);
        return Response.json({
          success: true,
          message: "Account created successfully! Check your email to set up your password.",
          hint: "We've sent password setup instructions to your email address."
        });
      } else {
        // If email fails, we should still return success since user was created
        console.log(`⚠️ User created but email failed for: ${username}`);
        return Response.json({
          success: true,
          message: "Account created successfully! Please contact your administrator for password setup.",
          hint: "There was an issue sending the setup email. Please contact your CEAL administrator."
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return Response.json({
        success: true,
        message: "Account created successfully! Please contact your administrator for password setup.",
        hint: "There was an issue sending the setup email. Please contact your CEAL administrator."
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { 
        success: false,
        errorType: 'SERVER_ERROR',
        message: "A technical error occurred during account creation.",
        hint: "Please try again or contact the CEAL administrator."
      },
      { status: 500 }
    );
  }
}
