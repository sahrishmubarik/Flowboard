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

export async function resetPasswordEmail({
  email,
  resetPasswordUrl,
}: VerificationEmailOptions) {
  return sendEmail({
    to: email,
    subject: "Reset your password email",
    html: `
      <h1>Reset Password</h1>

   

      <p>
        Click the button below to reset your password:
      </p>

      <a href="${resetPasswordUrl}">
      Reset password
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>
    `,
  });
}