import * as jose from "jose";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

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

  // Lookup the user

  const user = await db.user.findFirst({
    where: { username: username.toLowerCase() },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 400 });
  }
  // Compare password

  const isCorrectPassword = bcrypt.compareSync(password, user.password);

  if (isCorrectPassword) { // TODO: verify password
    return Response.json(
      {
        error: "Incorrect password",
      },
      {
        status: 400,
      }
    );
  }

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
