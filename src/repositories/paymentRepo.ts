import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/billingSchema";

export type CreatePaymentInput = typeof payments.$inferInsert;

export const paymentRepo = {
  async create(input: CreatePaymentInput) {
    const [payment] = await db.insert(payments).values(input).returning();

    return payment;
  },

  // Payment history of a workspace, newest first. The Stripe session id is
  // left out: the browser never needs it.
  async listByWorkspace(workspaceId: string, limit = 20) {
    return db
      .select({
        id: payments.id,
        plan: payments.plan,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.workspaceId, workspaceId))
      .orderBy(desc(payments.createdAt), desc(payments.id))
      .limit(limit);
  },
};
