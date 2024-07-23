// import validateEmail from "@/lib/validateEM";
// import validatePassword from "@/lib/validatePW";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getUserByUserName } from "@/data/fetchPrisma";

export async function POST(request: Request) {
  // read data off request body
  const body = await request.json();
  const { username, password } = body;

  const searchUser = await getUserByUserName(username);
  if (searchUser?.username.toLowerCase() === username.toLowerCase()) {
    return Response.json(
      { error: "Email already registered!" },
      { status: 400 }
    );
  }

  // validate data -> TODO: Validation has problem
  if (!username || !password) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // hash the password
  const hash = bcrypt.hashSync(password, 8);

  // create a user in db. Will move to /data/fetchPrisma.ts in the future
  await db.user.create({
    data: {
      username: username,
      password: hash,
      isactive: true,
    },
  });

  // return something
  return Response.json({});
}
