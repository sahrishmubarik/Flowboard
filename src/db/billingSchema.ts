import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./authSchema";
import { workspace } from "./workspaceSchema";

export const billingPlanEnum = pgEnum("billing_plan", [
  "FREE",
  "PRO",
  "BUSINESS",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
]);

// ACTIVE: paid up. PAST_DUE: a renewal failed and the grace period is
// running. CANCELED: ended; the workspace is back on Free.
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
]);

// The workspace's monthly plan, kept in sync with Stripe by webhooks.
// One row per workspace; subscribing again after a cancel reuses it.
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),

  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspace.id, {
      onDelete: "cascade",
    }),

  plan: billingPlanEnum("plan").notNull(),

  status: subscriptionStatusEnum("status").notNull(),

  // Stripe customer (cus_...), reused when the workspace subscribes again.
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),

  // Stripe subscription (sub_...).
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 })
    .notNull()
    .unique(),

  // End of the paid month: the next charge date.
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }).notNull(),

  // Set on the first failed renewal (failure + 7 days) and cleared once paid.
  // Paid features stay until this moment, even if a webhook is missed.
  graceEndsAt: timestamp("grace_ends_at", {
    withTimezone: true,
  }),

  // The owner cancelled; the plan ends at currentPeriodEnd.
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// One row per payment attempt: a checkout, or a monthly renewal invoice.
// A checkout row starts as PENDING and only a verified Stripe webhook may
// move it to PAID or FAILED.
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
      }),

    // Who started the checkout; kept as null if that user is deleted.
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),

    plan: billingPlanEnum("plan").notNull(),

    // In the lowest currency unit (cents for USD): 1000 = $10.00.
    amount: integer("amount").notNull(),

    // Lowercase ISO code, as Stripe uses it: "usd".
    currency: varchar("currency", { length: 3 }).notNull(),

    // Stripe Checkout Session id (cs_...) for the first payment. Empty for
    // renewals, which have no checkout.
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
      length: 255,
    }).unique(),

    // Stripe invoice (in_...) this payment belongs to. Unique, so a webhook
    // delivered twice can never record the same invoice twice.
    stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).unique(),

    status: paymentStatusEnum("status").notNull().default("PENDING"),

    // Stripe's id for the actual charge (pi_...), set once paid. Needed for
    // refunds and for finding the payment in the Stripe Dashboard.
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }),

    // When the verified webhook confirmed the payment.
    paidAt: timestamp("paid_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Payment history of a workspace, newest first.
    index("payments_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);
