import { NextResponse } from "next/server";
import Stripe from "stripe";

import { PAID_PLANS } from "@/lib/billing/plans";
import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import { getStripe } from "@/lib/stripe/client";
import { checkoutValidation } from "@/lib/validations/billing";
import { validateData } from "@/lib/validations/workspace";
import { paymentRepo } from "@/repositories/paymentRepo";

// POST /api/workspace/[workspaceId]/billing/checkout
// Starts a one-time payment for a plan and returns the Stripe Checkout URL.
// The payment row stays PENDING: the redirect back proves nothing, only a
// verified webhook may mark it PAID.
export async function startCheckout(workspaceId: string, body: unknown) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const validation = validateData(checkoutValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  await requireWorkspaceRole(user.userId, workspaceId, ["owner"]);

  const planKey = validation.data.plan;
  const plan = PAID_PLANS[planKey];
  const workspaceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/workspace/${workspaceId}`;

  let session: Stripe.Checkout.Session;

  // Stripe first: if it fails, no orphan PENDING row is left behind.
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency,
            unit_amount: plan.amount,
            product_data: { name: `Flowboard ${plan.name}` },
          },
        },
      ],
      client_reference_id: workspaceId,
      metadata: { workspaceId, plan: planKey },
      // Stripe fills in {CHECKOUT_SESSION_ID} itself.
      success_url: `${workspaceUrl}?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${workspaceUrl}?billing=cancelled`,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    console.error("STRIPE_CHECKOUT_ERROR:", error);
    throw new AppError("Could not start the payment. Please try again.", 502);
  }

  if (!session.url) {
    console.error("STRIPE_CHECKOUT_NO_URL:", session.id);
    throw new AppError("Could not start the payment. Please try again.", 502);
  }

  await paymentRepo.create({
    workspaceId,
    createdBy: user.userId,
    plan: planKey,
    amount: plan.amount,
    currency: plan.currency,
    stripeCheckoutSessionId: session.id,
  });

  return NextResponse.json({ checkoutUrl: session.url }, { status: 201 });
}
