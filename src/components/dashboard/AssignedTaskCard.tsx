"use client";

import { CheckSquare2, Circle, Clock3, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

type TaskPriority = "critical" | "high" | "medium" | "low";

type TaskState = "todo" | "in-progress" | "review" | "done";

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

type TaskDetails = {
  id: string;
  cardName: string;
  priority: TaskPriority;
  state: TaskState;
  dueDate: string;
};

/*
 * Temporary card/task data.
 *
 * These are only being used because List/Card CRUD
 * does not exist yet.
 *
 * The board name will NOT be hardcoded.
 * It will come from the real board API.
 */
const mockTaskDetails: TaskDetails[] = [
  {
    id: "task-1",
    cardName: "Fix coupon validation on checkout",
    priority: "critical",
    state: "in-progress",
    dueDate: "Sep 28",
  },
  {
    id: "task-2",
    cardName: "Build notification settings screen",
    priority: "high",
    state: "review",
    dueDate: "Sep 29",
  },
  {
    id: "task-3",
    cardName: "Add API authentication guide",
    priority: "medium",
    state: "todo",
    dueDate: "Oct 01",
  },
  {
    id: "task-4",
    cardName: "Add responsive navbar drawer",
    priority: "high",
    state: "in-progress",
    dueDate: "Oct 02",
  },
  {
    id: "task-5",
    cardName: "Prepare homepage feature copy",
    priority: "medium",
    state: "todo",
    dueDate: "Oct 03",
  },
  {
    id: "task-6",
    cardName: "Fix Android push notification issue",
    priority: "critical",
    state: "todo",
    dueDate: "Oct 04",
  },
  {
    id: "task-7",
    cardName: "Clean up footer spacing on Safari",
    priority: "low",
    state: "done",
    dueDate: "Oct 05",
  },
];

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    dot: string;
  }
> = {
  critical: {
    label: "Critical",
    dot: "bg-[var(--coral)]",
  },
  high: {
    label: "High",
    dot: "bg-[var(--amber)]",
  },
  medium: {
    label: "Medium",
    dot: "bg-[var(--indigo)]",
  },
  low: {
    label: "Low",
    dot: "bg-[var(--sage)]",
  },
};

const stateConfig: Record<
  TaskState,
  {
    label: string;
    className: string;
  }
> = {
  todo: {
    label: "Todo",
    className: "bg-[var(--mist)] text-[var(--ink-soft)]",
  },

  "in-progress": {
    label: "In Progress",
    className: "bg-[var(--indigo)]/10 text-[var(--indigo)]",
  },

  review: {
    label: "Review",
    className: "bg-[var(--amber)]/15 text-[var(--amber-deep)]",
  },

  done: {
    label: "Done",
    className: "bg-[var(--sage)]/15 text-[var(--sage)]",
  },
};

function TaskStateBadge({ state }: { state: TaskState }) {
  const config = stateConfig[state];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${config.dot}`} />

      <span className="text-sm text-[var(--ink)]">{config.label}</span>
    </div>
  );
}

export default function AssignedTasksCard() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;

  /*
   * --------------------------------------------------------------------------
   * Fetch boards for the current logged-in user
   * --------------------------------------------------------------------------
   *
   * We do NOT send userId here.
   *
   * Your backend authentication should identify the current user and
   * return the boards available to that user.
   */

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

  /*
   * --------------------------------------------------------------------------
   * Temporary task rows
   * --------------------------------------------------------------------------
   *
   * For now:
   *
   * REAL:
   *   board.id
   *   board.boardName
   *
   * TEMPORARY:
   *   cardName
   *   priority
   *   state
   *   dueDate
   *
   * Later Card/List CRUD will replace mockTaskDetails completely.
   */

  const tasks = boards
    .map((board, index) => {
      const task = mockTaskDetails[index];

      if (!task) {
        return null;
      }

      return {
        ...task,
        boardId: board.id,
        boardName: board.boardName,
      };
    })
    .filter(Boolean);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-center justify-between border-b border-[var(--mist)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <h2
            className="shrink-0 text-[17px] font-semibold text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Assigned to me
          </h2>

          <div className="hidden items-center gap-2 text-xs text-[var(--ink-soft)] sm:flex">
            <span>#All boards</span>

            <span className="text-[var(--mist)]">•</span>

            <span>assignee: me</span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          aria-label="Task options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading                                                            */}
      {/* ------------------------------------------------------------------ */}

      {isBoardsLoading && (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 border-b border-[var(--mist)] px-5 py-4"
            >
              <div className="h-4 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 animate-pulse rounded bg-[var(--mist)]" />
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                              */}
      {/* ------------------------------------------------------------------ */}

      {isBoardsError && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-[var(--coral)]">
            Failed to load your boards.
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Please refresh the page and try again.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* No boards                                                          */}
      {/* ------------------------------------------------------------------ */}

      {!isBoardsLoading && !isBoardsError && boards.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mist)]">
            <Circle size={18} className="text-[var(--ink-soft)]" />
          </div>

          <p className="mt-3 text-sm font-medium text-[var(--ink)]">
            No boards yet
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Create a board and your assigned cards will appear here.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                              */}
      {/* ------------------------------------------------------------------ */}

      {!isBoardsLoading && !isBoardsError && boards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--mist)] bg-[var(--paper)]">
                <th className="w-[180px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  Board
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  Card
                </th>

                <th className="w-[150px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  Priority
                </th>

                <th className="w-[150px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  State
                </th>

                <th className="w-[130px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                  Due
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => {
                if (!task) return null;

                const isOverdue = false;

                return (
                  <tr
                    key={task.id}
                    className="group border-b border-[var(--mist)] last:border-b-0 hover:bg-[var(--paper)]"
                  >
                    {/* Board */}

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--board-panel)] text-white">
                          <span className="text-[10px] font-semibold">
                            {task.boardName.charAt(0).toUpperCase()}
                          </span>
                        </span>

                        <span className="max-w-[130px] truncate text-sm font-medium text-[var(--ink)]">
                          {task.boardName}
                        </span>
                      </div>
                    </td>

                    {/* Card */}

                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        className="flex max-w-[420px] items-center gap-2 text-left"
                      >
                        {task.state === "done" ? (
                          <CheckSquare2
                            size={16}
                            className="shrink-0 text-[var(--sage)]"
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="shrink-0 text-[var(--indigo)]"
                          />
                        )}

                        <span className="truncate text-sm text-[var(--ink)] transition-colors group-hover:text-[var(--indigo)]">
                          {task.cardName}
                        </span>
                      </button>
                    </td>

                    {/* Priority */}

                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* State */}

                    <td className="px-5 py-3.5">
                      <TaskStateBadge state={task.state} />
                    </td>

                    {/* Due */}

                    <td className="px-5 py-3.5">
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          isOverdue
                            ? "text-[var(--coral)]"
                            : "text-[var(--ink-soft)]"
                        }`}
                      >
                        {isOverdue && <Clock3 size={14} />}

                        <span>{task.dueDate}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}

      {!isBoardsLoading && boards.length > 0 && (
        <div className="border-t border-[var(--mist)] px-5 py-3.5">
          <button
            type="button"
            className="text-sm font-medium text-[var(--indigo)] transition-colors hover:text-[var(--indigo-deep)]"
          >
            View all my tasks →
          </button>
        </div>
      )}
    </section>
  );
}
