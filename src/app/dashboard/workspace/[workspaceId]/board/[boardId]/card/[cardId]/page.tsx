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
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader />
      <CardDetailsPage
        workspaceId={workspaceId}
        boardId={boardId}
        cardId={cardId}
      />
    </div>
  );
}
