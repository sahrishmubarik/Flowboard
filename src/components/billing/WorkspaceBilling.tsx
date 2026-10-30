"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Info } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";

type Plan = {
  key: "PRO" | "BUSINESS";
  name: string;
  amount: number;
  currency: string;
};

type Payment = {
  id: string;
  plan: "FREE" | "PRO" | "BUSINESS";
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
};

type BillingResponse = {
  message?: string;
  plans: Plan[];
  payments: Payment[];
};

type WorkspaceBillingProps = {
  workspaceId: string;
  checkoutResult: "success" | "cancelled" | null;
};

// Amounts are stored in the lowest unit (cents): 1000 -> $10.00.
function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

const STATUS_STYLES: Record<Payment["status"], { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-[var(--color-tag-yellow-bg)] text-[var(--color-tag-yellow-text)]",
  },
  PAID: {
    label: "Paid",
    className:
      "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]",
  },
  FAILED: {
    label: "Failed",
    className: "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]",
  },
};

const PLAN_NAMES: Record<Payment["plan"], string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
};

export default function WorkspaceBilling({
  workspaceId,
  checkoutResult,
}: WorkspaceBillingProps) {
  const { showToast } = useToast();
  const [startingPlan, setStartingPlan] = useState<Plan["key"] | null>(null);

  const { data, isLoading, error } = useQuery<BillingResponse>({
    queryKey: ["workspace-billing", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}/billing`, {
        cache: "no-store",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.message || "Failed to load billing.");
      }

      return body;
    },
  });

  // Sends only the plan name; the server sets the price and returns the
  // Stripe Checkout page to go to.
  async function startCheckout(plan: Plan["key"]) {
    setStartingPlan(plan);

    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/billing/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        },
      );
      const body = await response.json();

      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.message || "Could not start the payment.");
      }

      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      showToast(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start the payment.",
        "error",
      );
      setStartingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back from Stripe. A redirect proves nothing, so "success" only says
          the payment is being confirmed. */}
      {checkoutResult === "success" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-[var(--color-tag-blue-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
        >
          <Info
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[var(--color-tag-blue-text)]"
          />
          <p>
            Thanks! Your payment was submitted. We are confirming it with
            Stripe, and the payment below will show as Paid once confirmed.
          </p>
        </div>
      )}

      {checkoutResult === "cancelled" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-[var(--color-tag-neutral-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
        >
          <Info
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[var(--color-tag-neutral-text)]"
          />
          <p>Checkout was cancelled. You have not been charged.</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
        >
          {error.message}
        </div>
      )}

      {/* Plans */}
      {!error && (
        <section aria-labelledby="billing-plans-heading">
          <h2
            id="billing-plans-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
          >
            Plans
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[172px] animate-pulse rounded-2xl bg-[var(--color-border)]"
                  />
                ))
              : data?.plans.map((plan) => (
                  <div
                    key={plan.key}
                    className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm"
                  >
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {plan.name}
                    </p>

                    <p
                      className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {formatAmount(plan.amount, plan.currency)}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      One-time payment
                    </p>

                    <button
                      type="button"
                      onClick={() => startCheckout(plan.key)}
                      disabled={startingPlan !== null}
                      className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {startingPlan === plan.key
                        ? "Opening checkout..."
                        : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* Payment history */}
      {!error && (
        <section
          aria-labelledby="billing-history-heading"
          className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm"
        >
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <h2
              id="billing-history-heading"
              className="text-base font-semibold text-[var(--color-text-primary)]"
            >
              Payment history
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="bg-[var(--color-app-bg)]">
                <tr className="border-b border-[var(--color-border)]">
                  {["Date", "Plan", "Amount", "Status"].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]"
                    >
                      Loading payments...
                    </td>
                  </tr>
                ) : !data?.payments.length ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]"
                    >
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  data.payments.map((payment) => {
                    const status = STATUS_STYLES[payment.status];

                    return (
                      <tr key={payment.id}>
                        <td className="px-6 py-3.5 text-sm text-[var(--color-text-secondary)]">
                          {new Date(payment.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-[var(--color-text-primary)]">
                          {PLAN_NAMES[payment.plan]}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-[var(--color-text-primary)]">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          >
                            {payment.status === "PAID" && (
                              <CheckCircle2 size={12} aria-hidden="true" />
                            )}
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
