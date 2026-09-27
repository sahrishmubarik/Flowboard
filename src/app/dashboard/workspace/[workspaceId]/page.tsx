// "use client";

// // import { useQuery } from "@tanstack/react-query";
// // import { useParams } from "next/navigation";

// import { useState } from "react";
// import WorkspaceActionCard from "@/components/WorkspaceActionCard";
// import WorkspaceModal from "@/components/WorkspaceModal";
// import type { WorkspaceAction } from "@/components/WorkspaceActionCard";
// import  InviteMemberCard  from "@/components/inviteMemberCard";
// import UpdateWorkspaceCard from "@/components/updateWorkspaceNameCard";
// import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";
// import InvitationCard from "@/components/invitationStatusCard";
// import WorkspaceMemberCard from "@/components/workspaceMemberCard";
// import CreateBoard from "@/components/CreateBoardCard";
// // export default function WorkspacePage() {
// //   const { workspaceId } = useParams<{ workspaceId: string }>();

// //   const { data, isLoading, isError, error } = useQuery({
// //     queryKey: ["workspace", workspaceId],

// //     queryFn: async () => {
// //       const response = await fetch(`/api/workspace/${workspaceId}`);
// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Failed to fetch workspace");
// //       }

// //       return data;
// //     },

// //     enabled: !!workspaceId,
// //   });

// //   if (isLoading) {
// //     return <p>Loading workspace...</p>;
// //   }

// //   if (isError) {
// //     return <p>{error.message}</p>;
// //   }

// //   return (
// //     <main>
// //           <div className="min-h-screen bg-[var(--paper)]">
// //       <div className="mx-auto max-w-[1160px] px-6  md:px-10">
// //           <h1 className="text-[var(--board-pannel)] text-2xl">you select some one workspace </h1>
// //       <h1  className="text-[var(--board-pannel)] text-4xl mt-2 font-bold">{data.workspace.workspaceName}</h1>
// //  <div className="mb-12 mt-4">
// //   <InviteMemberCard/></div>
// //   <div className="mb-12 mt-4">
// //   <UpdateWorkspaceCard/></div>
// //   <div className="mb-12 mt-4">
// //   <WorkspaceMemberCard /></div>

// //   <div className="mb-12 mt-4">
// //        <InvitationCard/>
// //   </div>
// //    <div className="mb-12 mt-4">
// //     <DeleteWorkspaceCard/></div>
// //       </div>
// //       </div>
// //     </main>
// //   );
// // }

// export default function WorkspacePage() {
//   const [activeAction, setActiveAction] =
//     useState<WorkspaceAction | null>(null);

//   return (
//     <div className="min-h-screen bg-[var(--paper-raised)]">
//       <div className="mx-auto max-w-[1160px] px-6 py-12 md:px-10">

//         {/* Your existing workspace content */}

//         <WorkspaceActionCard
//           onSelect={(action) => setActiveAction(action)}
//         />
//            {/* Invite */}
//         <WorkspaceModal
//           isOpen={activeAction === "invite"}
//           onClose={() => setActiveAction(null)}
//           title="Invite Member"
//         >
//           <InviteMemberCard />
//         </WorkspaceModal>
//             {/* Create board*/}
//         <WorkspaceModal
//           isOpen={activeAction === "create-board"}
//           onClose={() => setActiveAction(null)}
//           title="Create Board"
//         >
//           <CreateBoard/>
//         </WorkspaceModal>
//         {/* Members */}
//         <WorkspaceModal
//           isOpen={activeAction === "members"}
//           onClose={() => setActiveAction(null)}
//           title="Workspace Members"
//         >
//           <WorkspaceMemberCard />
//         </WorkspaceModal>

//         {/* Update Name */}
//         <WorkspaceModal
//           isOpen={activeAction === "update-name"}
//           onClose={() => setActiveAction(null)}
//           title="Update Workspace Name"
//         >
//           <UpdateWorkspaceCard/>
//         </WorkspaceModal>

//         {/* Invitation Status */}
//         <WorkspaceModal
//           isOpen={activeAction === "invitation-status"}
//           onClose={() => setActiveAction(null)}
//           title="Invitation Status"
//         >
//           <InvitationCard />
//         </WorkspaceModal>

//         {/* Delete */}
//         <WorkspaceModal
//           isOpen={activeAction === "delete"}
//           onClose={() => setActiveAction(null)}
//           title="Delete Workspace"
//         >
//           <DeleteWorkspaceCard />
//         </WorkspaceModal>

//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import WorkspaceHeader, {
  WorkspaceAction,
} from "@/components/dashboard/WorkspaceHeader";
import WorkspaceStats from "@/components/dashboard/WorkspaceStats";
// import BoardOverviewCard from "@/components/dashboard/BoardOverview";
import RecentActivityCard from "@/components/dashboard/RecentActivity";
import AssignedTasksCard from "@/components/dashboard/AssignedTaskCard";

import WorkspaceModal from "@/components/WorkspaceModal";

import WorkspaceMemberCard from "@/components/workspaceMemberCard";
import InviteMemberCard from "@/components/inviteMemberCard";
import InvitationStatusCard from "@/components/invitationStatusCard";
import UpdateWorkspaceCard from "@/components/updateWorkspaceNameCard";
import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";
import CreateBoard from "@/components/CreateBoardCard";
type Workspace = {
  workspaceId: string;
  workspaceName: string;
  role: string;
  createdAt?: string;
};

type WorkspaceResponse = {
  message?: string;
  workspace?: Workspace[];
};

export default function WorkspaceDashboardPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();

  const workspaceId = params.workspaceId;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceAction, setWorkspaceAction] =
    useState<WorkspaceAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/workspace", {
          method: "GET",
          cache: "no-store",
        });

        const data: WorkspaceResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch workspace.");
        }

        const workspaces = data.workspace ?? [];

        const currentWorkspace = workspaces.find(
          (item) => item.workspaceId === workspaceId,
        );

        if (!currentWorkspace) {
          setError("Workspace not found.");
          return;
        }

        setWorkspace(currentWorkspace);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load workspace.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspace();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--paper)]">
        <div className="flex min-h-screen">
          <div className="hidden w-[260px] border-r border-[var(--mist)] bg-[var(--paper-raised)] lg:block" />

          <main className="flex-1 p-6 lg:p-10">
            <div className="mx-auto max-w-[1500px] animate-pulse">
              <div className="h-4 w-24 rounded bg-[var(--mist)]" />
              <div className="mt-4 h-10 w-72 rounded bg-[var(--mist)]" />

              <div className="mt-10 grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 rounded-2xl bg-[var(--mist)]"
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-8 text-center">
          <h1
            className="text-2xl font-semibold text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Workspace unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {error || "We could not find this workspace."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-xl bg-[var(--indigo)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--indigo)]/90"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="flex min-h-screen">
        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
            <WorkspaceHeader
              workspaceName="My Workspace"
              boardCount={4}
              onAction={setWorkspaceAction}
            />

            <WorkspaceStats workspaceId={workspaceId} />

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
              {/* <BoardOverviewCard workspaceId={workspaceId} /> */}
              <AssignedTasksCard />
              <RecentActivityCard />
            </div>
          </div>
        </main>
      </div>
      {workspaceAction && (
        <WorkspaceModal
          isOpen={workspaceAction !== null}
          onClose={() => setWorkspaceAction(null)}
          title={
            workspaceAction === "members"
              ? "Workspace Members"
              : workspaceAction === "invite"
                ? "Invite Member"
                : workspaceAction === "invitation-status"
                  ? "Invitation Status"
                  : workspaceAction === "update-name"
                    ? "Update Workspace"
                    : workspaceAction === "delete"
                      ? "Delete Workspace"
                      : "Create Board"
          }
        >
          {workspaceAction === "members" && <WorkspaceMemberCard />}

          {workspaceAction === "invite" && <InviteMemberCard />}

          {workspaceAction === "invitation-status" && <InvitationStatusCard />}

          {workspaceAction === "update-name" && <UpdateWorkspaceCard />}

          {workspaceAction === "delete" && <DeleteWorkspaceCard />}

          {workspaceAction === "create-board" && (
            <CreateBoard onClose={() => setWorkspaceAction(null)} />
          )}
        </WorkspaceModal>
      )}
    </div>
  );
}
