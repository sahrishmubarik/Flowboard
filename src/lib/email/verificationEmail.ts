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

export async function sendInvitationEmail ({
    email,
    assignRole,
    organizationName,
    invitationUrl,
}: VerificationEmailOptions)
{
return sendEmail({
    to: email,
    subject: `Flowboard invite from ${organizationName}`,
    html: `
      <h1>${organizationName} invitation</h1>
      <p>
        Join the ${organizationName} organization  as a ${assignRole}:
      </p>

   

      <p>
        Click the  below link  and join the ${organizationName} organization :
      </p>

      <a href="${invitationUrl}">
      accept invite
      </a>

      <p>
        This link will expire in  12 hours.
      </p>
    `,
  });

}
