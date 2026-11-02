// Prices live on the server only. The browser sends a plan name, never an
// amount, so a customer cannot change what they pay.
// Amounts are in the lowest currency unit (cents): 1000 = $10.00.
// TODO: placeholder prices, confirm the real ones before going live.
export const PAID_PLANS = {
  PRO: { name: "Pro", amount: 1_000, currency: "usd" },
  BUSINESS: { name: "Business", amount: 2_500, currency: "usd" },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;
export type PlanKey = "FREE" | PaidPlan;

export function isPaidPlan(value: unknown): value is PaidPlan {
  return typeof value === "string" && value in PAID_PLANS;
}

// Days a workspace keeps its paid plan after a monthly payment fails, so the
// owner can fix the card. Stripe's retry schedule should end within the
// same window (Dashboard → Billing → Revenue recovery).
export const GRACE_PERIOD_DAYS = 7;

type SubscriptionState = {
  plan: PlanKey;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  graceEndsAt: Date | null;
};

// The plan a workspace really has right now. Checks the grace date itself,
// so paid features end on time even if Stripe's last webhook never arrives.
export function getEffectivePlan(
  subscription: SubscriptionState | undefined,
  now = new Date(),
): PlanKey {
  if (!subscription) return "FREE";

  if (subscription.status === "ACTIVE") return subscription.plan;

  if (
    subscription.status === "PAST_DUE" &&
    subscription.graceEndsAt &&
    subscription.graceEndsAt > now
  ) {
    return subscription.plan;
  }

  return "FREE";
}

// Lowest to highest, used to tell which plans are already included.
export const PLAN_ORDER: PlanKey[] = ["FREE", "PRO", "BUSINESS"];

// Hard limits per workspace, enforced on the server. null means unlimited.
// Members count active members plus pending invitations.
export const PLAN_LIMITS: Record<
  PlanKey,
  { boards: number | null; members: number | null }
> = {
  FREE: { boards: 3, members: 5 },
  PRO: { boards: null, members: 25 },
  BUSINESS: { boards: null, members: null },
};

// What each plan offers, shown on the home page and the billing page.
// The board and member lines must match PLAN_LIMITS above.
export const PLAN_DETAILS: Record<
  PlanKey,
  { name: string; tagline: string; features: string[] }
> = {
  FREE: {
    name: "Free",
    tagline: "For trying Flowboard with a small team.",
    features: ["Up to 3 boards", "Up to 5 members", "Cards, lists and comments"],
  },
  PRO: {
    name: "Pro",
    tagline: "For growing teams that run sprints.",
    features: [
      "Unlimited boards",
      "Up to 25 members",
      "Sprints and time tracking",
      "Workspace activity history",
    ],
  },
  BUSINESS: {
    name: "Business",
    tagline: "For organisations that need control.",
    features: [
      "Everything in Pro",
      "Unlimited members",
      "Audit logs",
      "Priority support",
    ],
  },
};
