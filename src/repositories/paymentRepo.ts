import { db } from "@/db";
import { payments } from "@/db/billingSchema";

export type CreatePaymentInput = typeof payments.$inferInsert;

export const paymentRepo = {
  async create(input: CreatePaymentInput) {
    const [payment] = await db.insert(payments).values(input).returning();

    return payment;
  },
};
