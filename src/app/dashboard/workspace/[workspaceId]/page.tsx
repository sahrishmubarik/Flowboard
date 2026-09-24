"use client";

// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "next/navigation";

import { useState } from "react";
import WorkspaceActionCard from "@/components/WorkspaceActionCard";
import WorkspaceModal from "@/components/WorkspaceModal";
import type { WorkspaceAction } from "@/components/WorkspaceActionCard";
import  InviteMemberCard  from "@/components/inviteMemberCard";
import UpdateWorkspaceCard from "@/components/updateWorkspaceNameCard";
import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";
import InvitationCard from "@/components/invitationStatusCard";
import WorkspaceMemberCard from "@/components/workspaceMemberCard";
import CreateBoard from "@/components/CreateBoardCard";
// export default function WorkspacePage() {
//   const { workspaceId } = useParams<{ workspaceId: string }>();

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ["workspace", workspaceId],

//     queryFn: async () => {
//       const response = await fetch(`/api/workspace/${workspaceId}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch workspace");
//       }

//       return data;
//     },

//     enabled: !!workspaceId,
//   });

//   if (isLoading) {
//     return <p>Loading workspace...</p>;
//   }

//   if (isError) {
//     return <p>{error.message}</p>;
//   }

//   return (
//     <main>
//           <div className="min-h-screen bg-[var(--paper)]">
//       <div className="mx-auto max-w-[1160px] px-6  md:px-10">
//           <h1 className="text-[var(--board-pannel)] text-2xl">you select some one workspace </h1>
//       <h1  className="text-[var(--board-pannel)] text-4xl mt-2 font-bold">{data.workspace.workspaceName}</h1>
//  <div className="mb-12 mt-4">
//   <InviteMemberCard/></div> 
//   <div className="mb-12 mt-4">
//   <UpdateWorkspaceCard/></div>
//   <div className="mb-12 mt-4">
//   <WorkspaceMemberCard /></div>
 
//   <div className="mb-12 mt-4">
//        <InvitationCard/>
//   </div>
//    <div className="mb-12 mt-4">
//     <DeleteWorkspaceCard/></div>
//       </div>
//       </div>
//     </main>
//   );
// }



export default function WorkspacePage() {
  const [activeAction, setActiveAction] =
    useState<WorkspaceAction | null>(null);

  return (
    <div className="min-h-screen bg-[var(--paper-raised)]">
      <div className="mx-auto max-w-[1160px] px-6 py-12 md:px-10">

        {/* Your existing workspace content */}

        <WorkspaceActionCard
          onSelect={(action) => setActiveAction(action)}
        />
           {/* Invite */}
        <WorkspaceModal
          isOpen={activeAction === "invite"}
          onClose={() => setActiveAction(null)}
          title="Invite Member"
        >
          <InviteMemberCard />
        </WorkspaceModal>
            {/* Create board*/}
        <WorkspaceModal
          isOpen={activeAction === "create-board"}
          onClose={() => setActiveAction(null)}
          title="Create Board"
        >
          <CreateBoard/>
        </WorkspaceModal>
        {/* Members */}
        <WorkspaceModal
          isOpen={activeAction === "members"}
          onClose={() => setActiveAction(null)}
          title="Workspace Members"
        >
          <WorkspaceMemberCard />
        </WorkspaceModal>

    

        {/* Update Name */}
        <WorkspaceModal
          isOpen={activeAction === "update-name"}
          onClose={() => setActiveAction(null)}
          title="Update Workspace Name"
        >
          <UpdateWorkspaceCard/>
        </WorkspaceModal>

        {/* Invitation Status */}
        <WorkspaceModal
          isOpen={activeAction === "invitation-status"}
          onClose={() => setActiveAction(null)}
          title="Invitation Status"
        >
          <InvitationCard />
        </WorkspaceModal>

        {/* Delete */}
        <WorkspaceModal
          isOpen={activeAction === "delete"}
          onClose={() => setActiveAction(null)}
          title="Delete Workspace"
        >
          <DeleteWorkspaceCard />
        </WorkspaceModal>
  


      </div>
    </div>
  );
}
