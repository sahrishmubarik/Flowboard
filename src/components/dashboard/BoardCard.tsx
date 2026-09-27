"use client";

import Link from "next/link";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";

export type Board = {
  id: string;
  boardName: string;
  createdAt?: string;
};

type BoardCardProps = {
  board: Board;
  workspaceId: string;
};

export default function BoardCard({ board, workspaceId }: BoardCardProps) {
  return (
    <Link
      href={`/dashboard/workspace/${workspaceId}/board/${board.id}`}
      className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--indigo)]/30 hover:shadow-[0_16px_35px_rgba(27,30,42,0.08)]"
    >
      {/* Decorative board surface */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[70px] bg-[var(--indigo)]/5 transition group-hover:bg-[var(--indigo)]/10" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--board-panel)] text-white">
            <LayoutDashboard size={18} strokeWidth={1.8} />
          </div>

          <ArrowUpRight
            size={18}
            className="text-[var(--ink-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--indigo)]"
          />
        </div>

        <h3
          className="mt-6 line-clamp-2 text-lg font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {board.boardName}
        </h3>
      </div>

      <div className="relative mt-6 flex items-center justify-between text-xs text-[var(--ink-soft)]">
        <span>Open board</span>

        {board.createdAt && (
          <span>{new Date(board.createdAt).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}
