import * as jose from 'jose';
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { email, password } = body;

  // Extract data sent in

  // Validate data
  if (!email || !password) {
    return Response.json(
      {
        error: "Invalid email or password",
      },
      {
        status: 400,
      }
    );
  }

  // Lookup the user

  const user = db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    return Response.json(
      {
        error: "User not found",
      },
      {
        status: 400,
      }
    );
  }
  // Compare password-> TODO: compare has something wrong

  const isCorrectPassword = bcrypt.compareSync(password, password);

  if (!isCorrectPassword) {
    return Response.json(
      {
        error: "User not found",
      },
      {
        status: 400,
      }
    );
  }

  // Create jwt token

  // Respond with it
  return Response.json({});
}
