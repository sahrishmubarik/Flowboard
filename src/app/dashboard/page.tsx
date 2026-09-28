"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CirclePlus,
  FolderKanban,
  LayoutDashboard,
  Users,
} from "lucide-react";

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

const workflow = [
  {
    number: "01",
    icon: CirclePlus,
    title: "Create a workspace",
    description:
      "Start by creating a workspace for your team, product, or project. It becomes the central place for everything you manage.",
  },
  {
    number: "02",
    icon: Users,
    title: "Build your team",
    description:
      "Invite teammates and assign roles so everyone knows what they can access and manage inside the workspace.",
  },
  {
    number: "03",
    icon: FolderKanban,
    title: "Create your boards",
    description:
      "Organize your work into boards. Use them for projects, products, campaigns, or any workflow your team follows.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Track the work",
    description:
      "Keep an eye on issues, progress, activity, and tasks from one connected place as your workspace grows.",
  },
];

const managementItems = [
  {
    title: "Team members",
    description:
      "Invite people, manage membership, and control workspace roles.",
  },
  {
    title: "Boards",
    description:
      "Create focused boards for projects and organize your team's work.",
  },
  {
    title: "Issues & tasks",
    description:
      "Capture work, track progress, and keep important items visible.",
  },
  {
    title: "Activity & progress",
    description:
      "Keep track of what's happening and understand how your work is moving.",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<WorkspaceResponse>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspaces");
      }

      return data;
    },
  });

  useEffect(() => {
    if (isLoading || isError) return;

    const workspaces = data?.workspace ?? [];

    if (workspaces.length === 0) {
      return;
    }

    const defaultWorkspace = workspaces[0];

    router.replace(`/dashboard/workspace/${defaultWorkspace.workspaceId}`);
  }, [data, isLoading, isError, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--paper-raised)]">
        <div className="mx-auto max-w-[1160px] px-6 py-10 md:px-10 md:py-14">
          <div className="animate-pulse space-y-8">
            <div className="h-[350px] rounded-3xl bg-[var(--mist)]" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 rounded-2xl bg-[var(--mist)]" />
              <div className="h-40 rounded-2xl bg-[var(--mist)]" />
              <div className="h-40 rounded-2xl bg-[var(--mist)]" />
              <div className="h-40 rounded-2xl bg-[var(--mist)]" />
            </div>

            <div className="h-64 rounded-2xl bg-[var(--mist)]" />
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper-raised)] px-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.06] px-6 py-5">
          <p className="text-sm font-semibold text-[var(--coral)]">
            We couldn't load your workspaces.
          </p>

          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  const workspaces = data?.workspace ?? [];

  if (workspaces.length > 0) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--paper-raised)]">
      <div className="mx-auto max-w-[1160px] px-6 py-10 md:px-10 md:py-14">
        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-3xl border border-[var(--mist)] bg-[var(--paper)]">
          {/* Subtle decoration */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--indigo)]/[0.045]" />

          <div className="relative px-7 py-10 md:px-10 md:py-12 lg:px-12 lg:py-14">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--indigo)]/15 bg-[var(--indigo)]/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--indigo)]" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--indigo)]">
                  Getting started
                </span>
              </div>

              <h1
                className="max-w-2xl text-[25px] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink)] md:text-[46px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                A clear place to organize
                <span className="block">your team's work.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-[12px] leading-7 text-[var(--ink-soft)] md:text-base">
                Flowboard brings your workspace, people, boards, issues, and
                tasks into one connected place. Create your first workspace and
                start building your workflow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/dashboard/workspace/create-workspace")
                  }
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--board-ink)] hover:shadow-md"
                >
                  Create your first workspace
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>

                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-5 py-3 text-sm text-[var(--ink-soft)]">
                  <CheckCircle2 size={15} className="text-[var(--indigo)]" />
                  Takes less than a minute
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW FLOWBOARD WORKS */}
        {/* ========================================================= */}

        <section className="mt-14">
          <div className="mb-7 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              How Flowboard works
            </p>

            <h2
              className="mt-2 text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start small. Build your workflow.
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Your workspace is the foundation. Add your team, create boards,
              and organize the work around the way your team operates.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--indigo)]/20 hover:shadow-[0_10px_30px_rgba(20,23,42,0.06)]"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.07] text-[var(--indigo)] transition-colors duration-200 group-hover:bg-[var(--indigo)]/[0.11]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-soft)]">
                          {item.number}
                        </span>

                        <h3 className="text-[15px] font-semibold text-[var(--ink)]">
                          {item.title}
                        </h3>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* WORKSPACE */}
        {/* ========================================================= */}

        <section className="mt-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--board-panel)] text-white">
                <LayoutDashboard size={17} strokeWidth={1.8} />
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Your workspace
              </p>

              <h2
                className="mt-2 text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Everything has a place.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                Once your workspace is created, you can manage your team and
                work from one place instead of jumping between disconnected
                tools.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {managementItems.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--board-line)]/20 hover:bg-[var(--paper-raised)] hover:shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--board-panel)] text-white">
                      <CheckCircle2 size={15} strokeWidth={1.8} />
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-[var(--ink-soft)]/40 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--ink)]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL CTA */}
        {/* ========================================================= */}

        <section className="mt-14 overflow-hidden rounded-2xl border border-[var(--board-line)] bg-[var(--board-panel)]">
          <div className="flex flex-col gap-6 px-7 py-7 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Your next step
              </p>

              <h2
                className="mt-2 text-2xl font-medium tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Create your first workspace.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                Give your workspace a name, invite your team, and start creating
                boards for the work that matters.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/workspace/create-workspace")
              }
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-[var(--board-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--paper)] hover:shadow-md"
            >
              Create workspace
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </section>

        {/* Footer note */}
        <div className="py-8 text-center">
          <p className="text-xs text-[var(--ink-soft)]">
            You can create additional workspaces later from the dashboard
            sidebar.
          </p>
        </div>
      </div>
    </main>
  );
}
