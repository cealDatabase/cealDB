import { ResetEmailTemplate } from "@/components/ResetEmailTmpt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "CEAL Admin <admin@vivoequeen.com>",
      to: ["qum@miamioh.edu"],
      subject: "From CEAL: Your password reset request.",
      react: ResetEmailTemplate({
        firstName: "Meng at Miami",
        resetLink: "https://ceal-db.vercel.app/",
      }),
      text: "", // Have to keep this to avoid error
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data?.id);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
