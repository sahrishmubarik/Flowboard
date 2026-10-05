"use client";

import { useParams } from "next/navigation";

import BoardHeader from "@/components/board/BoardHeader";
import BoardCanvas from "@/components/board/BoardCanvas";

export default function BoardPage() {
  const params = useParams<{
    workspaceId: string;
    boardId: string;
  }>();

  const { workspaceId, boardId } = params;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader />

      <main className="min-h-0 flex-1 overflow-auto">
        <BoardCanvas workspaceId={workspaceId} boardId={boardId} />
      </main>
    </div>
  );
}
