"use client";

import { useQuery } from "@tanstack/react-query";

type WorkspaceResponse = {
  message: string;
  workspace: {
    workspaceId: string;
    workspaceName: string;
    role: "owner" | "admin" | "manager" | "member";
    createdAt: string;
  }[];
  stats: {
    organizations: number;
    members: number;
  };
};
export default function DashboardOverviewStats() {
     const { data, isLoading, isError } =
    useQuery<WorkspaceResponse>({
      queryKey: ["workspaces"],
      queryFn: async () => {
        const response = await fetch("/api/workspace");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch workspaces",
          );
        }

        return result;
      },
    });

  const organizations =
    data?.stats.organizations ?? 0;

  const members =
    data?.stats.members ?? 0;

  const stats = [
    {
      label: "Organizations",
      value: organizations,
      description: "You're a member of",
    },
    {
      label: "Members",
      value: members,
      description: "Across your organizations",
    },
    {
      label: "Boards",
      value: 0,
      description: "Across your organizations",
    },
    {
      label: "Tasks",
      value: 0,
      description: "Total tasks",
    },
  ];
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-[var(--ink)]">
          Overview
        </h2>

        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          A quick look at your organization spaces.
        </p>
      </div>


    <section>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
  {stats.map((stat) => (
    <div
      key={stat.label}
      className="
        rounded-2xl
        border border-[var(--board-ink)]/10
        bg-[var(--paper)]
        p-5
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:border-[var(--indigo)]/50
        hover:shadow-lg
        hover:shadow-[var(--indigo)]/10
      "
    >
      <p className="text-sm text-[var(--board-ink)]/60">
        {stat.label}
      </p>

      <p className="mt-2 text-3xl font-semibold">
        {isLoading &&
        (stat.label === "Organizations" ||
          stat.label === "Members")
          ? "..."
          : stat.value}
      </p>

      <p className="mt-1 text-xs text-[var(--board-ink)]/50">
        {stat.description}
      </p>
    </div>
  ))}
</div>

      {isError && (
        <p className="mt-3 text-sm text-red-500">
          Failed to load dashboard stats.
        </p>
      )}
    </section>

    </section>
  );
}