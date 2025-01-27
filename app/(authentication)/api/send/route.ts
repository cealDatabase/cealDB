import db from "@/lib/db";
import { ResetEmailTemplate } from "@/components/ResetEmailTmpt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // Read data off req body
  const body = await request.json();
  const { username } = body;

  // Lookup the user
  const user = await db.user.findFirst({
    where: { username: username.toLowerCase() },
  });

  const expireTime = Date.now() + 60 * 1000 * 15; // 15 minutes

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 400 });
  } else {
    try {
      const { data, error } = await resend.emails.send({
        from: "CEAL Admin <admin@vivoequeen.com>",
        to: username,
        subject: "From CEAL - Your password reset request.",
        react: await ResetEmailTemplate({
          firstName: user.firstname ?? "",
          resetLink: `https://ceal-db.vercel.app/forgot/${username}?token=${expireTime}`,
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
}
