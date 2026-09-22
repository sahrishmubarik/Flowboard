// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type DashboardStatsProps = {
//   workspaceId: string | null;
//   onActionSelect: (action: string) => void;
// };

// export default function DashboardStats({
//   workspaceId,
//   onActionSelect,
// }: DashboardStatsProps) {
//   const [showActions, setShowActions] = useState(false);
//   const router = useRouter();

//   const handleAction = (action: string) => {
//     if (!workspaceId) {
//       return;
//     }

//     setShowActions(false);
//     onActionSelect(action);
//   };

//   return (
//     <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//       {/* Members */}
//       <button
//         type="button"
//         className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
//       >
//         <p className="text-sm font-medium text-[var(--ink-soft)]">
//           Members
//         </p>

//         <div className="mt-3 flex items-end justify-between">
//           <p className="text-3xl font-semibold text-[var(--ink)]">
//             12
//           </p>

//           <span className="text-xs font-medium text-[var(--indigo)]">
//             View members →
//           </span>
//         </div>
//       </button>

//       {/* Boards */}
//       <button
//         type="button"
//         className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
//       >
//         <p className="text-sm font-medium text-[var(--ink-soft)]">
//           Boards
//         </p>

//         <div className="mt-3 flex items-end justify-between">
//           <p className="text-3xl font-semibold text-[var(--ink)]">
//             4
//           </p>

//           <span className="text-xs font-medium text-[var(--indigo)]">
//             View boards →
//           </span>
//         </div>
//       </button>

//       {/* Create Board */}
//       <button
//         type="button"
//         onClick={() => router.push("/dashboard/boards/new")}
//         className="group rounded-2xl border border-dashed border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--amber)] hover:bg-[var(--amber)]/[0.05]"
//       >
//         <div className="flex items-center justify-between">
//           <p className="text-sm font-medium text-[var(--ink-soft)]">
//             Create New Board
//           </p>

//           <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--amber)]/15 text-lg text-[var(--amber-deep)]">
//             +
//           </span>
//         </div>

//         <p className="mt-4 text-sm font-medium text-[var(--ink)]">
//           Start a new board
//         </p>

//         <p className="mt-1 text-xs text-[var(--ink-soft)]">
//           Create and organize your project.
//         </p>
//       </button>

//       {/* Actions */}
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setShowActions((prev) => !prev)}
//           className="w-full rounded-2xl border border-[var(--mist)] bg-[var(--board-panel)] p-5 text-left text-white transition hover:bg-[var(--board-ink)]"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-white/70">
//                 Workspace
//               </p>

//               <p className="mt-2 text-lg font-semibold">
//                 Actions
//               </p>
//             </div>

//             <span
//               className={`text-lg transition-transform ${
//                 showActions ? "rotate-180" : ""
//               }`}
//             >
//               ↓
//             </span>
//           </div>

//           <p className="mt-3 text-xs text-white/60">
//             Manage your organization
//           </p>
//         </button>

//         {/* Actions Dropdown */}
//         {showActions && (
//           <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-lg">

//             {/* Invite Member */}
//             <button
//               type="button"
//               onClick={() => handleAction("invite-member")}
//               disabled={!workspaceId}
//               className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Invite Member
//             </button>

//             {/* Member Details */}
//             <button
//               type="button"
//               onClick={() => handleAction("member-details")}
//               disabled={!workspaceId}
//               className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Member Details
//             </button>

//             {/* Invitation Details */}
//             <button
//               type="button"
//               onClick={() => handleAction("invitation-details")}
//               disabled={!workspaceId}
//               className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Invitation Details
//             </button>

//             {/* Update Workspace */}
//             <button
//               type="button"
//               onClick={() => handleAction("update-workspace")}
//               disabled={!workspaceId}
//               className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Update Workspace
//             </button>

//             {/* Delete Organization */}
//             <button
//               type="button"
//               onClick={() => handleAction("delete-workspace")}
//               disabled={!workspaceId}
//               className="w-full border-t border-[var(--mist)] px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Delete Organization
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type Workspace = {
  workspaceId: string;
  workspaceName: string;
  role: string;
};

type DashboardStatsProps = {
  selectedWorkspaceId: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onActionSelect: (
    action:
      | "invite"
      | "members"
      | "invitations"
      | "update"
      | "delete"
  ) => void;
};

export default function DashboardStats({
  selectedWorkspaceId,
  onWorkspaceSelect,
  onActionSelect,
}: DashboardStatsProps) {
  const [showActions, setShowActions] = useState(false);

  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch workspaces"
        );
      }

      return data;
    },
  });

  const workspaces: Workspace[] = data?.workspace ?? [];

  if (isLoading) {
    return <p>Loading organizations...</p>;
  }

  if (isError) {
    return <p>Failed to load organizations.</p>;
  }

  return (
    <div className="space-y-4">

      {/* Workspace selector */}
      <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-4">
        <label className="text-sm font-medium text-[var(--ink-soft)]">
          Select organization
        </label>

        <select
          value={selectedWorkspaceId ?? ""}
          onChange={(event) => {
            onWorkspaceSelect(event.target.value);
          }}
          className="mt-2 w-full rounded-lg border border-[var(--mist)] bg-[var(--paper)] px-3 py-2 text-sm outline-none"
        >
          <option value="" disabled>
            Select an organization
          </option>

          {workspaces.map((workspace) => (
            <option
              key={workspace.workspaceId}
              value={workspace.workspaceId}
            >
              {workspace.workspaceName}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Members */}
        <button
          type="button"
          onClick={() => {
            if (!selectedWorkspaceId) return;

            onActionSelect("members");
          }}
          className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            Members
          </p>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold text-[var(--ink)]">
              12
            </p>

            <span className="text-xs font-medium text-[var(--indigo)]">
              View members →
            </span>
          </div>
        </button>

        {/* Boards */}
        <button
          type="button"
          className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            Boards
          </p>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold text-[var(--ink)]">
              4
            </p>

            <span className="text-xs font-medium text-[var(--indigo)]">
              View boards →
            </span>
          </div>
        </button>

        {/* Create Board */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/boards/new")}
          className="group rounded-2xl border border-dashed border-[var(--mist)] bg-[var(--paper-raised)] p-5 text-left transition hover:border-[var(--amber)] hover:bg-[var(--amber)]/[0.05]"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--ink-soft)]">
              Create New Board
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--amber)]/15 text-lg text-[var(--amber-deep)]">
              +
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-[var(--ink)]">
            Start a new board
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Create and organize your project.
          </p>
        </button>

        {/* Actions */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowActions((prev) => !prev)}
            className="w-full rounded-2xl border border-[var(--mist)] bg-[var(--board-panel)] p-5 text-left text-white transition hover:bg-[var(--board-ink)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  Organization
                </p>

                <p className="mt-2 text-lg font-semibold">
                  Actions
                </p>
              </div>

              <span
                className={`text-lg transition-transform ${
                  showActions ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </div>

            <p className="mt-3 text-xs text-white/60">
              Manage your organization
            </p>
          </button>

          {showActions && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-lg">

              <button
                type="button"
                onClick={() => {
                  if (!selectedWorkspaceId) return;

                  onActionSelect("invite");
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Invite Member
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedWorkspaceId) return;

                  onActionSelect("members");
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Member Details
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedWorkspaceId) return;

                  onActionSelect("invitations");
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Invitation Details
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedWorkspaceId) return;

                  onActionSelect("update");
                  setShowActions(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--paper)]"
              >
                Update Workspace
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedWorkspaceId) return;

                  onActionSelect("delete");
                  setShowActions(false);
                }}
                className="w-full border-t border-[var(--mist)] px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
              >
                Delete Organization
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}