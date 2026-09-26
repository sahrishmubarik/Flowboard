"use client";

import Link from "next/link";

const inboxItems = [
  {
    label: "Design",
    labelClass: "text-[var(--sky)] bg-[var(--sky)]/[0.12]",
    title: "Redesign the mobile navigation",
    description: "Make the board easier to use on smaller screens.",
  },
  {
    label: "Bug",
    labelClass: "text-[var(--coral)] bg-[var(--coral)]/[0.12]",
    title: "Fix drag interaction on mobile",
    description: "Cards occasionally jump when moving between lists.",
  },
  {
    label: "Feature",
    labelClass: "text-[var(--sage)] bg-[var(--sage)]/[0.12]",
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
    accent: "var(--amber)",
  },
  {
    number: "02",
    title: "Organize",
    description:
      "Move the right work from your inbox onto the board when it is ready.",
    accent: "var(--indigo)",
  },
  {
    number: "03",
    title: "Ship",
    description: "Track work through your lists until the card reaches done.",
    accent: "var(--sage)",
  },
];

const features = [
  {
    title: "Capture without context",
    description:
      "Not every thought needs a board immediately. Keep it in your inbox until you're ready.",
    accent: "border-l-[var(--amber)]",
  },
  {
    title: "Turn ideas into work",
    description:
      "When a thought becomes actionable, move it onto the right board and list.",
    accent: "border-l-[var(--indigo)]",
  },
  {
    title: "Keep everything together",
    description:
      "Tasks, bugs, ideas and small reminders stay in one simple place.",
    accent: "border-l-[var(--coral)]",
  },
  {
    title: "Built around your workflow",
    description:
      "Flowboard gives you a simple path from first thought to finished work.",
    accent: "border-l-[var(--sage)]",
  },
];

export default function InboxPage() {
  return (
    <main className="overflow-hidden bg-[var(--pap)] text-[var(--ink)]">
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
          part of a board. Flowboard gives every piece of work a place to start.
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
      <section className="fb-container pb-24">
        <div className="mx-auto max-w-[980px]">
          {/* Dark product window */}
          <div className="overflow-hidden rounded-[22px] border border-[var(--board-line)] bg-[var(--board-ink)] shadow-[0_25px_70px_rgba(37,52,63,0.18)]">
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-[var(--board-line)] px-5 py-4 md:px-7">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>

                <span className="hidden text-xs text-[#8d95a9] sm:block">
                  flowboard / inbox
                </span>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#b9bfce]">
                Personal workspace
              </span>
            </div>

            {/* Product body */}
            <div className="grid md:grid-cols-[210px_1fr]">
              {/* Mini sidebar */}
              <aside className="hidden border-r border-[var(--board-line)] p-5 md:block">
                <div className="mb-7 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--indigo)] text-xs font-bold text-white">
                    F
                  </span>

                  <span className="text-sm font-semibold text-white">
                    Flowboard
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="rounded-lg bg-white/[0.07] px-3 py-2.5 text-xs font-medium text-white">
                    Inbox
                  </div>

                  <div className="px-3 py-2.5 text-xs text-[#7f879b]">
                    Boards
                  </div>

                  <div className="px-3 py-2.5 text-xs text-[#7f879b]">
                    Members
                  </div>
                </div>

                <div className="mt-10">
                  <p className="px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#626b81]">
                    Workspace
                  </p>

                  <div className="mt-3 flex items-center gap-2 px-3">
                    <span className="h-2 w-2 rounded-full bg-[var(--sage)]" />

                    <span className="text-xs text-[#9299aa]">Personal</span>
                  </div>
                </div>
              </aside>

              {/* Inbox */}
              <div className="min-w-0 p-5 md:p-8">
                {/* Inbox heading */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--amber)]">
                      Quick capture
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                      Inbox
                    </h2>

                    <p className="mt-1 text-sm text-[#8f97aa]">
                      Things waiting for a place on your board.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-[#9ba2b3]">
                    3 items
                  </div>
                </div>

                {/* Add item */}
                <div className="mt-7 rounded-xl border border-dashed border-[var(--amber)]/50 bg-[var(--amber)]/[0.055] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--amber)]/30 text-sm text-[var(--amber)]">
                      +
                    </span>

                    <span className="text-sm text-[#c5c9d5]">
                      Add something you don't want to forget...
                    </span>
                  </div>
                </div>

                {/* Inbox items */}
                <div className="mt-4 space-y-3">
                  {inboxItems.map((item) => (
                    <div
                      key={item.title}
                      className="group rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#46506e]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${item.labelClass}`}
                          >
                            {item.label}
                          </span>

                          <h3 className="mt-2 text-sm font-medium text-[#f0f1f5]">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-[#858da1]">
                            {item.description}
                          </p>
                        </div>

                        <span className="mt-1 shrink-0 text-[#5e677d] transition-colors group-hover:text-[var(--amber)]">
                          →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom hint */}
                <div className="mt-6 flex items-center justify-between border-t border-[var(--board-line)] pt-5">
                  <span className="text-xs text-[#697287]">
                    Move an item to a board when you're ready.
                  </span>

                  <span className="hidden text-xs text-[#697287] sm:block">
                    Inbox
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-5 text-center text-xs text-[var(--ink-muted)]">
            A simple place to catch work before it needs a board.
          </p>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================== */}
      <section className="border-y border-[var(--mist)] bg-[var(--paper-raised)]">
        <div className="fb-container py-20 md:py-24">
          <div className="mx-auto max-w-[700px] text-center">
            <div className="fb-eyebrow">Why an inbox?</div>

            <h2 className="fb-heading mt-3 text-[32px] leading-tight md:text-[44px]">
              Not every idea needs a board.
            </h2>

            <p className="fb-body mt-5 text-base leading-7">
              Sometimes you just need somewhere to put something before you
              decide what it means. Your Flowboard inbox gives those thoughts a
              temporary home without forcing you to organize them too early.
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

        <div className="mx-auto mt-12 grid max-w-[980px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--mist)] md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`border-l-[3px] bg-white p-7 md:p-8 ${feature.accent} transition-colors duration-200 hover:bg-[var(--paper-raised)]`}
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
      <section className="border-y border-[var(--mist)] bg-[var(--paper-raised)]">
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

                <div className="text-sm font-semibold text-[var(--ink-muted)]">
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
              Once an item becomes real work, move it onto a board. From there,
              lists and cards help you track its progress all the way to done.
            </p>

            <Link href="/auth/register" className="fb-btn-primary mt-7">
              Create your Flowboard
            </Link>
          </div>

          {/* Mini board */}
          <div className="rounded-2xl bg-[var(--board-ink)] p-5 shadow-lg md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-[#e5e7ed]">
                Product launch
              </span>

              <span className="text-xs text-[#687187]">4 cards</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* To do */}
              <div className="rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#c6cad8]">
                    To do
                  </span>

                  <span className="text-[10px] text-[#687187]">2</span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg border border-[var(--board-line)] bg-[#24304f] p-3 text-xs text-[#e8eaf0]">
                    Redesign card modal
                  </div>

                  <div className="rounded-lg border border-[var(--board-line)] bg-[#24304f] p-3 text-xs text-[#e8eaf0]">
                    Export board data
                  </div>
                </div>
              </div>

              {/* Done */}
              <div className="rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#c6cad8]">
                    Done
                  </span>

                  <span className="text-[10px] text-[#687187]">2</span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg border border-[var(--board-line)] bg-[#24304f] p-3 text-xs text-[#e8eaf0]">
                    Member invites
                  </div>

                  <div className="rounded-lg border border-[var(--board-line)] bg-[#24304f] p-3 text-xs text-[#e8eaf0]">
                    Empty state
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="border-t border-[var(--mist)] bg-[var(--board-ink)]">
        <div className="fb-container flex flex-col items-center py-20 text-center md:py-24">
          <div className="text-sm font-medium text-[var(--amber)]">
            Start with one thought
          </div>

          <h2
            className="mt-3 max-w-[650px] text-[34px] font-semibold leading-tight tracking-tight text-white md:text-[48px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Give your next idea somewhere to land.
          </h2>

          <p className="mt-5 max-w-[520px] text-sm leading-6 text-[#9ba2b3] md:text-base">
            Start free with Flowboard and turn quick thoughts into organized,
            finished work.
          </p>

          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[var(--board-ink)] transition-all duration-200 hover:bg-[var(--paper)]"
          >
            Start free
          </Link>
        </div>
      </section>
    </main>
  );
}
