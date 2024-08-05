// import validateEmail from "@/lib/validateEM";
// import validatePassword from "@/lib/validatePW";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { getUserByUserName } from "@/data/fetchPrisma";
import { WelcomeEmailTemplate } from "@/components/WelcomeEmailTmpt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // read data off request body
  const body = await request.json();
  const { username, password, institution, userrole } = body;
  const institutionId = parseInt(institution);
  const userroleId = parseInt(userrole);

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
  const hash = bcrypt.hashSync(password.toString(), 8);

  // ----------------- Create user in db -----------------
  // create a user in db. Will move to /data/fetchPrisma.ts in the future
  await db.user.create({
    data: {
      username: username,
      password: hash,
      isactive: true,
    },
  });

  const newUserId = await db.user.findUnique({
    where: {
      username: username,
    },
  });

  if (newUserId?.id) {
    await db.user_Library.upsert({
      where: {
        user_id_library_id: {
          user_id: newUserId.id,
          library_id: institutionId,
        },
      },
      update: {},
      create: {
        user_id: newUserId.id,
        library_id: institutionId,
      },
    });
    await db.users_Roles.upsert({
      where: {
        user_id_role_id: {
          user_id: newUserId.id,
          role_id: userroleId,
        },
      },
      update: {},
      create: {
        user_id: newUserId.id,
        role_id: userroleId,
      },
    });

    // ----------------- Send email to user -----------------
    try {
      const { data, error } = await resend.emails.send({
        from: "CEAL Admin <admin@vivoequeen.com>",
        to: username,
        subject: "Welcome to CEAL Stats",
        react: WelcomeEmailTemplate({
          username: username,
          password: password,
        }),
        text: "", // Keep this! To avoid error
      });

      if (error) {
        return Response.json({ error }, { status: 500 });
      }

      return Response.json({
        message: data?.id,
      });
    } catch (error) {
      return Response.json({ error }, { status: 500 });
    }
  }

  // return something
  return Response.json({});
}
