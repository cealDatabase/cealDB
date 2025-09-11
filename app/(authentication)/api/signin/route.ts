import * as jose from "jose";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { logAuditEvent } from "@/lib/auditLogger";

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { username, password } = body;

  // Debug logging for signin attempt
  console.log(`[SIGNIN DEBUG] Attempt for username: ${username}`);
  console.log(`[SIGNIN DEBUG] Password provided: ${password ? 'YES' : 'NO'}`);
  console.log(`[SIGNIN DEBUG] Password length: ${password ? password.length : 0}`);

  // Validate data
  if (!username || !password) {
    console.log(`[SIGNIN DEBUG] Validation failed - username: ${!!username}, password: ${!!password}`);
    return Response.json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // Lookup the user (try both original case and lowercase for compatibility)
  console.log(`[SIGNIN DEBUG] Looking up user with original case: ${username}`);
  let user = await db.user.findFirst({
    where: { username: username },
  });
  
  // If not found, try lowercase version for backward compatibility
  if (!user) {
    console.log(`[SIGNIN DEBUG] User not found with original case, trying lowercase: ${username.toLowerCase()}`);
    user = await db.user.findFirst({
      where: { username: username.toLowerCase() },
    });
  }

  if (!user) {
    console.log(`[SIGNIN DEBUG] User not found in database for: ${username}`);
    // Log failed signin attempt
    await logAuditEvent({
      username: username,
      action: 'SIGNIN_FAILED',
      success: false,
      errorMessage: 'User not found',
    }, request);
    
    return Response.json({ error: "User not found" }, { status: 400 });
  }

  // Debug user found and password hash
  console.log(`[SIGNIN DEBUG] User found: ${user.username} (ID: ${user.id})`);
  console.log(`[SIGNIN DEBUG] Stored password hash: ${user.password}`);
  console.log(`[SIGNIN DEBUG] Hash length: ${user.password.length}`);
  console.log(`[SIGNIN DEBUG] Hash starts with: ${user.password.substring(0, 10)}...`);
  
  // Determine hash format
  if (user.password.startsWith('$2y$') || user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
    console.log(`[SIGNIN DEBUG] Detected bcrypt hash format`);
  } else if (user.password.startsWith('$1$')) {
    console.log(`[SIGNIN DEBUG] Detected MD5-crypt hash format`);
  } else if (user.password.startsWith('$5$')) {
    console.log(`[SIGNIN DEBUG] Detected SHA-256 crypt format`);
  } else if (user.password.startsWith('$6$')) {
    console.log(`[SIGNIN DEBUG] Detected SHA-512 crypt format`);
  } else if (user.password.length === 32 && /^[a-f0-9]+$/i.test(user.password)) {
    console.log(`[SIGNIN DEBUG] Detected plain MD5 hash format`);
  } else {
    console.log(`[SIGNIN DEBUG] Unknown hash format`);
  }
  // Compare password using multiple supported formats
  let isCorrectPassword = false;

  try {
    if (user.password.startsWith('$2y$') || user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2$')) {
      // bcrypt hash - all variants
      console.log(`[SIGNIN DEBUG] Using bcrypt comparison`);
      isCorrectPassword = await bcrypt.compare(password, user.password);
      console.log(`[SIGNIN DEBUG] Bcrypt comparison result: ${isCorrectPassword}`);
    } else if (user.password.startsWith('$1$')) {
      // MD5-crypt hash - use unix-crypt-td-js for safe verification
      console.log(`[SIGNIN DEBUG] Using MD5-crypt verification`);
      try {
        // Import unix-crypt-td-js dynamically with proper CommonJS handling
        let crypt;
        try {
          const unixCryptModule = await import('unix-crypt-td-js');
          crypt = unixCryptModule.crypt || unixCryptModule.default?.crypt || unixCryptModule.default;
          console.log(`[SIGNIN DEBUG] MD5-crypt library imported successfully, crypt type: ${typeof crypt}`);
        } catch (importError) {
          console.error('[SIGNIN DEBUG] Failed to import unix-crypt-td-js:', importError);
          throw importError;
        }
        
        // Extract salt from stored hash - format: $1$salt$hash
        const parts = user.password.split('$');
        console.log(`[SIGNIN DEBUG] Hash parts: ${JSON.stringify(parts)}`);
        if (parts.length >= 4 && parts[1] === '1') {
          const salt = '$1$' + parts[2];  // Salt format: $1$salt (no trailing $)
          console.log(`[SIGNIN DEBUG] Extracted salt: ${salt}`);
          console.log(`[SIGNIN DEBUG] Computing hash for password with salt...`);
          const computedHash = crypt(password, salt);
          console.log(`[SIGNIN DEBUG] Computed hash: ${computedHash}`);
          console.log(`[SIGNIN DEBUG] Stored hash:   ${user.password}`);
          isCorrectPassword = computedHash === user.password;
          console.log(`[SIGNIN DEBUG] MD5-crypt comparison result: ${isCorrectPassword}`);
        } else {
          console.error(`Invalid MD5-crypt hash format for user ${username}: expected $1$salt$hash format`);
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
    } else if (user.password.startsWith('$5$') || user.password.startsWith('$6$')) {
      // SHA-256 ($5$) or SHA-512 ($6$) crypt formats
      console.log(`[SIGNIN DEBUG] Using SHA crypt verification`);
      try {
        const unixCryptModule = await import('unix-crypt-td-js');
        const crypt = unixCryptModule.crypt;
        
        // Use the full hash as salt for crypt function
        const computedHash = crypt(password, user.password);
        console.log(`[SIGNIN DEBUG] SHA crypt comparison result: ${computedHash === user.password}`);
        isCorrectPassword = computedHash === user.password;
      } catch (error) {
        console.error('[SIGNIN DEBUG] SHA crypt verification error:', error);
        return Response.json(
          {
            error: "Password verification failed",
          },
          {
            status: 500,
          }
        );
      }
    } else if (user.password.length === 32 && /^[a-f0-9]+$/i.test(user.password)) {
      // Plain MD5 hash (32 hex characters)
      console.log(`[SIGNIN DEBUG] Using plain MD5 verification`);
      try {
        const crypto = await import('crypto');
        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        console.log(`[SIGNIN DEBUG] Computed MD5: ${md5Hash}`);
        console.log(`[SIGNIN DEBUG] Stored MD5:   ${user.password}`);
        isCorrectPassword = md5Hash.toLowerCase() === user.password.toLowerCase();
        console.log(`[SIGNIN DEBUG] Plain MD5 comparison result: ${isCorrectPassword}`);
      } catch (error) {
        console.error('[SIGNIN DEBUG] MD5 hash verification error:', error);
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
      // Unknown hash format - log for debugging
      console.error(`[SIGNIN DEBUG] Unknown password hash format for user ${username}: ${user.password.substring(0, 20)}... (length: ${user.password.length})`);
      return Response.json(
        {
          error: "Unsupported password format in database",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error(`[SIGNIN DEBUG] Password comparison error for user ${username}:`, error);
    return Response.json(
      {
        error: "Password verification failed",
      },
      {
        status: 500,
      }
    );
  }

  console.log(`[SIGNIN DEBUG] Final password verification result: ${isCorrectPassword}`);

  if (!isCorrectPassword) {
    console.log(`[SIGNIN DEBUG] Password verification failed - returning 400 error`);
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

  console.log(`[SIGNIN DEBUG] Password verification successful - proceeding with login`);

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
