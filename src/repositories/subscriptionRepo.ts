import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions } from "@/db/billingSchema";

export type SaveSubscriptionInput = {
  workspaceId: string;
  plan: "PRO" | "BUSINESS";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  // Used only if the grace period has not started yet.
  graceEndsAt: Date | null;
};

export const subscriptionRepo = {
  async findByWorkspace(workspaceId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspaceId))
      .limit(1);

    return subscription;
  },

  // Creates or updates the workspace's row from Stripe's current state.
  // While PAST_DUE an existing grace date is kept, so Stripe's repeated
  // retries never extend the 7 days; any other status clears it.
  async save(input: SaveSubscriptionInput) {
    const [subscription] = await db
      .insert(subscriptions)
      .values(input)
      .onConflictDoUpdate({
        target: subscriptions.workspaceId,
        set: {
          plan: input.plan,
          status: input.status,
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          currentPeriodEnd: input.currentPeriodEnd,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd,
          graceEndsAt: sql`case
            when excluded.status = 'PAST_DUE'
              then coalesce(${subscriptions.graceEndsAt}, excluded.grace_ends_at)
            else null
          end`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return subscription;
  },
};
