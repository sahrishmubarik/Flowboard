import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
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

// One row per checkout attempt. A row starts as PENDING and only a verified
// Stripe webhook may move it to PAID or FAILED.
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

    // In the lowest currency unit (paisa for PKR): 150000 = PKR 1,500.
    amount: integer("amount").notNull(),

    // Lowercase ISO code, as Stripe uses it: "pkr", "usd".
    currency: varchar("currency", { length: 3 }).notNull(),

    // Stripe Checkout Session id (cs_...): links this row to the payment on
    // Stripe's side.
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
      length: 255,
    })
      .notNull()
      .unique(),

    status: paymentStatusEnum("status").notNull().default("PENDING"),

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
