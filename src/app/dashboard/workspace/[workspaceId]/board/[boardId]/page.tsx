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
    <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-hidden lg:h-screen">
      <BoardHeader />

      <main className="flex-1 overflow-y-auto bg-[var(--color-column-bg)] ">
        <BoardCanvas workspaceId={workspaceId} boardId={boardId} />
      </main>
    </div>
  );
}
