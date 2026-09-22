import mailgun from "./mailgun";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions) {
  const mailOptions = {
    from: `Flowboard <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to: [to],
    subject,
    html,
  };

  const result = await mailgun.messages.create(
    process.env.MAILGUN_DOMAIN!,
    mailOptions
  );

  console.log("Mailgun response:", result);

  return result;
}