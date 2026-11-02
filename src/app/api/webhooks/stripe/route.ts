import { NextRequest } from "next/server";

import { handleStripeWebhook } from "@/services/stripeWebhook";
import { handleRouteError } from "@/lib/errors/handleRouteError";

// POST /api/webhooks/stripe — called by Stripe, not by the app. The raw body
// is read as text because the signature is checked against the exact bytes.
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    return await handleStripeWebhook(
      rawBody,
      request.headers.get("stripe-signature"),
    );
  } catch (error) {
    return handleRouteError(error, "STRIPE_WEBHOOK_ERROR:");
  }
}
