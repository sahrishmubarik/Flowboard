"use client";

import { Circle } from "lucide-react";
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

  return (
    <section
      className="
        overflow-hidden
        rounded-[var(--radius-xl)]
        border
        bg-[var(--color-card-bg)]
        shadow-[var(--shadow-sm)]
      "
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      {/* =========================================================
          HEADER
      ========================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          px-5
          py-4
        "
        style={{
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <h2
            className="
              shrink-0
              text-[17px]
              font-semibold
              tracking-tight
            "
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Assigned to me
          </h2>

          <div
            className="
              hidden
              items-center
              gap-2
              text-xs
              sm:flex
            "
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            <span>#All boards</span>

            <span style={{ color: "var(--color-border)" }}>•</span>

            <span>assignee: me</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          LOADING
      ========================================================== */}

      {isBoardsLoading && (
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="
                grid
                grid-cols-5
                gap-4
                border-b
                px-5
                py-4
              "
              style={{
                borderColor: "var(--color-border)",
              }}
            >
              {Array.from({ length: 5 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="
                    h-4
                    animate-pulse
                    rounded
                  "
                  style={{
                    background: "var(--color-column-bg)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          ERROR
      ========================================================== */}

      {isBoardsError && (
        <div className="px-5 py-10 text-center">
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--color-priority-high)",
            }}
          >
            Failed to load your boards.
          </p>

          <p
            className="mt-1 text-xs"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {/* =========================================================
          NO BOARDS
      ========================================================== */}

      {!isBoardsLoading && !isBoardsError && boards.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div
            className="
                mx-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
              "
            style={{
              background: "var(--color-column-bg)",
              color: "var(--color-text-muted)",
            }}
          >
            <Circle size={18} />
          </div>

          <p
            className="mt-3 text-sm font-medium"
            style={{
              color: "var(--color-text-primary)",
            }}
          >
            No boards yet
          </p>

          <p
            className="mt-1 text-xs"
            style={{
              color: "var(--color-text-muted)",
            }}
          >
            Create a board and your assigned cards will appear here.
          </p>
        </div>
      )}

      {/* =========================================================
          TABLE
      ========================================================== */}

      {!isBoardsLoading && !isBoardsError && boards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-column-bg)",
                }}
              >
                <th
                  className="
                      w-[180px]
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                    "
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  Board
                </th>

                <th
                  className="
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                    "
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  Active sprint
                </th>

                <th
                  className="
                      w-[150px]
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                    "
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  Progress
                </th>

                <th
                  className="
                      w-[150px]
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                    "
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  State
                </th>

                <th
                  className="
                      w-[130px]
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                    "
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  Sprint due
                </th>
              </tr>
            </thead>

            <tbody>
              {boardRows.map(({ board, summary, isLoading, error }) => {
                const totalCards = summary?.totalCards ?? 0;
                const resolvedCards = summary?.resolvedCards ?? 0;
                const progress = totalCards
                  ? Math.round((resolvedCards / totalCards) * 100)
                  : 0;
                const sprintState = getSprintState(resolvedCards, totalCards);
                return (
                  <tr
                    key={board.id}
                    className="
                        group
                        border-b
                        transition-colors
                        last:border-b-0
                      "
                    style={{
                      borderColor: "var(--color-border)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--color-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* =================================================
                          BOARD
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              text-white
                            "
                          style={{
                            background: "var(--color-primary)",
                          }}
                        >
                          <span className="text-[10px] font-semibold">
                            {board.boardName.charAt(0).toUpperCase()}
                          </span>
                        </span>

                        <Link
                          href={`/dashboard/workspace/${workspaceId}/board/${board.id}`}
                          className="
                              max-w-[130px]
                              truncate
                              text-sm
                              font-medium
                              hover:text-[var(--color-primary)]
                            "
                          style={{
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {board.boardName}
                        </Link>
                      </div>
                    </td>

                    {/* =================================================
                          ACTIVE SPRINT
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      {isLoading ? (
                        <span
                          className="inline-block h-4 w-28 animate-pulse rounded"
                          style={{ background: "var(--color-column-bg)" }}
                        />
                      ) : error ? (
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-priority-high)" }}
                        >
                          Failed to load sprint
                        </span>
                      ) : summary?.activeSprint ? (
                        <span
                          className="truncate text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {summary.activeSprint.name}
                        </span>
                      ) : (
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          No active sprint
                        </span>
                      )}
                    </td>

                    {/* =================================================
                          SPRINT PROGRESS
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      {isLoading ? (
                        <span
                          className="inline-block h-4 w-16 animate-pulse rounded"
                          style={{ background: "var(--color-column-bg)" }}
                        />
                      ) : error ? (
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          —
                        </span>
                      ) : (
                        <div className="min-w-[90px]">
                          <div
                            className="mb-1 text-xs font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {resolvedCards} / {totalCards} resolved
                          </div>
                          <div
                            className="h-1.5 overflow-hidden rounded-full"
                            style={{ background: "var(--color-column-bg)" }}
                          >
                            <div
                              className="h-full rounded-full bg-[var(--color-status-done)] transition-[width]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* =================================================
                          SPRINT STATE
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      {isLoading ? (
                        <span
                          className="inline-block h-6 w-20 animate-pulse rounded"
                          style={{ background: "var(--color-column-bg)" }}
                        />
                      ) : error ? (
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          —
                        </span>
                      ) : summary?.activeSprint ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium ${sprintStateClasses[sprintState].badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sprintStateClasses[sprintState].dot}`}
                          />
                          {sprintState}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-tag-neutral-bg)] px-2 py-1 text-[11px] font-medium text-[var(--color-tag-neutral-text)]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-status-todo)]" />
                          No active sprint
                        </span>
                      )}
                    </td>

                    {/* =================================================
                          SPRINT DATES
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {summary?.activeSprint ? (
                          <span>
                            {formatSprintDate(summary.activeSprint.startDate)} –{" "}
                            {formatSprintDate(summary.activeSprint.endDate)}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          FOOTER
      ========================================================== */}

      {!isBoardsLoading && boards.length > 0 && (
        <div
          className="border-t px-5 py-3.5"
          style={{
            borderColor: "var(--color-border)",
          }}
        >
          <Link
            href={`/dashboard/workspace/${workspaceId}/board/${firstBoard.id}`}
            className="
              text-sm
              font-medium
              transition-colors
            "
            style={{
              color: "var(--color-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-primary-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-primary)";
            }}
          >
            View all my tasks →
          </Link>
        </div>
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
