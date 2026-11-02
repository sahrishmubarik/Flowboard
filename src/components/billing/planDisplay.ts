import type { ComponentType } from "react";
import { Building2, Sprout, Zap } from "lucide-react";

import type { PlanKey } from "@/lib/billing/plans";

// How each plan looks wherever plans are shown (home page pricing and the
// billing page), so both always match: icon, top stripe and icon tile.
export const PLAN_STYLES: Record<
  PlanKey,
  { icon: ComponentType<{ size?: number }>; stripe: string; tile: string }
> = {
  FREE: {
    icon: Sprout,
    stripe: "bg-[var(--color-text-muted)]",
    tile: "bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)]",
  },
  PRO: {
    icon: Zap,
    stripe: "bg-[var(--color-primary)]",
    tile: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  },
  BUSINESS: {
    icon: Building2,
    stripe: "bg-[var(--color-tag-purple-text)]",
    tile: "bg-[var(--color-tag-purple-bg)] text-[var(--color-tag-purple-text)]",
  },
};

// The plan highlighted as "Most popular".
export const FEATURED_PLAN: PlanKey = "PRO";

// Amounts are stored in the lowest unit (cents): 1000 -> $10.
export function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}
