const RESEND_API_KEY = process.env.RESEND;

export async function POST() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Acme <onboarding@resend.dev>",
      to: ["qum@miamioh.edu"],
      subject: "hello world",
      html: "<strong>it works!</strong>",
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return Response.json(data);
  }
}
