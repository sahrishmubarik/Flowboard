// // "use client";

// // import { KanbanSquare, Users, CheckSquare, Mail } from "lucide-react";

// // type WorkspaceStatsProps = {
// //   boardCount: number;
// //   memberCount?: number;
// //   taskCount?: number;
// //   invitationCount?: number;
// // };

// // export default function WorkspaceStats({
// //   boardCount,
// //   memberCount = 0,
// //   taskCount = 0,
// //   invitationCount = 0,
// // }: WorkspaceStatsProps) {
// //   const stats = [
// //     {
// //       label: "Boards",
// //       value: boardCount,
// //       description: "Active boards",
// //       icon: KanbanSquare,
// //     },
// //     {
// //       label: "Members",
// //       value: memberCount,
// //       description: "Workspace members",
// //       icon: Users,
// //     },
// //     {
// //       label: "Tasks",
// //       value: taskCount,
// //       description: "Tracked tasks",
// //       icon: CheckSquare,
// //     },
// //     {
// //       label: "Invitations",
// //       value: invitationCount,
// //       description: "Pending invitations",
// //       icon: Mail,
// //     },
// //   ];

// //   return (
// //     <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
// //       {stats.map((stat) => {
// //         const Icon = stat.icon;

// //         return (
// //           <div
// //             key={stat.label}
// //             className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--indigo)]/20 hover:shadow-[0_12px_30px_rgba(27,30,42,0.06)]"
// //           >
// //             <div className="flex items-start justify-between">
// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
// //                   {stat.label}
// //                 </p>

// //                 <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ink)]">
// //                   {stat.value}
// //                 </p>
// //               </div>

// //               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--indigo)]/10 text-[var(--indigo)] transition group-hover:bg-[var(--indigo)] group-hover:text-white">
// //                 <Icon size={18} strokeWidth={1.8} />
// //               </div>
// //             </div>

// //             <p className="mt-3 text-xs text-[var(--ink-soft)]">
// //               {stat.description}
// //             </p>
// //           </div>
// //         );
// //       })}
// //     </section>
// //   );
// // }

// "use client";

// import { useQuery } from "@tanstack/react-query";
// import {
//   KanbanSquare,
//   Users,
//   CheckSquare,
//   Clock3,
//   ArrowUpRight,
// } from "lucide-react";

// type WorkspaceStatsProps = {
//   workspaceId: string;
// };

// type Board = {
//   id: string;
//   boardName: string;
//   organizationId: string;
//   createdBy: string;
//   createdAt: string;
//   role: "admin" | "owner" | "member" | "manager";
// };

// type MembersResponse = {
//   members: unknown[];
//   pagination?: {
//     total: number;
//   };
// };

// type BoardsResponse = {
//   message: string;
//   boards: Board[];
// };

// export default function WorkspaceStats({ workspaceId }: WorkspaceStatsProps) {
//   const { data: boardsData, isLoading: boardsLoading } =
//     useQuery<BoardsResponse>({
//       queryKey: ["workspace-boards", workspaceId],
//       queryFn: async () => {
//         const response = await fetch(`/api/workspace/${workspaceId}/board`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch workspace boards");
//         }

//         return response.json();
//       },
//       enabled: Boolean(workspaceId),
//     });

//   const { data: membersData, isLoading: membersLoading } =
//     useQuery<MembersResponse>({
//       queryKey: ["workspace-members", workspaceId],
//       queryFn: async () => {
//         const response = await fetch(
//           `/api/workspace/${workspaceId}/members?page=1&limit=1`,
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch workspace members");
//         }

//         return response.json();
//       },
//       enabled: Boolean(workspaceId),
//     });

//   const boardCount = boardsData?.boards?.length ?? 0;

//   const memberCount =
//     membersData?.pagination?.total ?? membersData?.members?.length ?? 0;

//   // Static until task/time APIs are available
//   const completedTasks = 18;
//   const totalTasks = 25;

//   const loggedHours = 26;
//   const plannedHours = 40;

//   const taskProgress =
//     totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

//   const timeProgress =
//     plannedHours > 0 ? Math.round((loggedHours / plannedHours) * 100) : 0;

//   const stats = [
//     {
//       label: "Boards",
//       value: boardsLoading ? "—" : boardCount,
//       context:
//         boardCount === 1 ? "1 active board" : `${boardCount} active boards`,
//       icon: KanbanSquare,

//       // Indigo
//       valueClass: "text-[var(--indigo)]",
//       labelClass: "text-[var(--indigo)]/70",
//       contextClass: "text-[var(--indigo)]/75",
//       iconClass: "bg-[var(--indigo)]/10 text-[var(--indigo)]",
//       iconHoverClass: "group-hover:bg-[var(--indigo)] group-hover:text-white",
//       accentClass: "bg-[var(--indigo)]",
//       progressClass: "bg-[var(--indigo)]",
//     },

//     {
//       label: "Members",
//       value: membersLoading ? "—" : memberCount,
//       context:
//         memberCount === 1
//           ? "1 workspace member"
//           : `${memberCount} workspace members`,
//       icon: Users,

//       // Blue
//       valueClass: "text-[#356D8C]",
//       labelClass: "text-[#356D8C]/70",
//       contextClass: "text-[#356D8C]/75",
//       iconClass: "bg-[#356D8C]/10 text-[#356D8C]",
//       iconHoverClass: "group-hover:bg-[#356D8C] group-hover:text-white",
//       accentClass: "bg-[#356D8C]",
//       progressClass: "bg-[#356D8C]",
//     },

//     {
//       label: "Tasks",
//       value: `${taskProgress}%`,
//       context: `${completedTasks} of ${totalTasks} tasks completed`,
//       icon: CheckSquare,
//       progress: taskProgress,

//       // Green
//       valueClass: "text-[#4E8B5F]",
//       labelClass: "text-[#4E8B5F]/70",
//       contextClass: "text-[#4E8B5F]/80",
//       iconClass: "bg-[#4E8B5F]/10 text-[#4E8B5F]",
//       iconHoverClass: "group-hover:bg-[#4E8B5F] group-hover:text-white",
//       accentClass: "bg-[#4E8B5F]",
//       progressClass: "bg-[#4E8B5F]",
//     },

//     {
//       label: "Time logged",
//       value: `${loggedHours}h`,
//       context: `${plannedHours}h planned this week`,
//       icon: Clock3,
//       progress: timeProgress,

//       // Amber
//       valueClass: "text-[#C47E20]",
//       labelClass: "text-[#C47E20]/70",
//       contextClass: "text-[#B97820]/85",
//       iconClass: "bg-[#E8A33D]/15 text-[#B97820]",
//       iconHoverClass: "group-hover:bg-[#E8A33D] group-hover:text-white",
//       accentClass: "bg-[#E8A33D]",
//       progressClass: "bg-[#E8A33D]",
//     },
//   ];

//   return (
//     <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       {stats.map((stat) => {
//         const Icon = stat.icon;

//         return (
//           <div
//             key={stat.label}
//             className="group relative overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(27,30,42,0.08)]"
//           >
//             {/* Top color line */}
//             <div
//               className={`absolute inset-x-0 top-0 h-[3px] ${stat.accentClass} opacity-70 transition-opacity duration-200 group-hover:opacity-100`}
//             />

//             {/* Header */}
//             <div className="flex items-start justify-between">
//               <div>
//                 <p
//                   className={`text-[11px] font-bold uppercase tracking-[0.15em] ${stat.labelClass}`}
//                 >
//                   {stat.label}
//                 </p>

//                 <p
//                   className={`mt-3 text-[32px] text-black font-bold leading-none tracking-[-0.04em] ${stat.valueClass}`}
//                 >
//                   {stat.value}
//                 </p>
//               </div>

//               <div
//                 className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${stat.iconClass} ${stat.iconHoverClass}`}
//               >
//                 <Icon size={19} strokeWidth={1.9} />
//               </div>
//             </div>

//             {/* Bottom information */}
//             <div className="mt-6">
//               <div className="flex items-center justify-between gap-3">
//                 <p className={`text-xs font-medium ${stat.contextClass}`}>
//                   {stat.context}
//                 </p>

//                 <ArrowUpRight
//                   size={15}
//                   className={`${stat.valueClass} shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100`}
//                 />
//               </div>

//               {/* Progress */}
//               {stat.progress !== undefined && (
//                 <div className="mt-4">
//                   <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
//                     <div
//                       className={`h-full rounded-full ${stat.progressClass}  text-black transition-all duration-700`}
//                       style={{
//                         width: `${stat.progress}%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </section>
//   );
// }

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  KanbanSquare,
  Users,
  CheckSquare,
  Clock3,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type WorkspaceStatsProps = {
  workspaceId: string;
};

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  role: "admin" | "owner" | "member" | "manager";
};

type MembersResponse = {
  members: unknown[];
  pagination?: {
    total: number;
  };
};

type BoardsResponse = {
  message: string;
  boards: Board[];
};

type BoardStatsResponse = {
  message: string;
  stats: {
    totalCards: number;
    completedCards: number;
  };
};

// Fixed working-time capacity shown in the "Time logged" box.
const HOURS_PER_DAY_PER_MEMBER = 8;
const WORK_DAYS_PER_WEEK = 5;
const HOURS_PER_WEEK = HOURS_PER_DAY_PER_MEMBER * WORK_DAYS_PER_WEEK;

type Stat = {
  label: string;
  value: ReactNode;
  valueSuffix?: string;
  isLoading?: boolean;
  context: string;
  icon: LucideIcon;
  // Colour token for the top accent, icon and progress bar.
  accent: string;
  // Only cards with a real destination are links.
  href?: string;
  progress?: number;
};

function percentOf(part: number, whole: number) {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;
}

export default function WorkspaceStats({ workspaceId }: WorkspaceStatsProps) {
  const { data: boardsData, isLoading: boardsLoading } =
    useQuery<BoardsResponse>({
      queryKey: ["workspace-boards", workspaceId],

      queryFn: async () => {
        const response = await fetch(`/api/workspace/${workspaceId}/board`);

        if (!response.ok) {
          throw new Error("Failed to fetch workspace boards");
        }

        return response.json();
      },

      enabled: Boolean(workspaceId),
    });

  const { data: membersData, isLoading: membersLoading } =
    useQuery<MembersResponse>({
      queryKey: ["workspace-members", workspaceId],

      queryFn: async () => {
        const response = await fetch(
          `/api/workspace/${workspaceId}/members?page=1&limit=1`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch workspace members");
        }

        return response.json();
      },

      enabled: Boolean(workspaceId),
    });

  const boardCount = boardsData?.boards?.length ?? 0;

  // The first board (oldest) is the workspace's default board, matching the
  // activity page and the Active sprints card.
  const defaultBoard = boardsData?.boards?.[0];

  const {
    data: boardStatsData,
    isLoading: boardStatsLoading,
    isError: boardStatsError,
  } = useQuery<BoardStatsResponse>({
    queryKey: ["board-stats", workspaceId, defaultBoard?.id],

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${defaultBoard?.id}/stats`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch board stats");
      }

      return data;
    },

    enabled: Boolean(workspaceId && defaultBoard?.id),
  });

  const memberCount =
    membersData?.pagination?.total ?? membersData?.members?.length ?? 0;

  const boardStats = boardStatsData?.stats;
  const isStatsPending =
    boardsLoading || (Boolean(defaultBoard) && boardStatsLoading);

  const completedTasks = boardStats?.completedCards ?? 0;
  const totalTasks = boardStats?.totalCards ?? 0;
  const taskProgress = percentOf(completedTasks, totalTasks);

  // Shared context line when the default board has no stats to show.
  const unavailableContext = !defaultBoard
    ? "No boards yet"
    : boardStatsError
      ? "Failed to load board stats"
      : null;

  const stats: Stat[] = [
    {
      label: "Boards",
      value: boardCount,
      isLoading: boardsLoading,
      context:
        boardCount === 1 ? "1 active board" : `${boardCount} active boards`,
      icon: KanbanSquare,
      accent: "var(--color-primary)",
    },

    {
      label: "Members",
      value: memberCount,
      isLoading: membersLoading,
      context:
        memberCount === 1
          ? "1 workspace member"
          : `${memberCount} workspace members`,
      icon: Users,
      accent: "var(--color-status-progress)",
      href: `/dashboard/workspace/${workspaceId}/member`,
    },

    {
      label: "Tasks",
      value: unavailableContext ? "—" : `${taskProgress}%`,
      isLoading: isStatsPending,
      context:
        unavailableContext ??
        (isStatsPending
          ? "Loading tasks..."
          : `${completedTasks} of ${totalTasks} tasks completed`),
      icon: CheckSquare,
      accent: "var(--color-status-done)",
      // The counts come from the default board, so that is where it leads.
      href: defaultBoard
        ? `/dashboard/workspace/${workspaceId}/board/${defaultBoard.id}`
        : undefined,
      progress: unavailableContext ? undefined : taskProgress,
    },

    {
      label: "Time logged",
      value: `${HOURS_PER_WEEK}h`,
      valueSuffix: " / week",
      context: `${HOURS_PER_DAY_PER_MEMBER}h per day per member`,
      icon: Clock3,
      accent: "var(--color-priority-medium)",
    },
  ];

  return (
    <section
      aria-label="Workspace summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        const content = (
          <>
            {/* Top accent */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: stat.accent }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {stat.label}
                </p>

                {stat.isLoading ? (
                  <span className="mt-3 block h-[30px] w-16 animate-pulse rounded bg-[var(--color-border)]" />
                ) : (
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                    {stat.value}
                    {stat.valueSuffix && (
                      <span className="text-base font-medium tracking-normal text-[var(--color-text-muted)]">
                        {stat.valueSuffix}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
                style={{
                  color: stat.accent,
                  backgroundColor: `color-mix(in srgb, ${stat.accent} 14%, transparent)`,
                }}
              >
                <Icon size={18} strokeWidth={1.9} />
              </span>
            </div>

            <div className="mt-auto pt-5">
              <div className="flex items-center justify-between gap-3">
                <p
                  title={stat.context}
                  className="min-w-0 truncate text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  {stat.context}
                </p>

                {stat.href && (
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--color-text-muted)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                )}
              </div>

              {stat.progress !== undefined && !stat.isLoading && (
                <div
                  role="progressbar"
                  aria-label={`${stat.label} completed`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stat.progress}
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-column-bg)]"
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${stat.progress}%`,
                      backgroundColor: stat.accent,
                    }}
                  />
                </div>
              )}
            </div>
          </>
        );

        const cardClass =
          "group relative flex min-h-[148px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 shadow-[var(--shadow-sm)]";

        return stat.href ? (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${cardClass} transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]`}
          >
            {content}
          </Link>
        ) : (
          <div key={stat.label} className={cardClass}>
            {content}
          </div>
        );
      })}
    </section>
  );
}
