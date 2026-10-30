import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { handleStripeWebhook } from "@/services/stripeWebhook";

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
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("STRIPE_WEBHOOK_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
