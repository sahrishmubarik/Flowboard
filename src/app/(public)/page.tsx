"use client";
import Link from "next/link";
const features = [
  {
    title: "Personal inbox",
    desc: "Jot down a task the second it crosses your mind — no board required yet.",
    accent: "border-l-[var(--amber)]",
  },
  {
    title: "Boards that move",
    desc: "Drag cards across lists as work progresses, from idea to done.",
    accent: "border-l-[var(--indigo)]",
  },
  {
    title: "Attach the details",
    desc: "Drop files and screenshots straight onto a card, right where the work happens.",
    accent: "border-l-[var(--coral)]",
  },
  {
    title: "Yours, end to end",
    desc: "One board, one inbox, no one else to coordinate with — just you and the work.",
    accent: "border-l-[var(--sage)]",
  },
];

const steps = [
  {
    num: "1",
    title: "Capture",
    desc: "Add it to your inbox in seconds, from your desktop or your phone.",
  },
  {
    num: "2",
    title: "Place it",
    desc: "When you're ready, drag it onto the right board and list.",
  },
  {
    num: "3",
    title: "Track it",
    desc: "Watch it move from to do to done, with the whole team along.",
  },
];

const plans = [
  {
    plan: "Free",
    price: "$0",
    period: "/ forever",
    desc: "Everything you need to run one board well.",
    items: [
      "1 board, unlimited cards",
      "Personal inbox",
      "Basic labels and due dates",
      "50MB file storage",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    plan: "Pro",
    price: "$6",
    period: "/ month",
    desc: "For when one board turns into a handful.",
    items: [
      "Unlimited boards",
      "Personal inbox with quick-add shortcuts",
      "File attachments up to 25MB each",
      "5GB file storage",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    plan: "Lifetime",
    price: "$99",
    period: "/ once",
    desc: "Pay once, keep every Pro feature for good.",
    items: [
      "Everything in Pro",
      "All future updates included",
      "No recurring billing, ever",
      "Supports an independent builder",
    ],
    cta: "Buy lifetime access",
    featured: false,
  },
];

export default function FlowboardLanding() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto max-w-[1160px] px-6 md:px-10">
        {/* Hero */}
        <section className="flex flex-col items-center pb-10 pt-16 text-center">
          <h1
            className="max-w-[650px] text-[38px] font-bold leading-[1.08] tracking-tight md:text-[54px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where ideas turn into shipped work
          </h1>
          <p className="mt-[22px] max-w-[580px] text-lg text-[var(--ink-soft)]">
            Capture a thought the moment it hits, then drag it onto a board when
            it&apos;s ready to move.
          </p>
          <div className="mt-[34px] flex items-center gap-[22px]">
            <Link href="/signup" className="btn-primary">
              Start free
            </Link>
            <a href="#board" className="btn-text bg-white">
              See a board in action
            </a>
          </div>
        </section>
        {/* Board mockup */}
        <div
          id="board"
          className="mt-14 rounded-2xl bg-[var(--board-ink)] px-6 pb-[52px] pt-11 md:px-11"
        >
          <div className="mb-7 flex items-center justify-between">
            <div className="text-sm font-medium text-[#EDEEF5]">
              Product launch
            </div>
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--board-line)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--board-line)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--board-line)]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[18px] md:grid-cols-4">
            {/* Inbox column */}
            <div className="rounded-xl border border-dashed border-[var(--amber)] bg-[var(--amber)]/[0.06] p-3.5">
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="text-[13px] font-medium text-[var(--amber)]">
                  Inbox
                </span>
                <span className="text-xs text-[#6B7093]">3</span>
              </div>
              {[
                "Ask design for a new empty state",
                "Look into export-to-CSV",
                "Dark mode for the board view",
              ].map((text) => (
                <div
                  key={text}
                  className="mb-2.5 rounded-[9px] border border-dashed border-[var(--amber)]/35 bg-[var(--amber)]/10 px-[13px] py-3 text-[13px] text-[#F0D8B0]"
                >
                  {text}
                </div>
              ))}
            </div>

            {/* To do column */}
            <div className="rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-3.5 boardCard">
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="text-[13px] font-medium text-[#C7CAE0] board-col-label">
                  To do
                </span>
                <span className="text-xs text-[#6B7093]">2</span>
              </div>
              <div className="mb-2.5 rounded-[9px] border border-[var(--board-line)] bg-[#262A44] px-[13px] py-3 text-[13px] text-[#EDEEF5] board-card-inner">
                <span
                  className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-medium text-[var(--sky)]"
                  style={{ backgroundColor: "rgba(95,168,211,0.18)" }}
                >
                  Design
                </span>
                <br />
                Redesign card modal
              </div>
              <div className="mb-2.5 rounded-[9px] border border-[var(--board-line)] bg-[#262A44] px-[13px] py-3 text-[13px] text-[#EDEEF5] board-card-inner">
                <span
                  className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-medium text-[var(--coral)]"
                  style={{ backgroundColor: "rgba(226,114,91,0.18)" }}
                >
                  Bug
                </span>
                <br />
                Fix drag lag on mobile
              </div>
            </div>
            {/* In progress column */}
            <div className="rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-3.5 boardCard">
              <div className="flex items-center justify-between px-1 pb-3 ">
                <span className="text-[13px] font-medium text-[#C7CAE0] board-col-label">
                  In progress
                </span>
                <span className="text-xs text-[#6B7093]">2</span>
              </div>
              <div className="mb-2.5 rounded-[9px] border border-[var(--board-line)] bg-[#262A44] px-[13px] py-3 text-[13px] text-[#EDEEF5] board-card-inner">
                <span
                  className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-medium text-[var(--sage)]"
                  style={{ backgroundColor: "rgba(127,183,126,0.18)" }}
                >
                  Feature
                </span>
                <br />
                Personal inbox view
              </div>
              <div className="mb-2.5 rounded-[9px] border border-[var(--board-line)] bg-[#262A44] px-[13px] py-3 text-[13px] text-[#EDEEF5] board-card-inner">
                Attach files to a card
              </div>
            </div>

            {/* Done column */}
            <div className="rounded-xl border border-[var(--board-line)] bg-[var(--board-panel)] p-3.5 boardCard">
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="text-[13px] font-medium text-[#C7CAE0] board-col-label">
                  Done
                </span>
                <span className="text-xs text-[#6B7093]">1</span>
              </div>
              <div className="mb-2.5 rounded-[9px] border border-[var(--board-line)] bg-[#262A44] px-[13px] py-3 text-[13px] text-[#EDEEF5] board-card-inner">
                <span
                  className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-medium text-[var(--sage)]"
                  style={{ backgroundColor: "rgba(127,183,126,0.18)" }}
                >
                  Feature
                </span>
                <br />
                Board member invites
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="docs" className="py-[100px] flex flex-col items-center pb-10 pt-16 text-center">
          <div className="text-[15px] font-medium text-[var(--indigo)]">
            What you get
          </div>
          <h2
            className="mt-2.5 max-w-[520px] text-[28px] font-semibold tracking-tight md:text-[34px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A place to catch ideas before they need a home
          </h2>

          <div className="mt-[52px] grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--mist)] bg-white md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className={`border-l-[3px] bg-[var(--paper-raised)] p-[34px] ${f.accent}`}
              >
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2.5 max-w-[360px] text-[15px] text-[var(--ink-soft)]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-[100px]  flex flex-col items-center pb-10 pt-16 text-center">
          <div className="text-[15px] font-medium text-[var(--indigo)]">
            How it works
          </div>
          <h2
            className="mt-2.5 max-w-[520px] text-[28px] font-semibold tracking-tight md:text-[34px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From a passing thought to a finished card
          </h2>

          <div className="mt-[52px] grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="rounded-2xl bg-white border-[2px] border-gray-200 px-5 py-6 transition-all duration-300  hover:shadow-xl"
              >
                <div
                  className="text-[15px] font-semibold text-[var(--amber-deep)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.num}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-y border-[var(--mist)] bg-[var(--paper)] py-[100px]"
      >
        <div className="mx-auto max-w-[1160px] px-6 md:px-10 flex flex-col items-center pb-10  text-center">
          <div className="text-[15px] font-medium text-[var(--indigo)]">
            Pricing
          </div>
          <h2
            className="mt-2.5 max-w-[520px] text-[28px] font-semibold tracking-tight md:text-[34px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple pricing, no seats to count
          </h2>

          <div className="mt-[52px] grid max-w-[1080px] grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl p-8 px-[30px] ${
                  p.featured
                    ? "border-2 border-[var(--board-line)] bg-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`text-[15px] font-medium ${
                    p.featured
                      ? "text-[var(--board-panel)]"
                      : "text-[var(--board-ink)]"
                  }`}
                >
                  {p.plan}
                </div>
                <div
                  className="mt-2.5 text-[40px] font-medium tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.price}
                  <span
                    className="ml-1 text-[15px] font-normal text-[var(--ink-soft)]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {p.period}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[var(--ink-soft)]">
                  {p.desc}
                </div>

                <ul className="mt-6 flex flex-col gap-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sage)]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="price-btn mt-7 block rounded-lg border border-[var(--mist)] py-[11px] text-center text-sm font-medium text-[var(--ink)]"
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
