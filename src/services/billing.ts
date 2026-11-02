import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
  getEffectivePlan,
  PAID_PLANS,
  PLAN_DETAILS,
  PLAN_ORDER,
} from "@/lib/billing/plans";
import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import { getStripe } from "@/lib/stripe/client";
import { checkoutValidation } from "@/lib/validations/billing";
import { validateData } from "@/lib/validations/workspace";
import { paymentRepo } from "@/repositories/paymentRepo";
import { subscriptionRepo } from "@/repositories/subscriptionRepo";

function billingUrlFor(workspaceId: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/workspace/${workspaceId}/billing`;
}

async function requireOwner(workspaceId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  await requireWorkspaceRole(user.userId, workspaceId, ["owner"]);

  return user;
}

// POST /api/workspace/[workspaceId]/billing/checkout
// Starts a monthly subscription for a plan and returns the Stripe Checkout
// URL. The payment row stays PENDING: the redirect back proves nothing, only
// a verified webhook may mark it PAID and activate the plan.
export async function startCheckout(workspaceId: string, body: unknown) {
  const user = await requireOwner(workspaceId);

  const validation = validateData(checkoutValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  // One subscription per workspace: a second checkout would charge twice.
  const existing = await subscriptionRepo.findByWorkspace(workspaceId);

  if (existing && existing.status !== "CANCELED") {
    throw new AppError(
      "This workspace already has a subscription. Manage it from the billing page.",
      409,
    );
  }

  const planKey = validation.data.plan;
  const plan = PAID_PLANS[planKey];
  const billingUrl = billingUrlFor(workspaceId);

  let session: Stripe.Checkout.Session;

  // Stripe first: if it fails, no orphan PENDING row is left behind.
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency,
            unit_amount: plan.amount,
            recurring: { interval: "month" },
            product_data: { name: `Flowboard ${plan.name}` },
          },
        },
      ],
      // Subscribing again after a cancel keeps the same Stripe customer.
      ...(existing ? { customer: existing.stripeCustomerId } : {}),
      client_reference_id: workspaceId,
      metadata: { workspaceId, plan: planKey },
      // Copied onto the subscription, so renewals know their workspace.
      subscription_data: { metadata: { workspaceId, plan: planKey } },
      // Stripe fills in {CHECKOUT_SESSION_ID} itself.
      success_url: `${billingUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingUrl}?checkout=cancelled`,
    });
  } catch (error) {
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

// POST /api/workspace/[workspaceId]/billing/portal
// Opens Stripe's Customer Portal, where the owner updates the card, sees
// invoices or cancels. Changes come back to us as webhooks.
export async function openBillingPortal(workspaceId: string) {
  await requireOwner(workspaceId);

  const subscription = await subscriptionRepo.findByWorkspace(workspaceId);

  if (!subscription) {
    throw new AppError("This workspace has no subscription yet.", 404);
  }

  let portal: Stripe.BillingPortal.Session;

  try {
    portal = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: billingUrlFor(workspaceId),
    });
  } catch (error) {
    console.error("STRIPE_PORTAL_ERROR:", error);
    throw new AppError(
      "Could not open the billing portal. Please try again.",
      502,
    );
  }

  return NextResponse.json({ portalUrl: portal.url }, { status: 201 });
}

// GET /api/workspace/[workspaceId]/billing
// Plans, the subscription and payment history. Owner only: payment details
// are not shared with other members.
export async function getBillingOverview(workspaceId: string) {
  await requireOwner(workspaceId);

  const [payments, subscription] = await Promise.all([
    paymentRepo.listByWorkspace(workspaceId),
    subscriptionRepo.findByWorkspace(workspaceId),
  ]);

  const plans = PLAN_ORDER.map((key) => ({
    key,
    ...PLAN_DETAILS[key],
    amount: key === "FREE" ? 0 : PAID_PLANS[key].amount,
    currency: key === "FREE" ? "usd" : PAID_PLANS[key].currency,
  }));

  // Worked out on the server, including the grace period, so the browser
  // cannot claim a plan.
  const currentPlan = getEffectivePlan(subscription);

  return NextResponse.json(
    {
      plans,
      currentPlan,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            graceEndsAt: subscription.graceEndsAt,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      payments,
    },
    { status: 200 },
  );
}
