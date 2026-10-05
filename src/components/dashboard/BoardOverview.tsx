"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, LayoutDashboard } from "lucide-react";

import BoardCard, { type Board } from "./BoardCard";

type BoardOverviewCardProps = {
  workspaceId: string;
};

type BoardResponse = {
  message?: string;
  boards?: Board[];
  board?: Board[];
};

export default function BoardOverviewCard({
  workspaceId,
}: BoardOverviewCardProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBoards = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/workspace/${workspaceId}/board`, {
        method: "GET",
        cache: "no-store",
      });

      const data: BoardResponse | Board[] = await response.json();

      if (!response.ok) {
        throw new Error(
          !Array.isArray(data)
            ? data?.message || "Unable to fetch boards."
            : "Unable to fetch boards.",
        );
      }

      if (Array.isArray(data)) {
        setBoards(data);
      } else {
        setBoards(data.boards ?? data.board ?? []);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to fetch boards.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <section id="boards" className="mt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-[var(--indigo)]" />

            <h3
              className="text-xl font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Boards
            </h3>
          </div>

          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Your workspace boards and active workspaces.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBoards}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--indigo)]/30 hover:text-[var(--indigo)] disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--coral)]/20 bg-[var(--coral)]/5 px-5 py-4 text-sm text-[var(--coral)]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[180px] animate-pulse rounded-2xl border border-[var(--mist)] bg-[var(--paper)]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </section>
  );
}
