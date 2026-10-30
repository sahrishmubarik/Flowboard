import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { AppError } from "@/lib/errors/AppError";
import { getStripe } from "@/lib/stripe/client";

// POST /api/webhooks/stripe — verifies the signature, then handles the event.
// The signature covers the raw body plus a timestamp, so a changed body or an
// old replayed event is rejected.
export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new AppError("Stripe webhook is not configured.", 500);
  }

  if (!signature) {
    throw new AppError("Missing Stripe-Signature header.", 400);
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw new AppError("Invalid webhook signature.", 400);
  }

  // Placeholder until Step 2: checkout.session.completed will mark the
  // payment PAID. For now every verified event is only logged.
  console.info("STRIPE_WEBHOOK_RECEIVED:", event.type, event.id);

  return NextResponse.json({ received: true }, { status: 200 });
}
