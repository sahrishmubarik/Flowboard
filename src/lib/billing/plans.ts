// Prices live on the server only. The browser sends a plan name, never an
// amount, so a customer cannot change what they pay.
// Amounts are in the lowest currency unit (cents): 1000 = $10.00.
// TODO: placeholder prices, confirm the real ones before going live.
export const PAID_PLANS = {
  PRO: { name: "Pro", amount: 1_000, currency: "usd" },
  BUSINESS: { name: "Business", amount: 2_500, currency: "usd" },
} as const;

export type PaidPlan = keyof typeof PAID_PLANS;
