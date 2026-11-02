"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

// Shown when a page crashes while rendering, instead of Next.js's plain
// default screen. The root layout (styles, theme, providers) stays in place.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("PAGE_ERROR:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-app-bg)] px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 text-center shadow-sm">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]"
        >
          <AlertTriangle size={22} />
        </span>

        <h1
          className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          This page could not be shown. Your data is safe. Try again, or go
          back to your dashboard.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            <RotateCw size={16} aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Go to dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-5 text-xs text-[var(--color-text-muted)]">
            Error reference: <code>{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  );
}
