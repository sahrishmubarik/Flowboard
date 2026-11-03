"use client";

import { useParams } from "next/navigation";

import BoardHeader from "@/components/board/BoardHeader";
import CardDetailsPage from "@/components/card/CardDetailsPage";

export default function BoardCardPage() {
  const { workspaceId, boardId, cardId } = useParams<{
    workspaceId: string;
    boardId: string;
    cardId: string;
  }>();

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col overflow-hidden lg:h-screen">
      <BoardHeader />
      <CardDetailsPage
        workspaceId={workspaceId}
        boardId={boardId}
        cardId={cardId}
      />
    </div>
  );
}
