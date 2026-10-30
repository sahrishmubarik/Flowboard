import Stripe from "stripe";

import { AppError } from "@/lib/errors/AppError";

let stripe: Stripe | undefined;

// One shared Stripe client, created on first use so a missing key fails the
// request instead of the build. The secret key never leaves the server.
export function getStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new AppError("Payments are not configured.", 500);
    }

    stripe = new Stripe(secretKey);
  }

  return stripe;
}
