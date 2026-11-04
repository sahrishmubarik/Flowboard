type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

// Sends one email through Brevo's transactional API. The sender must be a
// verified sender in the Brevo account that owns BREVO_API_KEY.
// Throws when Brevo refuses, so callers can undo what they saved (e.g. a
// sign-up or an invitation) instead of leaving it stuck.
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Flowboard";

  if (!apiKey || !fromEmail) {
    throw new Error("Email is not configured (BREVO_API_KEY, EMAIL_FROM_ADDRESS).");
  }

  const response = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(
      `Brevo refused the email (${response.status}): ${await response.text()}`,
    );
  }

  // { messageId: "<...@smtp-relay.mailin.fr>" }
  return (await response.json()) as { messageId: string };
}
