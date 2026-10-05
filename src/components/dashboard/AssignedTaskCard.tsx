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
 * Temporary task data.
 *
 * List/Card CRUD does not exist yet,
 * so these values are temporarily mocked.
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

/* =========================================================
   PRIORITY
   Uses new global color schema
   ========================================================= */

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    dot: string;
    text: string;
    background: string;
  }
> = {
  critical: {
    label: "Critical",
    dot: "bg-[var(--color-priority-high)]",
    text: "text-[var(--color-priority-high)]",
    background: "bg-[var(--color-tag-red-bg)]",
  },

  high: {
    label: "High",
    dot: "bg-[var(--color-priority-high)]",
    text: "text-[var(--color-priority-high)]",
    background: "bg-[var(--color-tag-red-bg)]",
  },

  medium: {
    label: "Medium",
    dot: "bg-[var(--color-priority-medium)]",
    text: "text-[var(--color-priority-medium)]",
    background: "bg-[var(--color-tag-neutral-bg)]",
  },

  low: {
    label: "Low",
    dot: "bg-[var(--color-priority-low)]",
    text: "text-[var(--color-priority-low)]",
    background: "bg-[var(--color-tag-green-bg)]",
  },
};

/* =========================================================
   STATE
   ========================================================= */

const stateConfig: Record<
  TaskState,
  {
    label: string;
    className: string;
  }
> = {
  todo: {
    label: "Todo",
    className:
      "bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)]",
  },

  "in-progress": {
    label: "In Progress",
    className:
      "bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]",
  },

  review: {
    label: "Review",
    className:
      "bg-[var(--color-tag-purple-bg)] text-[var(--color-tag-purple-text)]",
  },

  done: {
    label: "Done",
    className:
      "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]",
  },
};

/* =========================================================
   STATE BADGE
   ========================================================= */

function TaskStateBadge({ state }: { state: TaskState }) {
  const config = stateConfig[state];

  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/* =========================================================
   PRIORITY BADGE
   ========================================================= */

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${config.dot}`} />

      <span className={`text-sm ${config.text}`}>{config.label}</span>
    </div>
  );
}

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

  /*
   * Temporary mapping.
   *
   * Board information comes from API.
   * Task information is currently mocked.
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

        <button
          type="button"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-[var(--radius-sm)]
            transition-colors
          "
          style={{
            color: "var(--color-text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-card-hover)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
          aria-label="Task options"
        >
          <MoreHorizontal size={18} />
        </button>
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
                  Card
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
                  Priority
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
                            {task.boardName.charAt(0).toUpperCase()}
                          </span>
                        </span>

                        <span
                          className="
                              max-w-[130px]
                              truncate
                              text-sm
                              font-medium
                            "
                          style={{
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {task.boardName}
                        </span>
                      </div>
                    </td>

                    {/* =================================================
                          CARD
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        className="
                            flex
                            max-w-[420px]
                            items-center
                            gap-2
                            text-left
                          "
                      >
                        {task.state === "done" ? (
                          <CheckSquare2
                            size={16}
                            className="shrink-0"
                            style={{
                              color: "var(--color-status-done)",
                            }}
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="shrink-0"
                            style={{
                              color: "var(--color-primary)",
                            }}
                          />
                        )}

                        <span
                          className="
                              truncate
                              text-sm
                              transition-colors
                            "
                          style={{
                            color: "var(--color-text-primary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color =
                              "var(--color-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              "var(--color-text-primary)";
                          }}
                        >
                          {task.cardName}
                        </span>
                      </button>
                    </td>

                    {/* =================================================
                          PRIORITY
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    {/* =================================================
                          STATE
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <TaskStateBadge state={task.state} />
                    </td>

                    {/* =================================================
                          DUE DATE
                      ================================================== */}

                    <td className="px-5 py-3.5">
                      <div
                        className="flex items-center gap-2 text-sm"
                        style={{
                          color: isOverdue
                            ? "var(--color-priority-high)"
                            : "var(--color-text-secondary)",
                        }}
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
          <button
            type="button"
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
          </button>
        </div>
      )}
    </section>
  );
}
