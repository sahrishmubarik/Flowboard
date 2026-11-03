import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/billingSchema";

export type CreatePaymentInput = typeof payments.$inferInsert;

export type RecordInvoiceInput = {
  workspaceId: string;
  plan: "PRO" | "BUSINESS";
  amount: number;
  currency: string;
  stripeInvoiceId: string;
  status: "PAID" | "FAILED";
};

export const paymentRepo = {
  async create(input: CreatePaymentInput) {
    const [payment] = await db.insert(payments).values(input).returning();

    return payment;
  },

  async findByCheckoutSessionId(sessionId: string) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeCheckoutSessionId, sessionId))
      .limit(1);

    return payment;
  },

  // Moves a payment from PENDING to PAID in one statement. The status check
  // makes it safe to run twice: a duplicate event updates nothing and gets
  // undefined back.
  async markPaid(
    paymentId: string,
    stripe: { paymentIntentId: string | null; invoiceId: string | null },
  ) {
    const [payment] = await db
      .update(payments)
      .set({
        status: "PAID",
        stripePaymentIntentId: stripe.paymentIntentId,
        stripeInvoiceId: stripe.invoiceId,
        paidAt: new Date(),
      })
      .where(and(eq(payments.id, paymentId), eq(payments.status, "PENDING")))
      .returning();

    return payment;
  },

  // Records a monthly renewal invoice as paid or failed. One row per invoice:
  // a retry that later succeeds turns the FAILED row into PAID, and a PAID
  // row is never turned back into FAILED by a late event.
  async recordInvoice(input: RecordInvoiceInput) {
    const paidAt = input.status === "PAID" ? new Date() : null;

    const [payment] = await db
      .insert(payments)
      .values({ ...input, paidAt })
      .onConflictDoUpdate({
        target: payments.stripeInvoiceId,
        set: {
          status: sql`case when ${payments.status} = 'PAID' then 'PAID'::payment_status else excluded.status end`,
          paidAt: sql`coalesce(${payments.paidAt}, excluded.paid_at)`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return payment;
  },

  // Payment history of a workspace, newest first. Stripe ids are left out:
  // the browser never needs them.
  async listByWorkspace(workspaceId: string, limit = 20) {
    return db
      .select({
        id: payments.id,
        plan: payments.plan,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.workspaceId, workspaceId))
      .orderBy(desc(payments.createdAt), desc(payments.id))
      .limit(limit);
  },
};
