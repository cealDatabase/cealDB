import { Resend } from 'resend';

const res = process.env.RESEND
const resend = new Resend(res);

(async function () {
  const { data, error } = await resend.emails.send({
    from: 'CEAL Database <ceal.database@gmail.com>',
    to: ['vivoequeen@gmail.com'],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();
