
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import  InviteMemberCard  from "@/components/inviteMemberCard";
import UpdateWorkspaceCard from "@/components/updateWorkspaceNameCard";
import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";
import InvitationCard from "@/components/invitationStatusCard";
import WorkspaceMemberCard from "@/components/workspaceMemberCard";
export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["workspace", workspaceId],

    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspace");
      }

      return data;
    },

    enabled: !!workspaceId,
  });

  if (isLoading) {
    return <p>Loading workspace...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <main>
          <div className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-[1160px] px-6  md:px-10">
          <h1 className="text-[var(--board-pannel)] text-2xl">you select some one workspace </h1>
      <h1  className="text-[var(--board-pannel)] text-4xl mt-2 font-bold">{data.workspace.workspaceName}</h1>

  <InviteMemberCard/>
  <UpdateWorkspaceCard/>
  <WorkspaceMemberCard />
    <DeleteWorkspaceCard/>
     <InvitationCard/>
      </div>
      </div>
    </main>
  );
}