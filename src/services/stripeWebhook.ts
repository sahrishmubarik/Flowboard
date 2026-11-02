import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { GRACE_PERIOD_DAYS, isPaidPlan } from "@/lib/billing/plans";
import { AppError } from "@/lib/errors/AppError";
import { getStripe } from "@/lib/stripe/client";
import { paymentRepo } from "@/repositories/paymentRepo";
import { subscriptionRepo } from "@/repositories/subscriptionRepo";

// A Checkout Session finished and may be paid. Cards are paid at once
// (`completed`); slower methods report later (`async_payment_succeeded`).
const CHECKOUT_PAID_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

const SUBSCRIPTION_EVENTS = new Set<Stripe.Event.Type>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const DAY_MS = 24 * 60 * 60 * 1000;

// Stripe has more statuses than we need. `incomplete` means the first
// payment is not done yet, so there is nothing to save.
function toOurStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
    case "paused":
      return "CANCELED";
    default:
      return null;
  }
}

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null;

  return typeof value === "string" ? value : value.id;
}

// Copies Stripe's current state of a subscription into our row. Re-reading
// it from Stripe (instead of trusting the event) makes the result correct
// even when events arrive late, twice or out of order.
async function syncSubscription(subscriptionId: string) {
  const subscription =
    await getStripe().subscriptions.retrieve(subscriptionId);

  const workspaceId = subscription.metadata.workspaceId;
  const plan = subscription.metadata.plan;
  const status = toOurStatus(subscription.status);
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const customerId = idOf(subscription.customer);

  if (!workspaceId || !isPaidPlan(plan) || !customerId || !periodEnd) {
    // Not created by our checkout.
    console.warn("STRIPE_SUBSCRIPTION_SKIPPED:", subscriptionId);
    return null;
  }

  if (!status) return null;

  const existing = await subscriptionRepo.findByWorkspace(workspaceId);

  if (
    existing &&
    existing.stripeSubscriptionId !== subscription.id &&
    status === "CANCELED"
  ) {
    // A late event about an old, already replaced subscription.
    return null;
  }

  return subscriptionRepo.save({
    workspaceId,
    plan,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: new Date(periodEnd * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    // Only used when the grace period starts; an existing date is kept.
    graceEndsAt:
      status === "PAST_DUE"
        ? new Date(Date.now() + GRACE_PERIOD_DAYS * DAY_MS)
        : null,
  });
}

// Marks the checkout payment PAID only when Stripe's own current record
// agrees with what we saved, then starts the subscription. Anything that does
// not match is logged and left alone. Errors are thrown so the route answers
// 500 and Stripe retries.
async function onCheckoutPaid(sessionId: string) {
  const payment = await paymentRepo.findByCheckoutSessionId(sessionId);

  if (!payment) {
    // Not created by this app (e.g. a test event or another integration).
    console.warn("STRIPE_UNKNOWN_CHECKOUT_SESSION:", sessionId);
    return;
  }

  // Re-read the session instead of trusting the copy inside the event.
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const subscriptionId = idOf(session.subscription);

  if (payment.status === "PAID") {
    // Duplicate delivery: the payment is done, but make sure the
    // subscription row exists in case the first attempt stopped half way.
    if (subscriptionId) await syncSubscription(subscriptionId);
    return;
  }

  if (session.payment_status !== "paid") {
    // Completed but not paid yet (delayed method): wait for the
    // async_payment_succeeded event.
    console.info("STRIPE_CHECKOUT_NOT_PAID_YET:", sessionId);
    return;
  }

  if (
    session.amount_total !== payment.amount ||
    session.currency !== payment.currency ||
    session.metadata?.workspaceId !== payment.workspaceId
  ) {
    console.error("STRIPE_PAYMENT_MISMATCH:", {
      paymentId: payment.id,
      expected: {
        amount: payment.amount,
        currency: payment.currency,
        workspaceId: payment.workspaceId,
      },
      received: {
        amount: session.amount_total,
        currency: session.currency,
        workspaceId: session.metadata?.workspaceId,
      },
    });
    return;
  }

  if (payment.status !== "PENDING") {
    // Paid after we gave up on it (e.g. marked FAILED). Needs a human.
    console.error("STRIPE_PAID_AFTER_FAILED:", payment.id);
    return;
  }

  const updated = await paymentRepo.markPaid(payment.id, {
    paymentIntentId: idOf(session.payment_intent),
    invoiceId: idOf(session.invoice),
  });

  if (updated) {
    console.info("PAYMENT_MARKED_PAID:", payment.id);
  }

  if (subscriptionId) {
    await syncSubscription(subscriptionId);
  }
}

// A monthly invoice was paid or failed. The subscription is synced first:
// a failure moves it to PAST_DUE and starts the 7-day grace period, a
// payment (also a late retry inside the grace period) makes it ACTIVE again.
async function onInvoice(invoice: Stripe.Invoice, outcome: "PAID" | "FAILED") {
  const subscriptionId = idOf(
    invoice.parent?.subscription_details?.subscription,
  );

  if (!subscriptionId || !invoice.id) return;

  const subscription = await syncSubscription(subscriptionId);

  // The first invoice belongs to the checkout, which records it itself.
  if (!subscription || invoice.billing_reason === "subscription_create") {
    return;
  }

  await paymentRepo.recordInvoice({
    workspaceId: subscription.workspaceId,
    plan: subscription.plan as "PRO" | "BUSINESS",
    amount: outcome === "PAID" ? invoice.amount_paid : invoice.amount_due,
    currency: invoice.currency,
    stripeInvoiceId: invoice.id,
    status: outcome,
  });

  if (outcome === "FAILED") {
    console.warn("SUBSCRIPTION_PAYMENT_FAILED:", {
      workspaceId: subscription.workspaceId,
      graceEndsAt: subscription.graceEndsAt,
    });
  }
}

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

  if (CHECKOUT_PAID_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;

    await onCheckoutPaid(session.id);
  } else if (event.type === "invoice.paid") {
    await onInvoice(event.data.object, "PAID");
  } else if (event.type === "invoice.payment_failed") {
    await onInvoice(event.data.object, "FAILED");
  } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
    const subscription = event.data.object as Stripe.Subscription;

    await syncSubscription(subscription.id);
  } else {
    console.info("STRIPE_WEBHOOK_IGNORED:", event.type, event.id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
