"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function UpdateWorkspaceCard() {
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    error: workspaceLoadError,
  } = useQuery<{ workspace: { workspaceName: string } }>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load workspace.");
      }

      return data;
    },
    enabled: Boolean(workspaceId),
  });
  const currentWorkspaceName = workspaceData?.workspace.workspaceName ?? "";
  const inputWorkspaceName = workspaceName ?? currentWorkspaceName;

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    const updatedName = inputWorkspaceName.trim();

    if (!updatedName) {
      setError("Please enter a workspace name.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceName: updatedName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update workspace.");
      }

      setMessage("Workspace name updated successfully.");
      setWorkspaceName(updatedName);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
      ]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="w-full max-w-3xl overflow-hidden rounded-2xl p-0 shadow-sm"
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
              backgroundColor: "var(--color-primary-active-bg)",
              color: "var(--color-primary)",
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
              Update workspace
            </h2>

            <p
              className="mt-1 text-sm leading-6"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Change the name of your workspace to keep your organization
              information up to date.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 p-6">
        {/* Workspace Name */}
        <div>
          <label
            htmlFor="workspaceName"
            className="mb-2 block text-sm font-medium"
            style={{
              color: "var(--color-text-primary)",
            }}
          >
            Workspace name
          </label>

          <input
            id="workspaceName"
            type="text"
            value={inputWorkspaceName}
            disabled={isWorkspaceLoading || Boolean(workspaceLoadError)}
            onChange={(event) => {
              setWorkspaceName(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder={
              isWorkspaceLoading
                ? "Loading workspace name..."
                : "Enter workspace name"
            }
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-app-bg)",
              color: "var(--color-text-primary)",
            }}
          />

          {workspaceLoadError && (
            <p
              role="alert"
              className="mt-2 text-xs"
              style={{ color: "var(--color-tag-red-text)" }}
            >
              {workspaceLoadError instanceof Error
                ? workspaceLoadError.message
                : "Failed to load workspace name."}
            </p>
          )}

          <p
            className="mt-2 text-xs leading-5"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            Choose a clear name that your workspace members will recognize.
          </p>
        </div>

        {/* Feedback */}
        {message && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              border: "1px solid var(--color-tag-green-text)",
              backgroundColor: "var(--color-tag-green-bg)",
            }}
          >
            <span
              className="mt-0.5"
              style={{
                color: "var(--color-status-done)",
              }}
            >
              ✓
            </span>

            <p
              className="text-sm"
              style={{
                color: "var(--color-tag-green-text)",
              }}
            >
              {message}
            </p>
          </div>
        )}

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
            className="hidden text-xs sm:block"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            This will update the name for all workspace members.
          </p>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={
              isLoading || isWorkspaceLoading || Boolean(workspaceLoadError)
            }
            className="ml-auto inline-flex min-w-[150px] items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating...
              </>
            ) : (
              "Update workspace"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
