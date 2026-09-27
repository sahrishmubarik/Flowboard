// "use client";

// import { KanbanSquare, Users, CheckSquare, Mail } from "lucide-react";

// type WorkspaceStatsProps = {
//   boardCount: number;
//   memberCount?: number;
//   taskCount?: number;
//   invitationCount?: number;
// };

// export default function WorkspaceStats({
//   boardCount,
//   memberCount = 0,
//   taskCount = 0,
//   invitationCount = 0,
// }: WorkspaceStatsProps) {
//   const stats = [
//     {
//       label: "Boards",
//       value: boardCount,
//       description: "Active boards",
//       icon: KanbanSquare,
//     },
//     {
//       label: "Members",
//       value: memberCount,
//       description: "Workspace members",
//       icon: Users,
//     },
//     {
//       label: "Tasks",
//       value: taskCount,
//       description: "Tracked tasks",
//       icon: CheckSquare,
//     },
//     {
//       label: "Invitations",
//       value: invitationCount,
//       description: "Pending invitations",
//       icon: Mail,
//     },
//   ];

//   return (
//     <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       {stats.map((stat) => {
//         const Icon = stat.icon;

//         return (
//           <div
//             key={stat.label}
//             className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--indigo)]/20 hover:shadow-[0_12px_30px_rgba(27,30,42,0.06)]"
//           >
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
//                   {stat.label}
//                 </p>

//                 <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--ink)]">
//                   {stat.value}
//                 </p>
//               </div>

//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--indigo)]/10 text-[var(--indigo)] transition group-hover:bg-[var(--indigo)] group-hover:text-white">
//                 <Icon size={18} strokeWidth={1.8} />
//               </div>
//             </div>

//             <p className="mt-3 text-xs text-[var(--ink-soft)]">
//               {stat.description}
//             </p>
//           </div>
//         );
//       })}
//     </section>
//   );
// }

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  KanbanSquare,
  Users,
  CheckSquare,
  Clock3,
  ArrowUpRight,
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

  const memberCount =
    membersData?.pagination?.total ?? membersData?.members?.length ?? 0;

  // Static until task/time APIs are available
  const completedTasks = 18;
  const totalTasks = 25;

  const loggedHours = 26;
  const plannedHours = 40;

  const taskProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const timeProgress =
    plannedHours > 0 ? Math.round((loggedHours / plannedHours) * 100) : 0;

  const stats = [
    {
      label: "Boards",
      value: boardsLoading ? "—" : boardCount,
      context:
        boardCount === 1 ? "1 active board" : `${boardCount} active boards`,
      icon: KanbanSquare,

      // Indigo
      valueClass: "text-[var(--indigo)]",
      labelClass: "text-[var(--indigo)]/70",
      contextClass: "text-[var(--indigo)]/75",
      iconClass: "bg-[var(--indigo)]/10 text-[var(--indigo)]",
      iconHoverClass: "group-hover:bg-[var(--indigo)] group-hover:text-white",
      accentClass: "bg-[var(--indigo)]",
      progressClass: "bg-[var(--indigo)]",
    },

    {
      label: "Members",
      value: membersLoading ? "—" : memberCount,
      context:
        memberCount === 1
          ? "1 workspace member"
          : `${memberCount} workspace members`,
      icon: Users,

      // Blue
      valueClass: "text-[#356D8C]",
      labelClass: "text-[#356D8C]/70",
      contextClass: "text-[#356D8C]/75",
      iconClass: "bg-[#356D8C]/10 text-[#356D8C]",
      iconHoverClass: "group-hover:bg-[#356D8C] group-hover:text-white",
      accentClass: "bg-[#356D8C]",
      progressClass: "bg-[#356D8C]",
    },

    {
      label: "Tasks",
      value: `${taskProgress}%`,
      context: `${completedTasks} of ${totalTasks} tasks completed`,
      icon: CheckSquare,
      progress: taskProgress,

      // Green
      valueClass: "text-[#4E8B5F]",
      labelClass: "text-[#4E8B5F]/70",
      contextClass: "text-[#4E8B5F]/80",
      iconClass: "bg-[#4E8B5F]/10 text-[#4E8B5F]",
      iconHoverClass: "group-hover:bg-[#4E8B5F] group-hover:text-white",
      accentClass: "bg-[#4E8B5F]",
      progressClass: "bg-[#4E8B5F]",
    },

    {
      label: "Time logged",
      value: `${loggedHours}h`,
      context: `${plannedHours}h planned this week`,
      icon: Clock3,
      progress: timeProgress,

      // Amber
      valueClass: "text-[#C47E20]",
      labelClass: "text-[#C47E20]/70",
      contextClass: "text-[#B97820]/85",
      iconClass: "bg-[#E8A33D]/15 text-[#B97820]",
      iconHoverClass: "group-hover:bg-[#E8A33D] group-hover:text-white",
      accentClass: "bg-[#E8A33D]",
      progressClass: "bg-[#E8A33D]",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(27,30,42,0.08)]"
          >
            {/* Top color line */}
            <div
              className={`absolute inset-x-0 top-0 h-[3px] ${stat.accentClass} opacity-70 transition-opacity duration-200 group-hover:opacity-100`}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.15em] ${stat.labelClass}`}
                >
                  {stat.label}
                </p>

                <p
                  className={`mt-3 text-[32px] text-black font-bold leading-none tracking-[-0.04em] ${stat.valueClass}`}
                >
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${stat.iconClass} ${stat.iconHoverClass}`}
              >
                <Icon size={19} strokeWidth={1.9} />
              </div>
            </div>

            {/* Bottom information */}
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xs font-medium ${stat.contextClass}`}>
                  {stat.context}
                </p>

                <ArrowUpRight
                  size={15}
                  className={`${stat.valueClass} shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100`}
                />
              </div>

              {/* Progress */}
              {stat.progress !== undefined && (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
                    <div
                      className={`h-full rounded-full ${stat.progressClass}  text-black transition-all duration-700`}
                      style={{
                        width: `${stat.progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
