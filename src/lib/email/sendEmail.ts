import formData from "form-data";
import mail from "./mailgun";

const mailgun = new mail(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

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
    from: `Auth System <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to: [to],
    subject,
    html,
  };

  const result = await mg.messages.create(
    process.env.MAILGUN_DOMAIN!,
    mailOptions
  );

  console.log("Mailgun response:", result);

  return result;
}