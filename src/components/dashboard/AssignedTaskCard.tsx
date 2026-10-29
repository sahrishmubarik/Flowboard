"use client";

import { ArrowRight, Circle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  role: "admin" | "owner" | "member" | "manager";
};

type BoardResponse = {
  message: string;
  boards: Board[];
};

type Sprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};

type BoardList = {
  id: string;
  position: number;
};

type Card = {
  boardListId: string;
  isArchived: boolean;
  deletedAt: string | null;
};

type BoardSprintSummary = {
  activeSprint: Sprint | null;
  totalCards: number;
  resolvedCards: number;
};

type SprintState = "To Do" | "In Progress" | "Done";

// Done only when every ticket is resolved; nothing resolved (or no tickets)
// means the sprint has not started moving yet.
function getSprintState(resolvedCards: number, totalCards: number): SprintState {
  if (totalCards > 0 && resolvedCards >= totalCards) return "Done";
  if (resolvedCards > 0) return "In Progress";
  return "To Do";
}

const sprintStateClasses: Record<SprintState, { badge: string; dot: string }> = {
  "To Do": {
    badge:
      "bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)]",
    dot: "bg-[var(--color-status-todo)]",
  },
  "In Progress": {
    badge: "bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]",
    dot: "bg-[var(--color-status-progress)]",
  },
  Done: {
    badge: "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]",
    dot: "bg-[var(--color-status-done)]",
  },
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AssignedTasksCard() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;

  const {
    data: boardData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = useQuery<BoardResponse>({
    queryKey: ["assigned-task-boards", workspaceId],

    enabled: !!workspaceId,

    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}/board`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch boards");
      }

      return data;
    },
  });

  const boards = boardData?.boards ?? [];
  const sprintSummaryQueries = useQueries({
    queries: boards.map((board) => ({
      queryKey: ["dashboard-active-sprint-summary", workspaceId, board.id],
      enabled: Boolean(workspaceId),
      queryFn: async (): Promise<BoardSprintSummary> => {
        const [sprintResponse, listResponse] = await Promise.all([
          fetch(`/api/workspace/${workspaceId}/board/${board.id}/sprint`),
          fetch(`/api/workspace/${workspaceId}/board/${board.id}/boardList`),
        ]);
        const sprintData = await sprintResponse.json();
        const listData = await listResponse.json();

        if (!sprintResponse.ok) {
          throw new Error(sprintData.message || "Failed to load board sprints");
        }
        if (!listResponse.ok) {
          throw new Error(listData.message || "Failed to load board lists");
        }

        const activeSprint: Sprint | null =
          sprintData.sprints?.find(
            (sprint: Sprint) => sprint.status === "ACTIVE",
          ) ?? null;
        if (!activeSprint) {
          return { activeSprint: null, totalCards: 0, resolvedCards: 0 };
        }

        const cardResponse = await fetch(
          `/api/workspace/${workspaceId}/board/${board.id}/card?sprintId=${encodeURIComponent(activeSprint.id)}`,
        );
        const cardData = await cardResponse.json();

        if (!cardResponse.ok) {
          throw new Error(cardData.message || "Failed to load sprint cards");
        }

        const lists: BoardList[] = (listData.boardLists ?? listData.lists ?? [])
          .slice()
          .sort((first: BoardList, second: BoardList) => first.position - second.position);
        const cards: Card[] = cardData.cards ?? [];
        const visibleCards = cards.filter(
          (card) => !card.isArchived && !card.deletedAt,
        );
        const resolvedListId = lists.at(-1)?.id;

        return {
          activeSprint,
          totalCards: visibleCards.length,
          resolvedCards: resolvedListId
            ? visibleCards.filter((card) => card.boardListId === resolvedListId)
                .length
            : 0,
        };
      },
    })),
  });
  const boardRows = boards.map((board, index) => ({
    board,
    summary: sprintSummaryQueries[index]?.data,
    isLoading: sprintSummaryQueries[index]?.isLoading ?? true,
    error: sprintSummaryQueries[index]?.error,
  }));
  const firstBoard = boards[0];

  type BoardRow = (typeof boardRows)[number];

  const skeleton = (width: string) => (
    <span
      className={`inline-block h-4 ${width} animate-pulse rounded bg-[var(--color-column-bg)]`}
    />
  );

  /* Cell renderers shared by the desktop table and the mobile list. */

  const renderSprintName = ({ summary, isLoading, error }: BoardRow) =>
    isLoading ? (
      skeleton("w-28")
    ) : error ? (
      <span className="text-sm text-[var(--color-tag-red-text)]">
        Failed to load sprint
      </span>
    ) : summary?.activeSprint ? (
      <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
        {summary.activeSprint.name}
      </span>
    ) : (
      <span
        title="No active sprint"
        className="whitespace-nowrap text-sm text-[var(--color-text-muted)]"
      >
        No active sprint
      </span>
    );

  const renderProgress = ({ summary, isLoading, error }: BoardRow) => {
    if (isLoading) return skeleton("w-20");
    if (error || !summary?.activeSprint) {
      return <span className="text-sm text-[var(--color-text-muted)]">—</span>;
    }

    const { totalCards, resolvedCards } = summary;
    const progress = totalCards
      ? Math.round((resolvedCards / totalCards) * 100)
      : 0;

    return (
      <div className="min-w-0">
        <div className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {resolvedCards} / {totalCards} resolved
        </div>
        <div
          role="progressbar"
          aria-label="Resolved tickets"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-[var(--color-column-bg)]"
        >
          <div
            className="h-full rounded-full bg-[var(--color-status-done)] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderState = ({ summary, isLoading, error }: BoardRow) => {
    if (isLoading) return skeleton("w-20");
    if (error) {
      return <span className="text-sm text-[var(--color-text-muted)]">—</span>;
    }

    const sprintState = getSprintState(
      summary?.resolvedCards ?? 0,
      summary?.totalCards ?? 0,
    );
    const classes = summary?.activeSprint
      ? sprintStateClasses[sprintState]
      : sprintStateClasses["To Do"];

    const label = summary?.activeSprint ? sprintState : "No active sprint";

    return (
      <span
        title={label}
        className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium ${classes.badge}`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${classes.dot}`} />
        <span className="truncate">{label}</span>
      </span>
    );
  };

  const renderDates = ({ summary }: BoardRow) =>
    summary?.activeSprint ? (
      <span className="whitespace-nowrap">
        {formatSprintDate(summary.activeSprint.startDate)} –{" "}
        {formatSprintDate(summary.activeSprint.endDate)}
      </span>
    ) : (
      <span className="text-[var(--color-text-muted)]">—</span>
    );

  const boardAvatar = (boardName: string) => (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[11px] font-semibold text-white"
    >
      {boardName.charAt(0).toUpperCase()}
    </span>
  );

  const headerCellClass =
    "truncate px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]";

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-sm)]">
      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Active sprints
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Progress of the active sprint on each of your boards
          </p>
        </div>

        {!isBoardsLoading && boards.length > 0 && (
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {boards.length} {boards.length === 1 ? "board" : "boards"}
          </span>
        )}
      </div>

      {/* Loading */}

      {isBoardsLoading && (
        <div aria-label="Loading boards">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-b-0 md:grid-cols-5"
            >
              {Array.from({ length: 5 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`h-4 animate-pulse rounded bg-[var(--color-column-bg)] ${
                    itemIndex > 1 ? "hidden md:block" : ""
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Error */}

      {isBoardsError && (
        <div role="alert" className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-[var(--color-tag-red-text)]">
            Failed to load your boards.
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {/* Empty */}

      {!isBoardsLoading && !isBoardsError && boards.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-column-bg)] text-[var(--color-text-muted)]">
            <Circle size={18} />
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
            No boards yet
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Create a board and its active sprint will appear here.
          </p>
        </div>
      )}

      {!isBoardsLoading && !isBoardsError && boards.length > 0 && (
        <>
          {/* Desktop: table */}

          <div className="hidden overflow-x-auto md:block">
            {/* Fixed layout: long names truncate instead of pushing columns out. */}
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-column-bg)]">
                  <th scope="col" className={`${headerCellClass} w-[29%] pl-5`}>
                    Board
                  </th>
                  <th scope="col" className={`${headerCellClass} w-[17%]`}>
                    Active sprint
                  </th>
                  <th scope="col" className={`${headerCellClass} w-[20%]`}>
                    Progress
                  </th>
                  <th scope="col" className={`${headerCellClass} w-[17%]`}>
                    State
                  </th>
                  <th scope="col" className={`${headerCellClass} w-[17%]`}>
                    Sprint dates
                  </th>
                </tr>
              </thead>

              <tbody>
                {boardRows.map((row) => (
                  <tr
                    key={row.board.id}
                    className="border-b border-[var(--color-border)] transition-colors last:border-b-0 hover:bg-[var(--color-card-hover)]"
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {boardAvatar(row.board.boardName)}
                        <Link
                          href={`/dashboard/workspace/${workspaceId}/board/${row.board.id}`}
                          className="min-w-0 truncate text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:underline"
                          title={row.board.boardName}
                        >
                          {row.board.boardName}
                        </Link>
                      </div>
                    </td>
                    <td className="truncate px-3 py-3.5">{renderSprintName(row)}</td>
                    <td className="px-3 py-3.5">{renderProgress(row)}</td>
                    <td className="px-3 py-3.5">{renderState(row)}</td>
                    <td className="truncate px-3 py-3.5 text-sm text-[var(--color-text-secondary)]">
                      {renderDates(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per board */}

          <ul className="divide-y divide-[var(--color-border)] md:hidden">
            {boardRows.map((row) => (
              <li key={row.board.id}>
                <Link
                  href={`/dashboard/workspace/${workspaceId}/board/${row.board.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-[var(--color-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-primary)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {boardAvatar(row.board.boardName)}
                      <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {row.board.boardName}
                      </span>
                    </div>
                    {renderState(row)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[38px] text-xs text-[var(--color-text-secondary)]">
                    {renderSprintName(row)}
                    {row.summary?.activeSprint && (
                      <>
                        <span aria-hidden="true">·</span>
                        {renderDates(row)}
                      </>
                    )}
                  </div>

                  {row.summary?.activeSprint && (
                    <div className="mt-3 pl-[38px]">{renderProgress(row)}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer */}

          {firstBoard && (
            <div className="border-t border-[var(--color-border)] px-5 py-3.5">
              <Link
                href={`/dashboard/workspace/${workspaceId}/board/${firstBoard.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)] hover:underline"
              >
                Open {firstBoard.boardName}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function formatSprintDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
