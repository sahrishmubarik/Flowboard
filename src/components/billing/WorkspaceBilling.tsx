"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  KanbanSquare,
  Loader2,
  Lock,
  Receipt,
  Users,
  XCircle,
} from "lucide-react";

import {
  FEATURED_PLAN,
  formatAmount,
  PLAN_STYLES,
} from "@/components/billing/planDisplay";
import { useToast } from "@/components/ui/ToastProvider";
import { PLAN_ORDER, type PlanKey } from "@/lib/billing/plans";

type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  features: string[];
  amount: number;
  currency: string;
};

type Payment = {
  id: string;
  plan: PlanKey;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  paidAt: string | null;
  createdAt: string;
};

type Subscription = {
  plan: PlanKey;
  status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPeriodEnd: string;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};

// null limit means unlimited.
type Usage = {
  boards: { used: number; limit: number | null };
  members: { used: number; limit: number | null; pendingInvitations: number };
};

type BillingResponse = {
  message?: string;
  plans: Plan[];
  // Worked out on the server, including the grace period.
  currentPlan: PlanKey;
  usage: Usage;
  subscription: Subscription | null;
  payments: Payment[];
};

type WorkspaceBillingProps = {
  workspaceId: string;
  checkoutResult: "success" | "cancelled" | null;
};

// After a successful checkout, keep checking for the webhook this long.
const CONFIRM_TIMEOUT_MS = 30_000;
const CONFIRM_POLL_MS = 2_500;

const STATUS_STYLES: Record<
  Payment["status"],
  {
    label: string;
    icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className:
      "bg-[var(--color-tag-yellow-bg)] text-[var(--color-tag-yellow-text)]",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    className:
      "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]",
  },
};

function formatDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
}

export default function WorkspaceBilling({
  workspaceId,
  checkoutResult,
}: WorkspaceBillingProps) {
  const { showToast } = useToast();
  const [startingPlan, setStartingPlan] = useState<PlanKey | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

  // Back from Stripe: the webhook usually lands a second or two later, so
  // keep checking for a while instead of asking the user to refresh.
  useEffect(() => {
    if (checkoutResult !== "success") return;

    const timer = setTimeout(() => setConfirmTimedOut(true), CONFIRM_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [checkoutResult]);

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
    refetchInterval: (query) => {
      const latest = query.state.data?.payments[0];

      return checkoutResult === "success" &&
        !confirmTimedOut &&
        latest?.status === "PENDING"
        ? CONFIRM_POLL_MS
        : false;
    },
  });

  // Sends only the plan name; the server sets the price and returns the
  // Stripe Checkout page to go to.
  async function startCheckout(plan: PlanKey) {
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

  // Stripe's Customer Portal: update the card, see invoices or cancel.
  async function openPortal() {
    setOpeningPortal(true);

    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/billing/portal`,
        { method: "POST" },
      );
      const body = await response.json();

      if (!response.ok || !body.portalUrl) {
        throw new Error(body.message || "Could not open the billing portal.");
      }

      window.location.assign(body.portalUrl);
    } catch (portalError) {
      showToast(
        portalError instanceof Error
          ? portalError.message
          : "Could not open the billing portal.",
        "error",
      );
      setOpeningPortal(false);
    }
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
      >
        {error.message}
      </div>
    );
  }

  const currentPlan = data?.currentPlan ?? "FREE";
  const subscription = data?.subscription ?? null;
  // A subscription that has not ended yet blocks a second checkout; plan
  // changes are not supported yet.
  const hasLiveSubscription =
    subscription !== null && subscription.status !== "CANCELED";
  const currentRank = PLAN_ORDER.indexOf(
    hasLiveSubscription ? subscription.plan : currentPlan,
  );
  const latestPayment = data?.payments[0];

  return (
    <div className="space-y-8">
      {checkoutResult === "success" && data && (
        <CheckoutBanner
          tone={
            latestPayment?.status === "PAID"
              ? "confirmed"
              : confirmTimedOut
                ? "slow"
                : "confirming"
          }
          planName={
            latestPayment ? planName(data.plans, latestPayment.plan) : ""
          }
        />
      )}

      {checkoutResult === "cancelled" && (
        <Banner
          icon={XCircle}
          className="bg-[var(--color-tag-neutral-bg)]"
          iconClassName="text-[var(--color-tag-neutral-text)]"
          title="Checkout cancelled"
          text="No payment was taken. You can pick a plan again whenever you are ready."
        />
      )}

      {/* A monthly payment failed: during the grace period the plan stays,
          after it the workspace is on Free until the card is fixed. */}
      {data && subscription?.status === "PAST_DUE" && (
        <PaymentFailedBanner
          planName={planName(data.plans, subscription.plan)}
          graceEndsAt={subscription.graceEndsAt}
          graceOver={currentPlan === "FREE"}
          opening={openingPortal}
          onUpdateCard={openPortal}
        />
      )}

      {/* Current plan */}
      {isLoading || !data ? (
        <div className="h-[132px] animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-border)]" />
      ) : (
        <CurrentPlanCard
          plan={data.plans.find((plan) => plan.key === currentPlan)!}
          subscription={hasLiveSubscription ? subscription : null}
          opening={openingPortal}
          onManage={openPortal}
        />
      )}

      {/* Usage against the plan's limits */}
      {data && (
        <section
          aria-label="Plan usage"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <UsageMeter
            icon={KanbanSquare}
            label="Boards"
            used={data.usage.boards.used}
            limit={data.usage.boards.limit}
          />
          <UsageMeter
            icon={Users}
            label="Members"
            used={data.usage.members.used}
            limit={data.usage.members.limit}
            note={
              data.usage.members.pendingInvitations > 0
                ? `Includes ${data.usage.members.pendingInvitations} pending ${
                    data.usage.members.pendingInvitations === 1
                      ? "invitation"
                      : "invitations"
                  }`
                : undefined
            }
          />
        </section>
      )}

      {/* Plans */}
      <section aria-labelledby="billing-plans-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="billing-plans-heading"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              Choose your plan
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Billed monthly. Plans apply to this whole workspace, and you can
              cancel any time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {isLoading || !data
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[400px] animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-border)]"
                />
              ))
            : data.plans.map((plan) => {
                const rank = PLAN_ORDER.indexOf(plan.key);

                return (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    state={
                      rank === currentRank
                        ? "current"
                        : rank < currentRank
                          ? "included"
                          : hasLiveSubscription
                            ? "unavailable"
                            : "upgrade"
                    }
                    featured={plan.key === FEATURED_PLAN}
                    starting={startingPlan === plan.key}
                    disabled={startingPlan !== null}
                    onUpgrade={() => startCheckout(plan.key)}
                  />
                );
              })}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[var(--color-text-muted)]">
          <Lock size={13} aria-hidden="true" />
          Payments are processed securely by Stripe. Your card details never
          reach Flowboard.
        </p>
      </section>

      {/* Payment history */}
      <PaymentHistory
        isLoading={isLoading}
        payments={data?.payments ?? []}
        plans={data?.plans ?? []}
      />
    </div>
  );
}

// One limit, e.g. "Boards 2 of 3", with a bar that turns yellow near the
// limit and red when it is reached.
function UsageMeter({
  icon: Icon,
  label,
  used,
  limit,
  note,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  used: number;
  limit: number | null;
  note?: string;
}) {
  const ratio = limit === null ? 0 : Math.min(1, used / limit);
  const full = limit !== null && used >= limit;
  const barColor = full
    ? "bg-[var(--color-danger)]"
    : ratio >= 0.8
      ? "bg-[var(--color-priority-medium)]"
      : "bg-[var(--color-primary)]";

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className="text-[var(--color-text-muted)]">
            <Icon size={16} />
          </span>
          {label}
        </span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          {used}
          <span className="font-normal text-[var(--color-text-muted)]">
            {limit === null ? " · Unlimited" : ` of ${limit}`}
          </span>
        </span>
      </div>

      {limit !== null && (
        <div
          role="progressbar"
          aria-label={`${label} used`}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-app-bg)]"
        >
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.max(ratio * 100, used > 0 ? 4 : 0)}%` }}
          />
        </div>
      )}

      <p
        className={`mt-2 text-xs ${
          full
            ? "font-medium text-[var(--color-tag-red-text)]"
            : "text-[var(--color-text-muted)]"
        }`}
      >
        {limit !== null && used > limit
          ? `Over your plan's limit. Nothing was removed; upgrade to add more ${label.toLowerCase()}.`
          : full
            ? `Limit reached. Upgrade to add more ${label.toLowerCase()}.`
          : (note ??
            (limit === null
              ? `No limit on your plan.`
              : `${limit - used} left on your plan.`))}
      </p>
    </div>
  );
}

function SpinningLoader({
  size,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <Loader2 size={size} className={`${className} animate-spin`} />;
}

function planName(plans: Plan[], key: PlanKey) {
  return plans.find((plan) => plan.key === key)?.name ?? key;
}

function Banner({
  icon: Icon,
  className,
  iconClassName,
  title,
  text,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  className: string;
  iconClassName: string;
  title: string;
  text: string;
}) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-[var(--radius-xl)] px-5 py-4 ${className}`}
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${iconClassName}`} />
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          {text}
        </p>
      </div>
    </div>
  );
}

// The redirect from Stripe proves nothing, so the banner only turns green
// once the server has confirmed the payment through the webhook.
function CheckoutBanner({
  tone,
  planName,
}: {
  tone: "confirming" | "confirmed" | "slow";
  planName: string;
}) {
  if (tone === "confirmed") {
    return (
      <Banner
        icon={CheckCircle2}
        className="bg-[var(--color-tag-green-bg)]"
        iconClassName="text-[var(--color-tag-green-text)]"
        title="Payment confirmed"
        text={`Thank you! Your workspace is now on the ${planName} plan.`}
      />
    );
  }

  if (tone === "slow") {
    return (
      <Banner
        icon={AlertTriangle}
        className="bg-[var(--color-tag-yellow-bg)]"
        iconClassName="text-[var(--color-tag-yellow-text)]"
        title="Still confirming your payment"
        text="This is taking longer than usual. Refresh this page in a minute; you will not be charged twice."
      />
    );
  }

  return (
    <Banner
      icon={SpinningLoader}
      className="bg-[var(--color-tag-blue-bg)]"
      iconClassName="text-[var(--color-tag-blue-text)]"
      title="Confirming your payment…"
      text="Stripe accepted your payment. We are confirming it now, this usually takes a few seconds."
    />
  );
}

// Owner-facing warning while a monthly payment is failing. Before the grace
// date the paid plan still works; after it the workspace is on Free until the
// card is fixed (Stripe keeps retrying until it gives up).
function PaymentFailedBanner({
  planName,
  graceEndsAt,
  graceOver,
  opening,
  onUpdateCard,
}: {
  planName: string;
  graceEndsAt: string | null;
  graceOver: boolean;
  opening: boolean;
  onUpdateCard: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-danger)] bg-[var(--color-tag-red-bg)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-[var(--color-tag-red-text)]"
        />
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {graceOver
              ? `Your ${planName} plan is paused`
              : "Your last payment failed"}
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            {graceOver
              ? `The grace period has ended, so this workspace is on the Free plan. Update your card to get ${planName} back.`
              : `Update your card${
                  graceEndsAt ? ` by ${formatDate(graceEndsAt)}` : ""
                } to keep ${planName}. Until then everything keeps working; after that the workspace moves to the Free plan. No data is deleted.`}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUpdateCard}
        disabled={opening}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-danger)] transition-colors hover:bg-[var(--color-danger-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {opening && (
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
        )}
        Update card
      </button>
    </div>
  );
}

function CurrentPlanCard({
  plan,
  subscription,
  opening,
  onManage,
}: {
  plan: Plan;
  subscription: Subscription | null;
  opening: boolean;
  onManage: () => void;
}) {
  const style = PLAN_STYLES[plan.key];
  const Icon = style.icon;
  const isPaid = plan.key !== "FREE";
  const pastDue = subscription?.status === "PAST_DUE";

  return (
    <section
      aria-label="Current plan"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 ${style.stripe}`}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] ${style.tile}`}
          >
            <Icon size={22} />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Current plan
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p
                className="text-2xl font-semibold text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {plan.name}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  pastDue
                    ? "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]"
                    : isPaid
                      ? "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]"
                      : "bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)]"
                }`}
              >
                {pastDue ? (
                  <AlertTriangle size={12} aria-hidden="true" />
                ) : (
                  isPaid && <CheckCircle2 size={12} aria-hidden="true" />
                )}
                {pastDue
                  ? "Payment failed"
                  : isPaid
                    ? subscription?.cancelAtPeriodEnd
                      ? "Cancels soon"
                      : "Active"
                    : "Free forever"}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {plan.tagline}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-app-bg)] px-4 py-3 sm:text-right">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {!subscription
                ? "No subscription"
                : pastDue
                  ? isPaid
                    ? "Paid features until"
                    : "Paid features ended on"
                  : subscription.cancelAtPeriodEnd
                    ? "Ends on"
                    : "Next payment"}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)]">
              {!subscription
                ? "Upgrade to unlock more"
                : pastDue
                  ? subscription.graceEndsAt
                    ? formatDate(subscription.graceEndsAt)
                    : "—"
                  : subscription.cancelAtPeriodEnd
                    ? formatDate(subscription.currentPeriodEnd)
                    : `${formatAmount(plan.amount, plan.currency)} on ${formatDate(
                        subscription.currentPeriodEnd,
                      )}`}
            </p>
          </div>

          {subscription && (
            <button
              type="button"
              onClick={onManage}
              disabled={opening}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {opening && (
                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              )}
              Manage subscription
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  state,
  featured,
  starting,
  disabled,
  onUpgrade,
}: {
  plan: Plan;
  // unavailable: a subscription is running and plan changes are not
  // supported yet.
  state: "current" | "included" | "upgrade" | "unavailable";
  featured: boolean;
  starting: boolean;
  disabled: boolean;
  onUpgrade: () => void;
}) {
  const style = PLAN_STYLES[plan.key];
  const Icon = style.icon;
  const highlighted = featured && state === "upgrade";

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--color-card-bg)] p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        highlighted
          ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
          : "border-[var(--color-border)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 ${style.stripe}`}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] ${style.tile}`}
        >
          <Icon size={18} />
        </span>

        {state === "current" ? (
          <span className="rounded-full bg-[var(--color-tag-green-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-tag-green-text)]">
            Current plan
          </span>
        ) : (
          highlighted && (
            <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          )
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {plan.tagline}
      </p>

      <p className="mt-5 flex items-baseline gap-1.5">
        <span
          className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatAmount(plan.amount, plan.currency)}
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {plan.key === "FREE" ? "forever" : "/ month"}
        </span>
      </p>

      <ul className="mt-5 flex-1 space-y-2.5 border-t border-[var(--color-border)] pt-5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-[var(--color-text-primary)]"
          >
            <Check
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-status-done)]"
            />
            {feature}
          </li>
        ))}
      </ul>

      {state === "upgrade" ? (
        <button
          type="button"
          onClick={onUpgrade}
          disabled={disabled}
          className={`mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60 ${
            highlighted
              ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
              : "border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          }`}
        >
          {starting && (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          )}
          {starting ? "Opening checkout…" : `Upgrade to ${plan.name}`}
        </button>
      ) : (
        <p className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-app-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)]">
          {state !== "unavailable" && <Check size={16} aria-hidden="true" />}
          {state === "current"
            ? "Your current plan"
            : state === "included"
              ? "Included in your plan"
              : "Plan changes coming soon"}
        </p>
      )}
    </article>
  );
}

function PaymentHistory({
  isLoading,
  payments,
  plans,
}: {
  isLoading: boolean;
  payments: Payment[];
  plans: Plan[];
}) {
  return (
    <section
      aria-labelledby="billing-history-heading"
      className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          >
            <Receipt size={17} />
          </span>
          <div>
            <h2
              id="billing-history-heading"
              className="text-base font-semibold text-[var(--color-text-primary)]"
            >
              Payment history
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Every checkout started for this workspace.
            </p>
          </div>
        </div>

        {!isLoading && payments.length > 0 && (
          <span className="rounded-full bg-[var(--color-app-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            {payments.length} {payments.length === 1 ? "payment" : "payments"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]"
            />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-app-bg)] text-[var(--color-text-muted)]"
          >
            <Receipt size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
            No payments yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
            When you upgrade, your receipts and their status will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
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
              {payments.map((payment) => {
                const status = STATUS_STYLES[payment.status];
                const StatusIcon = status.icon;
                const PlanIcon = PLAN_STYLES[payment.plan].icon;

                return (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-[var(--color-app-bg)]"
                  >
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {formatDate(payment.createdAt, true)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                        <span
                          aria-hidden="true"
                          className={`flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] ${PLAN_STYLES[payment.plan].tile}`}
                        >
                          <PlanIcon size={13} />
                        </span>
                        {planName(plans, payment.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text-primary)]">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon size={12} aria-hidden />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
