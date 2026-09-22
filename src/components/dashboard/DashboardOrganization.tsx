"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import DashboardGettingStarted from "@/components/dashboard/GetStarted";
import DashboardRecentActivity from "@/components/dashboard/RecentActivity";
type Workspace = {
  workspaceId: string;
  workspaceName: string;
  role: "owner" | "admin" | "manager" | "member";
  createdAt: string;
};

type WorkspaceResponse = {
  message: string;
  workspace: Workspace[];
};

export default function DashboardOrganizations() {
  const { data, isLoading, isError } = useQuery<WorkspaceResponse>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch organizations"
        );
      }

      return data;
    },
  });

  const organizations = data?.workspace ?? [];

  return (
    <>
      {/* Organizations header */}
      

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[128px] animate-pulse rounded-xl bg-[var(--mist)]"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="mt-6 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-5 py-4">
          <p className="text-sm text-[var(--coral)]">
            Failed to load your organizations.
          </p>
        </div>
      )}

      {/* Organizations */}
      {!isLoading && !isError && organizations.length > 0 && (
     <div>
           <div className="mt-12 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[var(--ink)]">
          Your Organization Spaces
        </h2>

        <Link
          href="/dashboard/workspace/create-workspace"
          className="rounded-[7px] bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
        >
          New organization
        </Link>
      </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {organizations.map((organization) => (
            <Link
              key={organization.workspaceId}
              href={`/dashboard/workspace/${organization.workspaceId}`}
              className="group overflow-hidden rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] transition-shadow hover:shadow-lg"
            >
              <div
                className="h-20 w-full transition-transform duration-300 group-hover:scale-[1.03]"
                style={{
                  backgroundColor: "var(--indigo)",
                }}
              />

              <div className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-[var(--ink)]">
                      {organization.workspaceName}
                    </p>

                    <p className="mt-1 text-[13px] capitalize text-[var(--ink-soft)]">
                      {organization.role}
                    </p>
                  </div>

                  <span className="text-[var(--ink-soft)] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Create organization */}
          <Link
            href="/dashboard/workspace/create-workspace"
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--mist)] text-[var(--ink-soft)] transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
          >
            <span className="text-2xl leading-none">+</span>

            <span className="text-sm font-medium">
              Create new organization
            </span>
          </Link>
        </div>


<DashboardRecentActivity/>

<DashboardGettingStarted/>
     </div>
     

      )}

      {/* No organizations */}
      {!isLoading && !isError && organizations.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--mist)] bg-[var(--paper-raised)] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mist)] text-2xl text-[var(--ink-soft)]">
            +
          </div>

          <h3 className="mt-4 text-base font-medium text-[var(--ink)]">
            No organizations yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
            You are not a member of any organization yet. Create your own
            organization to get started.
          </p>

          <Link
            href="/dashboard/workspace/create-workspace"
            className="mt-5 inline-flex rounded-[7px] bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            Create new organization
          </Link>
        </div>
      )}
    </>
  );
}