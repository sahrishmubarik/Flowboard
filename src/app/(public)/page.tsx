"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inboxItems = [
  {
    label: "Design",
    labelClass:
      "text-[var(--color-status-progress)] bg-[var(--color-status-progress)]/[0.12]",
    title: "Redesign the mobile navigation",
    description: "Make the board easier to use on smaller screens.",
  },
  {
    label: "Bug",
    labelClass:
      "text-[var(--color-priority-high)] bg-[var(--color-priority-high)]/[0.12]",
    title: "Fix drag interaction on mobile",
    description: "Cards occasionally jump when moving between lists.",
  },
  {
    label: "Feature",
    labelClass:
      "text-[var(--color-priority-low)] bg-[var(--color-priority-low)]/[0.12]",
    title: "Add board member invites",
    description: "Allow workspace owners to invite people to a board.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Capture",
    description:
      "Save an idea, task, bug, or reminder the moment it crosses your mind.",
    accent: "var(--color-priority-medium)",
  },
  {
    number: "02",
    title: "Organize",
    description:
      "Move the right work from your inbox onto the board when it is ready.",
    accent: "var(--color-primary)",
  },
  {
    number: "03",
    title: "Ship",
    description: "Track work through your lists until the card reaches done.",
    accent: "var(--color-priority-low)",
  },
];

const features = [
  {
    title: "Capture without context",
    description:
      "Not every thought needs a board immediately. Keep it in your inbox until you're ready.",
    accent: "border-l-[var(--color-priority-medium)]",
  },
  {
    title: "Turn ideas into work",
    description:
      "When a thought becomes actionable, move it onto the right board and list.",
    accent: "border-l-[var(--color-primary)]",
  },
  {
    title: "Keep everything together",
    description:
      "Tasks, bugs, ideas and small reminders stay in one simple place.",
    accent: "border-l-[var(--color-priority-high)]",
  },
  {
    title: "Built around your workflow",
    description:
      "Flowboard gives you a simple path from first thought to finished work.",
    accent: "border-l-[var(--color-priority-low)]",
  },
];

export default function InboxPage() {
  return (
    <>
      <main className="overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-text-primary)]">
        {/* =========================================================
          HERO
      ========================================================== */}
        <section className="fb-container flex flex-col items-center pb-20 pt-20 text-center md:pb-24 md:pt-28">
          <div className="fb-eyebrow">Personal inbox</div>

          <h1 className="fb-heading mt-3 max-w-[760px] text-[42px] leading-[1.05] md:text-[64px]">
            Capture it now.
            <br />
            Organize it when ready.
          </h1>

          <p className="fb-body mt-6 max-w-[610px] text-base leading-7 md:text-lg">
            Keep ideas, tasks and quick thoughts in one place before they become
            part of a board. Flowboard gives every piece of work a place to
            start.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="fb-btn-primary">
              Start free
            </Link>

            <Link href="/auth/login" className="fb-btn-secondary">
              Log in
            </Link>
          </div>
        </section>

        {/* =========================================================
          INBOX PRODUCT PREVIEW
      ========================================================== */}
        <section id="board" className="fb-container pb-24">
          <div className="mx-auto max-w-[980px]">
            {/* Dark product window */}
            <div className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-product-window)] shadow-[0_25px_70px_rgba(37,52,63,0.18)]">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 md:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-card-bg)]/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-card-bg)]/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-card-bg)]/20" />
                  </div>

                  <span className="hidden text-xs text-[var(--color-text-muted)] sm:block">
                    flowboard / inbox
                  </span>
                </div>

                <span className="rounded-full border border-[var(--color-product-window-line)]/60 bg-[var(--color-product-window-soft)] px-3 py-1 text-xs text-[var(--color-product-window-muted)]">
                  Personal workspace
                </span>
              </div>

              {/* Product body */}
              <div className="grid md:grid-cols-[210px_1fr]">
                {/* Mini sidebar */}
                <aside className="hidden border-r border-[var(--color-border)] p-5 md:block">
                  <div className="mb-7 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-bold text-[var(--color-product-window-text)]">
                      F
                    </span>

                    <span className="text-sm font-semibold text-[var(--color-product-window-text)]">
                      Flowboard
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="rounded-lg bg-[var(--color-product-window-soft)] px-3 py-2.5 text-xs font-medium text-[var(--color-product-window-text)]">
                      Inbox
                    </div>

                    <div className="px-3 py-2.5 text-xs text-[var(--color-text-muted)]">
                      Boards
                    </div>

                    <div className="px-3 py-2.5 text-xs text-[var(--color-text-muted)]">
                      Members
                    </div>
                  </div>

                  <div className="mt-10">
                    <p className="px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      Workspace
                    </p>

                    <div className="mt-3 flex items-center gap-2 px-3">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-priority-low)]" />

                      <span className="text-xs text-[var(--color-product-window-muted)]">
                        Personal
                      </span>
                    </div>
                  </div>
                </aside>

                {/* Inbox */}
                <div className="min-w-0 p-5 md:p-8">
                  {/* Inbox heading */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-priority-medium)]">
                        Quick capture
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-product-window-text)]">
                        Inbox
                      </h2>

                      <p className="mt-1 text-sm text-[var(--color-product-window-muted)]">
                        Things waiting for a place on your board.
                      </p>
                    </div>

                    <div className="shrink-0 rounded-full bg-[var(--color-product-window-soft)] px-3 py-1.5 text-xs text-[var(--color-product-window-muted)]">
                      3 items
                    </div>
                  </div>

                  {/* Add item */}
                  <div className="mt-7 rounded-xl border border-dashed border-[var(--color-priority-medium)]/50 bg-[var(--color-priority-medium)]/[0.055] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-priority-medium)]/30 text-sm text-[var(--color-priority-medium)]">
                        +
                      </span>

                      <span className="text-sm text-[var(--color-product-window-muted)]">
                        Add something you don't want to forget...
                      </span>
                    </div>
                  </div>

                  {/* Inbox items */}
                  <div className="mt-4 space-y-3">
                    {inboxItems.map((item) => (
                      <div
                        key={item.title}
                        className="group rounded-xl border border-[var(--color-priority-medium)]/30 bg-[var(--color-priority-medium)]/[0.055] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-priority-medium)]/55"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${item.labelClass}`}
                            >
                              {item.label}
                            </span>

                            <h3 className="mt-2 text-sm font-medium text-[var(--color-product-window-text)]">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[var(--color-product-window-muted)]">
                              {item.description}
                            </p>
                          </div>

                          <span className="mt-1 shrink-0 text-[var(--color-product-window-muted)] transition-colors group-hover:text-[var(--color-priority-medium)]">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom hint */}
                  <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Move an item to a board when you're ready.
                    </span>

                    <span className="hidden text-xs text-[var(--color-text-muted)] sm:block">
                      Inbox
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
              A simple place to catch work before it needs a board.
            </p>
          </div>
        </section>

        {/* =========================================================
          INTRO
      ========================================================== */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <div className="fb-container py-20 md:py-24">
            <div className="mx-auto max-w-[700px] text-center">
              <div className="fb-eyebrow">Why an inbox?</div>

              <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[44px]">
                Not every idea needs a board.
              </h2>

              <p className="fb-body mt-5 text-base leading-7">
                Sometimes you just need somewhere to put something before you
                decide what it means. Your Flowboard inbox gives those thoughts
                a temporary home without forcing you to organize them too early.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
          FEATURES
      ========================================================== */}
        <section className="fb-container fb-section">
          <div className="text-center">
            <div className="fb-eyebrow">Keep work moving</div>

            <h2 className="fb-heading mx-auto mt-3 max-w-[600px] text-[32px] leading-tight md:text-[40px]">
              A small inbox with a big purpose
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-[980px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className={`border-l-[3px] bg-[var(--color-card-bg)] p-7 md:p-8 ${feature.accent} transition-colors duration-200 hover:bg-[var(--color-card-bg)]`}
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>

                <p className="fb-body mt-2.5 max-w-[390px] text-sm leading-6">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================
          WORKFLOW
      ========================================================== */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <div className="fb-container fb-section">
            <div className="text-center">
              <div className="fb-eyebrow">Simple workflow</div>

              <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[40px]">
                From thought to finished work
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-[1000px] grid-cols-1 gap-5 md:grid-cols-3">
              {workflow.map((item) => (
                <article
                  key={item.number}
                  className="fb-card fb-card-hover relative overflow-hidden p-7"
                >
                  <span
                    className="absolute left-0 top-0 h-full w-1"
                    style={{ backgroundColor: item.accent }}
                  />

                  <div className="text-sm font-semibold text-[var(--color-text-muted)]">
                    {item.number}
                  </div>

                  <h3 className="fb-heading mt-4 text-[25px]">{item.title}</h3>

                  <p className="fb-body mt-3 text-sm leading-6">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
          BOARD TRANSITION
      ========================================================== */}
        <section className="fb-container fb-section">
          <div className="mx-auto grid max-w-[1000px] items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
            {/* Text */}
            <div>
              <div className="fb-eyebrow">When you're ready</div>

              <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[42px]">
                Your inbox is the starting point.
              </h2>

              <p className="fb-body mt-5 text-base leading-7">
                Once an item becomes real work, move it onto a board. From
                there, lists and cards help you track its progress all the way
                to done.
              </p>

              <Link href="/auth/register" className="fb-btn-primary mt-7">
                Create your Flowboard
              </Link>
            </div>

            {/* Mini board */}
            <div className="rounded-2xl bg-[color-mix(in_srgb,var(--color-text-primary)_92%,var(--color-app-bg))] p-5 shadow-lg md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Product launch
                </span>

                <span className="text-xs text-[var(--color-text-muted)]">
                  4 cards
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* To do */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-column-bg)] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      To do
                    </span>

                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      2
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] p-3 text-xs text-[var(--color-text-primary)]">
                      Redesign card modal
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] p-3 text-xs text-[var(--color-text-primary)]">
                      Export board data
                    </div>
                  </div>
                </div>

                {/* Done */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-column-bg)] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Done
                    </span>

                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      2
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] p-3 text-xs text-[var(--color-text-primary)]">
                      Member invites
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-hover)] p-3 text-xs text-[var(--color-text-primary)]">
                      Empty state
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
          PRICING
      ========================================================== */}
        <section
          id="pricing"
          className="border-y border-[var(--color-border)] bg-[var(--color-card-bg)]"
        >
          <div className="fb-container fb-section">
            <div className="mx-auto max-w-[700px] text-center">
              <div className="fb-eyebrow">Pricing</div>
              <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[42px]">
                Start simple. Grow when your workflow does.
              </h2>
              <p className="fb-body mt-5 text-base leading-7">
                Use Flowboard for personal capture today and add more workspace
                capabilities as your team needs them.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-[980px] gap-5 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "For personal ideas and lightweight work.",
                  items: [
                    "Personal inbox",
                    "Boards and lists",
                    "Basic task tracking",
                  ],
                },
                {
                  name: "Team",
                  price: "$8",
                  description: "For small teams organizing work together.",
                  items: [
                    "Shared workspaces",
                    "Members and invites",
                    "Board collaboration",
                  ],
                },
                {
                  name: "Scale",
                  price: "$15",
                  description:
                    "For teams that need a more structured workflow.",
                  items: [
                    "Advanced permissions",
                    "More workspace controls",
                    "Team-ready workflows",
                  ],
                },
              ].map((plan) => (
                <article
                  key={plan.name}
                  className="fb-card fb-card-hover flex flex-col p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="fb-heading text-2xl">{plan.name}</h3>
                    {plan.name === "Team" && (
                      <span className="rounded-full bg-[var(--color-primary-active-bg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-5">
                    <span className="text-3xl font-semibold text-[var(--color-text-primary)]">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-sm text-[var(--color-text-muted)]">
                      / user / month
                    </span>
                  </div>
                  <p className="fb-body mt-3 min-h-12 text-sm leading-6">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[var(--color-status-done)]">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="fb-btn-primary mt-7 w-full"
                  >
                    Start free
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
          DOCS
      ========================================================== */}
        <section id="docs" className="fb-container fb-section">
          <div className="mx-auto max-w-[700px] text-center">
            <div className="fb-eyebrow">Docs</div>
            <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[42px]">
              Learn the Flowboard workflow.
            </h2>
            <p className="fb-body mt-5 text-base leading-7">
              Start with capture, then move useful work into boards, lists and
              cards. These are the core concepts behind the product.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[980px] gap-5 md:grid-cols-3">
            {[
              [
                "Inbox",
                "Capture ideas, reminders, bugs and tasks before they need structure.",
              ],
              [
                "Boards",
                "Turn an inbox item into organized work using lists and cards.",
              ],
              [
                "Collaboration",
                "Invite workspace members and keep shared work visible.",
              ],
            ].map(([title, description]) => (
              <article key={title} className="fb-card fb-card-hover p-7">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-active-bg)] text-sm font-semibold text-[var(--color-primary)]">
                  →
                </div>
                <h3 className="fb-heading text-[24px]">{title}</h3>
                <p className="fb-body mt-3 text-sm leading-6">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================
          FINAL CTA
      ========================================================== */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-product-window)]">
          <div className="fb-container flex flex-col items-center py-20 text-center md:py-24">
            <div className="text-sm font-medium text-[var(--color-priority-medium)]">
              Start with one thought
            </div>

            <h2
              className="mt-3 max-w-[650px] text-[34px] font-semibold leading-tight tracking-tight text-[var(--color-product-window-text)] md:text-[48px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Give your next idea somewhere to land.
            </h2>

            <p className="mt-5 max-w-[520px] text-sm leading-6 text-[var(--color-text-secondary)] md:text-base">
              Start free with Flowboard and turn quick thoughts into organized,
              finished work.
            </p>

            <Link
              href="/auth/register"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-[var(--color-card-bg)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all duration-200 hover:bg-[var(--color-app-bg)]"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
