import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Meng Qu Admin <admin@vivoequeen.com>",
      to: ["qum@miamioh.edu"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "Meng at Miami" }),
      text: "Hello text", // Add a text property
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
