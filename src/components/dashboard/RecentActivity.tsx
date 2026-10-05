"use client";

import { Activity, ArrowRight, Clock3 } from "lucide-react";

export default function RecentActivityCard() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 shadow-[var(--shadow-sm)] transition-colors duration-200">
      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[var(--color-primary)]" />

            <h3
              className="text-lg font-semibold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recent activity
            </h3>
          </div>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Workspace activity will appear here.
          </p>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
          aria-label="View activity"
        >
          <ArrowRight size={17} />
        </button>
      </div>

      {/* =========================================================
          EMPTY ACTIVITY STATE
      ========================================================== */}

      <div className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-app-bg)] px-5 py-7 text-center transition-colors duration-200">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-muted)]">
          <Clock3 size={18} />
        </div>

        <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
          No recent activity yet
        </p>

        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[var(--color-text-secondary)]">
          Board activity, member changes, and workspace events will appear here
          as your team starts working.
        </p>
      </div>
    </section>
  );
}
