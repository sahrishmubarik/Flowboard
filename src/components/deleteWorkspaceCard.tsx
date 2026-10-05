"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DeleteWorkspaceCard() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();
  const router = useRouter();

  const workspaceId = params.workspaceId as string;

  const handleDelete = async () => {
    if (!confirmed) {
      setError(
        "Please confirm that you want to permanently delete this workspace.",
      );
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete workspace.");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("DELETE_WORKSPACE_ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Failed to delete workspace.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-sm"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-card-bg)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "var(--color-tag-red-bg)",
              color: "var(--color-priority-high)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </div>

          <div>
            <h2
              className="text-xl font-medium tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Delete workspace
            </h2>

            <p
              className="mt-1 text-sm leading-6"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Permanently remove this workspace and its associated organization
              data.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Warning */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-4"
          style={{
            border: "1px solid var(--color-tag-red-text)",
            backgroundColor: "var(--color-tag-red-bg)",
          }}
        >
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor: "var(--color-priority-high)",
            }}
          >
            !
          </div>

          <div>
            <p
              className="text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              This action cannot be undone.
            </p>

            <p
              className="mt-1 text-xs leading-5"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Deleting this workspace may permanently remove its members,
              invitations, boards, and other associated data.
            </p>
          </div>
        </div>

        {/* Confirmation */}
        <label
          className="flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-app-bg)",
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => {
              setConfirmed(event.target.checked);
              setError("");
            }}
            className="mt-0.5 h-4 w-4 rounded"
            style={{
              accentColor: "var(--color-primary)",
            }}
          />

          <span>
            <span
              className="block text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              I understand that this action is permanent.
            </span>

            <span
              className="mt-1 block text-xs leading-5"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Please confirm before deleting the workspace.
            </span>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              border: "1px solid var(--color-tag-red-text)",
              backgroundColor: "var(--color-tag-red-bg)",
            }}
          >
            <span
              className="mt-0.5"
              style={{
                color: "var(--color-priority-high)",
              }}
            >
              !
            </span>

            <p
              className="text-sm"
              style={{
                color: "var(--color-tag-red-text)",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Action */}
        <div
          className="flex items-center justify-between gap-4 pt-5"
          style={{
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <p
            className="hidden text-xs leading-5 sm:block"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            Make sure you no longer need this workspace before continuing.
          </p>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || !confirmed}
            className="ml-auto inline-flex min-w-[160px] items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: "var(--color-priority-high)",
            }}
          >
            {isDeleting ? (
              <>
                <span
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    borderTopColor: "#ffffff",
                  }}
                />
                Deleting...
              </>
            ) : (
              "Delete workspace"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
