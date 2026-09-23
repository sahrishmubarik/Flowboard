"use client";

import { useQuery } from "@tanstack/react-query";

type Workspace = {
  workspaceId: string;
  workspaceName: string;
  role: "owner" | "admin" | "manager" | "member";
  createdAt: string;
};

type WorkspaceResponse = {
  message: string;
  workspace: Workspace[];
  stats: {
    organizations: number;
    members: number;
  };
};

export default function DashboardStats() {
  const { data, isLoading, isError } =
    useQuery<WorkspaceResponse>({
      queryKey: ["workspaces"],
      queryFn: async () => {
        const response = await fetch("/api/workspace");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch workspace data",
          );
        }

        return result;
      },
    });

  const organizations =
    data?.stats?.organizations ?? 0;

  const members =
    data?.stats?.members ?? 0;

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Organizations */}
        <div
          className="
            rounded-2xl
            border border-[var(--board-ink)]/10
            bg-[var(--paper)]
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
             hover:border-[var(--board-panel)]/40
            hover:shadow-lg
            hover:shadow-[var(--board-panel)]/10
          "
        >
          <p className="text-sm text-[var(--board-ink)]/60">
            Organizations
          </p>

          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {isLoading ? "..." : organizations}
          </p>

          <p className="mt-1 text-xs text-[var(--board-ink)]/50">
            You're a member of
          </p>
        </div>

        {/* Members */}
        <div
          className="
            rounded-2xl
            border border-[var(--board-ink)]/10
            bg-[var(--paper)]
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
          hover:border-[var(--board-panel)]/40
            hover:shadow-lg
            hover:shadow-[var(--board-panel)]/10
          "
        >
          <p className="text-sm text-[var(--board-ink)]/60">
            Members
          </p>

          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {isLoading ? "..." : members}
          </p>

          <p className="mt-1 text-xs text-[var(--board-ink)]/50">
            Across your organizations
          </p>
        </div>

        {/* Boards */}
        <div
          className="
            rounded-2xl
            border border-[var(--board-ink)]/10
            bg-[var(--paper)]
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-[var(--board-panel)]/40
            hover:shadow-lg
            hover:shadow-[var(--board-panel)]/10
          "
        >
          <p className="text-sm text-[var(--board-ink)]/60">
            Boards
          </p>

          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            0
          </p>

          <p className="mt-1 text-xs text-[var(--board-ink)]/50">
            Across your organizations
          </p>
        </div>

        {/* Tasks */}
        <div
          className="
            rounded-2xl
            border border-[var(--board-ink)]/10
            bg-[var(--paper)]
            p-5
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-[var(--board-panel)]/40
            hover:shadow-lg
            hover:shadow-[var(--board-panel)]/10
          "
        >
          <p className="text-sm text-[var(--board-ink)]/60">
            Tasks
          </p>

          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            0
          </p>

          <p className="mt-1 text-xs text-[var(--board-ink)]/50">
            Total tasks
          </p>
        </div>

      </div>

      {isError && (
        <p className="mt-3 text-sm text-red-500">
          Failed to load dashboard statistics.
        </p>
      )}
    </section>
  );
}