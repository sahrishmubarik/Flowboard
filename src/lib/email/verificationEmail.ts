import { sendEmail } from "./sendEmail";

type VerificationEmailOptions = {
  email: string;
  verificationUrl: string;
};

export async function sendVerificationEmail({
  email,
  verificationUrl,
}: VerificationEmailOptions) {
  return sendEmail({
    to: email,
    subject: "Verify your Flowboard email",
    html: `
      <h1>Verify your email</h1>

      <p>
        Thanks for creating your Flowboard account.
      </p>

      <p>
        Click the button below to verify your email:
      </p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>
        This link will expire in 30 minutes.
      </p>
    `,
  });
}