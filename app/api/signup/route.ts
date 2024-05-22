import validateEmail from "@/lib/validateEM";
import validatePassword from "@/lib/validatePW";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(request: Request) {
  // read data off request body
  const body = await request.json();
  const { email, password } = body;

  // validate data
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

  // hash the password
  const hash = bcrypt.hashSync(password, 8);

  // create a user in db. Will move to /data/fetchPrisma.ts in the future
  await db.user.create({
    data: {
      email: "vivoequeen@gmail.com",
      password: hash,
    },
  });

  // return something
  return Response.json({});
}
