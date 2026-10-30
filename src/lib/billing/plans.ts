// Prices live on the server only. The browser sends a plan name, never an
// amount, so a customer cannot change what they pay.
// Amounts are in the lowest currency unit (paisa): 150000 = PKR 1,500.
// TODO: placeholder prices, confirm the real ones before going live.
export const PAID_PLANS = {
  PRO: { name: "Pro", amount: 150_000, currency: "pkr" },
  BUSINESS: { name: "Business", amount: 400_000, currency: "pkr" },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;
