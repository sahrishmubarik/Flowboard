"use client";

import { Activity, ArrowRight, Clock3 } from "lucide-react";

export default function RecentActivityCard() {
  return (
    <section className="rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[var(--indigo)]" />

            <h3
              className="text-lg font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent activity
            </h3>
          </div>

          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Workspace activity will appear here.
          </p>
        </div>

        <button
          type="button"
          className="text-[var(--ink-soft)] transition hover:text-[var(--indigo)]"
          aria-label="View activity"
        >
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-[var(--mist)] bg-[var(--paper)] px-5 py-7 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--paper-raised)] text-[var(--ink-soft)]">
          <Clock3 size={18} />
        </div>

        <p className="mt-3 text-sm font-medium text-[var(--ink)]">
          No recent activity yet
        </p>

        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[var(--ink-soft)]">
          Board activity, member changes, and workspace events will appear here
          as your team starts working.
        </p>
      </div>
    </section>
  );
}
