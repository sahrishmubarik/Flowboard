"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthMobileLogo from "@/components/auth/AuthMobileLogo";
import { getSafeRedirect } from "@/lib/safeRedirect";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const redirect = getSafeRedirect(searchParams.get("redirect"));

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "verify-email",
            token,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email verification failed.");
        }

        setMessage(data.message);
        setVerified(true);

        // Keep the redirect (e.g. a pending invitation) through to login.
        const timeoutId = setTimeout(() => {
          router.push(
            redirect
              ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
              : "/auth/login",
          );
        }, 1500);

        return timeoutId;
      } catch (error) {
        setError(true);
        setMessage(
          error instanceof Error ? error.message : "Email verification failed.",
        );
      }
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    verifyEmail().then((id) => {
      timeoutId = id;
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, redirect, router]);

  const hasError = !token || error;

  const displayMessage = !token ? "Invalid verification link." : message;

  // Keep a pending redirect (e.g. an invitation) on the way to login.
  const loginHref = redirect
    ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
    : "/auth/login";

  const status = hasError ? "error" : verified ? "success" : "verifying";

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <AuthBrandPanel
          eyebrow="Issue tracking for product teams"
          title="Plan sprints, track issues and ship on time."
          description="Agile boards, workflows and time tracking — built for teams that move fast."
        />

        <section className="auth-form-panel">
          <div className="auth-form-container" aria-live="polite">
            <AuthMobileLogo />

            {/* Status icon */}

            <div
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]"
              style={{
                backgroundColor:
                  status === "error"
                    ? "var(--color-tag-red-bg)"
                    : status === "success"
                      ? "var(--color-tag-green-bg)"
                      : "var(--color-primary-active-bg)",
              }}
            >
              {status === "verifying" && (
                <LoadingSpinner size="md" tone="primary" />
              )}
              {status === "success" && (
                <CheckCircle2
                  size={24}
                  aria-hidden="true"
                  style={{ color: "var(--color-status-done)" }}
                />
              )}
              {status === "error" && (
                <XCircle
                  size={24}
                  aria-hidden="true"
                  style={{ color: "var(--color-priority-high)" }}
                />
              )}
            </div>

            {/* Heading */}

            <h2 className="auth-title">
              {status === "error"
                ? "Verification failed"
                : status === "success"
                  ? "Email verified"
                  : "Verifying your email"}
            </h2>

            <p
              className="auth-subtitle"
              role={status === "error" ? "alert" : undefined}
              style={
                status === "error"
                  ? { color: "var(--color-tag-red-text)" }
                  : undefined
              }
            >
              {displayMessage}
            </p>

            {status === "verifying" && (
              <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                This only takes a moment. Please keep this page open.
              </p>
            )}

            {/* Actions */}

            {status === "success" && (
              <>
                <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                  Redirecting you to log in…
                </p>

                <Link href={loginHref} className="btn-brand mt-4">
                  Continue to log in
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <p className="mt-6 text-sm text-[var(--color-text-secondary)]">
                  The link may be invalid, expired or already used. If your
                  email is already verified, you can log in.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={loginHref} className="btn-brand sm:flex-1">
                    Go to log in
                  </Link>

                  <Link
                    href={
                      redirect
                        ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
                        : "/auth/register"
                    }
                    // Not .btn-text: a legacy unlayered rule forces it white.
                    className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card-bg)] py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-card-hover)] sm:flex-1"
                  >
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
