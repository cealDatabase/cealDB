import * as jose from "jose";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { logAuditEvent } from "@/lib/auditLogger";

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { username, password } = body;

  // Extract data sent in

  // Validate data
  if (!username || !password) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // Lookup the user (try both original case and lowercase for compatibility)
  let user = await db.user.findFirst({
    where: { username: username },
  });
  
  // If not found, try lowercase version for backward compatibility
  if (!user) {
    user = await db.user.findFirst({
      where: { username: username.toLowerCase() },
    });
  }

  if (!user) {
    // Log failed signin attempt
    await logAuditEvent({
      username: username,
      action: 'SIGNIN_FAILED',
      success: false,
      errorMessage: 'User not found',
    }, request);
    
    return Response.json({ error: "User not found" }, { status: 400 });
  }
  // Compare password using both bcrypt and MD5-crypt formats
  let isCorrectPassword = false;

  try {
    if (user.password.startsWith('$2y$') || user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // bcrypt hash
      isCorrectPassword = await bcrypt.compare(password, user.password);
    } else if (user.password.startsWith('$1$')) {
      // MD5-crypt hash - use OpenSSL for verification
      try {
        // Extract salt from stored hash (between first and second $)
        const parts = user.password.split('$');
        const salt = parts[2];
        
        // Use OpenSSL to generate hash with same salt
        const command = `openssl passwd -1 -salt ${salt} "${password}"`;
        const computedHash = execSync(command, { encoding: 'utf8' }).trim();
        
        isCorrectPassword = computedHash === user.password;
      } catch (error) {
        console.error('MD5-crypt verification error:', error);
        return Response.json(
          {
            error: "Password verification failed",
          },
          {
            status: 500,
          }
        );
      }
    } else {
      // Unknown hash format
      console.error(`Unknown password hash format for user ${username}: ${user.password.substring(0, 10)}...`);
      return Response.json(
        {
          error: "Invalid password format in database",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error(`Password comparison error for user ${username}:`, error);
    return Response.json(
      {
        error: "Password verification failed",
      },
      {
        status: 500,
      }
    );
  }

  if (!isCorrectPassword) {
    // Log failed signin attempt due to wrong password
    await logAuditEvent({
      userId: user.id,
      username: user.username,
      action: 'SIGNIN_FAILED',
      success: false,
      errorMessage: 'Incorrect password',
    }, request);
    
    return Response.json(
      {
        error: "Incorrect password. You can click 'forgot password' to reset your password.",
      },
      {
        status: 400,
      }
    );
  }

  // Update lastlogin timestamp in New York timezone
  try {
    const nyTimeZone = 'America/New_York';
    const now = new Date();
    const nyTime = toZonedTime(now, nyTimeZone);
    const utcTime = fromZonedTime(nyTime, nyTimeZone);

    await db.user.update({
      where: { id: user.id },
      data: { lastlogin_at: utcTime }
    });
  } catch (error) {
    console.error('Failed to update lastlogin timestamp:', error);
    // Don't fail the login if timestamp update fails
  }

  // Log successful signin
  await logAuditEvent({
    userId: user.id,
    username: user.username,
    action: 'SIGNIN',
    success: true,
  }, request);

  // Create jwt token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const alg = process.env.ALG || "";

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime("72h")
    .setSubject(user.id.toString())
    .sign(secret);

  // Respond with it
  return Response.json({ token: jwt });
}
