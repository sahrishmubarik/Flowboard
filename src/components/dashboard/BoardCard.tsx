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
      className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]"
    >
      {/* Decorative board surface */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[70px] bg-[var(--color-primary-active-bg)] transition group-hover:bg-[var(--color-primary-active-bg)]" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-product-window-panel)] text-[var(--color-product-window-text)]">
            <LayoutDashboard size={18} strokeWidth={1.8} />
          </div>

          <ArrowUpRight
            size={18}
            className="text-[var(--color-text-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
          />
        </div>

        <h3
          className="mt-6 line-clamp-2 text-lg font-semibold text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {board.boardName}
        </h3>
      </div>

      <div className="relative mt-6 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>Open board</span>

        {board.createdAt && (
          <span>{new Date(board.createdAt).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}
