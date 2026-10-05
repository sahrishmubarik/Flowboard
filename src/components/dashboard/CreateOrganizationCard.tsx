"use client";

import Link from "next/link";

export default function CreateOrganizationCard() {
  return (
    <Link
      href="/dashboard/workspace/create-workspace"
      className="group flex w-full items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-5 py-4 text-left transition hover:border-[var(--color-primary)] hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-medium text-white transition group-hover:bg-[var(--color-primary-hover)]">
          +
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Create New Organization
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Start a new organization and invite your team.
          </p>
        </div>
      </div>

      <span className="text-lg text-[var(--color-text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--color-primary)]">
        →
      </span>
    </Link>
  );
}
