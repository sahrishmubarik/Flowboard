"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faEnvelopeOpenText,
  faRightFromBracket,
  faTriangleExclamation,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type InvitationPreview = {
  invitation: {
    email: string;
    role: string;
    status: "PENDING" | "ACCEPTED" | "REVOKED";
    isExpired: boolean;
    workspaceName: string | null;
  };
  signedInAs: { email: string; emailVerified: boolean } | null;
  emailMatches: boolean;
  canAccept: boolean;
};

async function postInvitationAction(
  workspaceId: string,
  action: "preview-invitation" | "accept-invitation",
  token: string,
) {
  const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, token }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const workspaceId = params.workspaceId as string;
  const token = searchParams.get("token");

  const [isSwitching, setIsSwitching] = useState(false);

  // Come back to this exact page after signing in or registering.
  const returnUrl = token
    ? `/dashboard/workspace/${workspaceId}/invitation/accept?token=${encodeURIComponent(token)}`
    : "";
  const loginUrl = `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
  const registerUrl = `/auth/register?redirect=${encodeURIComponent(returnUrl)}`;

  const preview = useQuery<InvitationPreview>({
    queryKey: ["invitation-preview", workspaceId, token],
    enabled: !!workspaceId && !!token,
    retry: false,
    queryFn: () =>
      postInvitationAction(workspaceId, "preview-invitation", token as string),
  });

  const accept = useMutation({
    mutationFn: () =>
      postInvitationAction(workspaceId, "accept-invitation", token as string),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      // Short pause so the user sees the confirmation.
      setTimeout(() => {
        router.push(`/dashboard/workspace/${workspaceId}`);
      }, 1200);
    },

    onError: () => {
      // The session or invitation may have changed; show the current state.
      preview.refetch();
    },
  });

  async function handleSwitchAccount() {
    setIsSwitching(true);

    // Clears the session cookie even if the session is already invalid.
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => null);

    router.push(loginUrl);
  }

  const data = preview.data;
  const invitation = data?.invitation;
  const signedInAs = data?.signedInAs;

  let notice: { tone: "info" | "warning" | "error"; text: string } | null =
    null;

  if (!token) {
    notice = { tone: "error", text: "This invitation link is invalid." };
  } else if (preview.isError) {
    notice = { tone: "error", text: preview.error.message };
  } else if (invitation?.status === "ACCEPTED") {
    notice = { tone: "info", text: "This invitation has already been accepted." };
  } else if (invitation?.status === "REVOKED") {
    notice = {
      tone: "error",
      text: "This invitation has been cancelled by the workspace administrator.",
    };
  } else if (invitation?.isExpired) {
    notice = {
      tone: "error",
      text: "This invitation has expired. Ask the workspace admin to send a new one.",
    };
  } else if (data && !signedInAs) {
    notice = {
      tone: "info",
      text: `Sign in or create an account with ${invitation?.email} to accept this invitation.`,
    };
  } else if (data && !data.emailMatches) {
    notice = {
      tone: "warning",
      text: `You are signed in as ${signedInAs?.email}, but this invitation was sent to ${invitation?.email}. Switch to that account to accept it.`,
    };
  } else if (data && !signedInAs?.emailVerified) {
    notice = {
      tone: "warning",
      text: "Please verify your email before accepting this invitation.",
    };
  }

  const isPending =
    invitation?.status === "PENDING" && !invitation.isExpired;

  // Theme-aware styles, using the same tokens as the rest of Flowboard.
  const noticeStyles = {
    info: {
      box: "border-[var(--color-tag-blue-text)]/30 bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]",
      icon: faCircleInfo,
    },
    warning: {
      box: "border-[var(--color-priority-medium)]/50 bg-[var(--color-priority-medium)]/10 text-[var(--color-text-primary)]",
      icon: faTriangleExclamation,
    },
    error: {
      box: "border-[var(--color-tag-red-text)]/30 bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]",
      icon: faCircleXmark,
    },
  };

  const status = !invitation
    ? null
    : invitation.status === "ACCEPTED"
      ? { label: "Accepted", className: "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]" }
      : invitation.status === "REVOKED"
        ? { label: "Revoked", className: "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]" }
        : invitation.isExpired
          ? { label: "Expired", className: "bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)]" }
          : { label: "Pending", className: "bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]" };

  const primaryButton =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-50";
  const secondaryButton =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-card-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-app-bg)] px-4 py-10 sm:px-6">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faEnvelopeOpenText} className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Workspace invitation
                </h1>

                {status && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                {invitation?.workspaceName ? (
                  <>
                    You&apos;ve been invited to join{" "}
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {invitation.workspaceName}
                    </span>{" "}
                    as{" "}
                    <span className="font-medium capitalize text-[var(--color-text-primary)]">
                      {invitation.role}
                    </span>
                    .
                  </>
                ) : (
                  "You've been invited to join a Flowboard workspace."
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {/* Loading */}
          {preview.isLoading && (
            <div
              className="flex items-center justify-center gap-3 py-4 text-sm text-[var(--color-text-secondary)]"
              role="status"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
              Checking your invitation...
            </div>
          )}

          {/* Accounts */}
          {invitation && (
            <dl className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] text-sm">
              <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <dt className="text-[var(--color-text-muted)]">Invitation sent to</dt>
                <dd className="break-all font-medium text-[var(--color-text-primary)] sm:text-right">
                  {invitation.email}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <dt className="text-[var(--color-text-muted)]">Signed in as</dt>
                <dd className="flex items-center gap-1.5 break-all font-medium text-[var(--color-text-primary)] sm:justify-end sm:text-right">
                  {signedInAs ? (
                    <>
                      {data?.emailMatches && (
                        <FontAwesomeIcon
                          icon={faUserCheck}
                          className="h-3.5 w-3.5 shrink-0 text-[var(--color-status-done)]"
                          aria-hidden
                        />
                      )}
                      {signedInAs.email}
                    </>
                  ) : (
                    <span className="font-normal text-[var(--color-text-muted)]">
                      Not signed in
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          )}

          {/* Guidance / problem */}
          {notice && !accept.isSuccess && (
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${noticeStyles[notice.tone].box}`}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              <FontAwesomeIcon
                icon={noticeStyles[notice.tone].icon}
                className="mt-1 h-4 w-4 shrink-0"
                aria-hidden
              />
              <p>{notice.text}</p>
            </div>
          )}

          {/* Accept failed */}
          {accept.isError && (
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${noticeStyles.error.box}`}
              role="alert"
            >
              <FontAwesomeIcon icon={faCircleXmark} className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              <p>{accept.error.message}</p>
            </div>
          )}

          {/* Accepted */}
          {accept.isSuccess && (
            <div
              className="flex items-start gap-3 rounded-xl border border-[var(--color-tag-green-text)]/30 bg-[var(--color-tag-green-bg)] px-4 py-3 text-sm leading-6 text-[var(--color-tag-green-text)]"
              role="status"
            >
              <FontAwesomeIcon icon={faCircleCheck} className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              <p>Invitation accepted. Taking you to the workspace...</p>
            </div>
          )}

          {/* Actions */}
          {data && isPending && !signedInAs && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push(loginUrl)}
                className={primaryButton}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => router.push(registerUrl)}
                className={secondaryButton}
              >
                Create an account
              </button>
            </div>
          )}

          {data && isPending && signedInAs && !data.emailMatches && (
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isSwitching}
              className={primaryButton}
            >
              {isSwitching ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing out...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" aria-hidden />
                  Sign out and switch account
                </>
              )}
            </button>
          )}

          {data?.canAccept && !accept.isSuccess && (
            <button
              type="button"
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
              className={primaryButton}
            >
              {accept.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Accepting...
                </>
              ) : (
                "Accept invitation"
              )}
            </button>
          )}

          {invitation && !isPending && !accept.isSuccess && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={`${secondaryButton} cursor-pointer`}
            >
              Go to dashboard
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
