"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BoardList from "./BoardList";
import CreateListCard from "./CreateListCard";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

type BoardListType = {
  id: string;
  boardId: string;
  listName: string;
  position: number;
};

type BoardListsResponse = {
  message: string;
  lists: BoardListType[];
};

type BoardCanvasProps = {
  workspaceId: string;
  boardId: string;
};

type Sprint = {
  id: string;
  boardId: string;
  name: string;
  goal: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
};

type SprintResponse = {
  message: string;
  sprints: Sprint[];
};

type CreateSprintPayload = {
  sprintName: string;
  goal: string;
  startDate: string;
  endDate: string;
};

async function fetchBoardLists(
  workspaceId: string,
  boardId: string,
): Promise<BoardListsResponse> {
  const response = await fetch(
    `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch board lists");
  }

  return response.json();
}

export default function BoardCanvas({
  workspaceId,
  boardId,
}: BoardCanvasProps) {
  const [closeMenuSignal, setCloseMenuSignal] = useState(0);

  // Sprint menu
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);

  // Create sprint modal
  const [isSprintCreateOpen, setIsSprintCreateOpen] = useState(false);

  // Activate sprint confirmation modal
  const [isActivateSprintOpen, setIsActivateSprintOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // Create sprint form
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const queryClient = useQueryClient();

  // =====================================================
  // GET BOARD LISTS
  // =====================================================

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board-lists", workspaceId, boardId],
    queryFn: () => fetchBoardLists(workspaceId, boardId),
    enabled: !!workspaceId && !!boardId,
  });

  // =====================================================
  // GET SPRINTS
  // =====================================================

  const {
    data: sprintData,
    isLoading: sprintLoading,
    error: sprintError,
  } = useQuery<SprintResponse>({
    queryKey: ["sprints", workspaceId, boardId],

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get sprints");
      }

      return data;
    },

    enabled: !!workspaceId && !!boardId,
  });

  // =====================================================
  // CREATE SPRINT
  // =====================================================

  const createSprintMutation = useMutation({
    mutationFn: async (payload: CreateSprintPayload) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create sprint");
      }

      return data;
    },

    onSuccess: () => {
      setIsSprintCreateOpen(false);

      setSprintName("");
      setSprintGoal("");
      setStartDate("");
      setEndDate("");

      queryClient.invalidateQueries({
        queryKey: ["sprints", workspaceId, boardId],
      });
    },

    onError: (error) => {
      console.error("CREATE_SPRINT_ERROR:", error);
    },
  });

  // =====================================================
  // ACTIVATE SPRINT
  // =====================================================

  const activateSprintMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sprintId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to activate sprint");
      }

      return data;
    },

    onSuccess: () => {
      setIsActivateSprintOpen(false);
      setSelectedSprint(null);
      setIsSprintMenuOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["sprints", workspaceId, boardId],
      });
    },

    onError: (error) => {
      console.error("ACTIVATE_SPRINT_ERROR:", error);
    },
  });

  // =====================================================
  // BOARD LIST LOADING
  // =====================================================

  if (isLoading) {
    return (
      <section
        className="min-h-screen overflow-hidden"
        style={{
          backgroundColor: "var(--color-board-bg)",
        }}
      >
        <div className="flex min-h-screen gap-4 overflow-x-auto p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 min-w-[280px] animate-pulse rounded-2xl"
              style={{
                backgroundColor: "var(--color-column-bg)",
                border: "1px solid var(--color-border)",
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  // =====================================================
  // BOARD LIST ERROR
  // =====================================================

  if (isError) {
    return (
      <section
        className="min-h-screen p-6"
        style={{
          backgroundColor: "var(--color-board-bg)",
        }}
      >
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-tag-red-text)",
            backgroundColor: "var(--color-tag-red-bg)",
            color: "var(--color-tag-red-text)",
          }}
        >
          Failed to load board lists.
        </div>
      </section>
    );
  }

  const lists = [...(data?.lists ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  // =====================================================
  // SPRINT LOADING
  // =====================================================

  if (sprintLoading) {
    return (
      <div
        className="border-b px-8 py-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Loading board...
        </p>
      </div>
    );
  }

  // =====================================================
  // SPRINT ERROR
  // =====================================================

  if (sprintError) {
    return (
      <div
        className="border-b px-8 py-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-priority-high)" }}>
          Failed to load sprint data.
        </p>
      </div>
    );
  }

  const sprints = sprintData?.sprints ?? [];

  const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");

  return (
    <main className="flex h-full min-h-0 flex-col">
      {/* =================================================
          SPRINT / TABS BAR
          ================================================== */}

      <div
        className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-3 sm:px-5 lg:px-8"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        {/* =================================================
            SPRINT SELECTOR
            ================================================== */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsSprintMenuOpen((prev) => !prev)}
            className="flex h-8 max-w-[220px] items-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-card-bg)",
            }}
          >
            <span className="truncate">
              {activeSprint?.name ?? "No active sprint"}
            </span>

            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform ${
                isSprintMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* =================================================
              SPRINT MENU
              ================================================== */}

          {isSprintMenuOpen && (
            <div
              className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border p-1.5 shadow-lg"
              style={{
                backgroundColor: "var(--color-card-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Existing Sprints */}

              {sprints.length > 0 ? (
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {sprints.map((sprint) => (
                    <button
                      key={sprint.id}
                      type="button"
                      onClick={() => {
                        // Already active sprint
                        if (sprint.status === "ACTIVE") {
                          setIsSprintMenuOpen(false);
                          return;
                        }

                        // Select sprint and open confirmation modal
                        setSelectedSprint(sprint);
                        setIsSprintMenuOpen(false);
                        setIsActivateSprintOpen(true);
                      }}
                      disabled={activateSprintMutation.isPending}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="truncate text-sm font-medium"
                            style={{
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {sprint.name}
                          </p>

                          {sprint.status === "ACTIVE" && (
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                              style={{
                                backgroundColor: "var(--color-tag-green-bg)",
                                color: "var(--color-tag-green-text)",
                              }}
                            >
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <p
                          className="mt-0.5 text-xs"
                          style={{
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {formatSprintDate(sprint.startDate)} –{" "}
                          {formatSprintDate(sprint.endDate)}
                        </p>
                      </div>

                      <span
                        className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor:
                            sprint.status === "ACTIVE"
                              ? "var(--color-tag-green-bg)"
                              : "var(--color-border)",
                          color:
                            sprint.status === "ACTIVE"
                              ? "var(--color-tag-green-text)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {sprint.status}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="px-3 py-3 text-sm"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  No sprints created yet.
                </div>
              )}

              {/* Divider */}

              <div
                className="my-1.5 border-t"
                style={{
                  borderColor: "var(--color-border)",
                }}
              />

              {/* New Sprint */}

              <button
                type="button"
                onClick={() => {
                  setIsSprintMenuOpen(false);
                  setIsSprintCreateOpen(true);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  color: "var(--color-primary)",
                }}
              >
                <Plus size={15} />

                <span>New Sprint</span>
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            TABS
            ================================================== */}

        <div className="min-w-0 overflow-x-auto scrollbar-none">
          <div
            className="flex w-max items-center rounded-lg p-1"
            style={{
              backgroundColor: "var(--color-column-bg)",
            }}
          >
            {/* Board */}

            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm sm:px-4 sm:text-sm"
              style={{
                backgroundColor: "var(--color-card-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              Board
            </button>

            {/* Backlog */}

            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs transition sm:px-4 sm:text-sm"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Backlog
            </button>

            {/* Burndown */}

            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs transition sm:px-4 sm:text-sm"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Burndown
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          BOARD
          ================================================== */}

      <section
        className="min-h-0 flex-1 overflow-hidden"
        style={{
          backgroundColor: "var(--color-border)",
        }}
        onClick={() => {
          setCloseMenuSignal((prev) => prev + 1);
        }}
      >
        <div className="flex min-h-screen gap-4 overflow-x-auto p-6">
          {lists.map((list) => (
            <BoardList
              key={list.id}
              list={list}
              workspaceId={workspaceId}
              boardId={boardId}
              closeMenuSignal={closeMenuSignal}
            />
          ))}

          <CreateListCard workspaceId={workspaceId} boardId={boardId} />
        </div>
      </section>

      {/* =================================================
          CREATE SPRINT MODAL
          ================================================== */}

      {isSprintCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Header */}

            <div className="mb-5">
              <h2
                className="text-lg font-semibold"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Create Sprint
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Create a sprint for this board.
              </p>
            </div>

            {/* Form */}

            <div className="space-y-4">
              {/* Sprint Name */}

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Sprint name
                </label>

                <input
                  type="text"
                  value={sprintName}
                  onChange={(event) => setSprintName(event.target.value)}
                  placeholder="Sprint 1"
                  className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Goal */}

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Sprint goal
                </label>

                <textarea
                  value={sprintGoal}
                  onChange={(event) => setSprintGoal(event.target.value)}
                  placeholder="What do you want to achieve?"
                  rows={3}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Dates */}

              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Start date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>

                {/* End Date */}

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    End date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-2">
              {/* Cancel */}

              <button
                type="button"
                onClick={() => {
                  setIsSprintCreateOpen(false);
                  createSprintMutation.reset();
                }}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
              >
                Cancel
              </button>

              {/* Create */}

              <button
                type="button"
                disabled={
                  createSprintMutation.isPending ||
                  !sprintName.trim() ||
                  !startDate ||
                  !endDate
                }
                onClick={() =>
                  createSprintMutation.mutate({
                    sprintName: sprintName.trim(),
                    goal: sprintGoal.trim(),
                    startDate,
                    endDate,
                  })
                }
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {createSprintMutation.isPending
                  ? "Creating..."
                  : "Create Sprint"}
              </button>
            </div>

            {/* Error */}

            {createSprintMutation.isError && (
              <p
                className="mt-3 text-sm"
                style={{
                  color: "var(--color-priority-high)",
                }}
              >
                {createSprintMutation.error.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          ACTIVATE SPRINT CONFIRMATION MODAL
          ================================================== */}

      {isActivateSprintOpen && selectedSprint && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Header */}

            <div className="mb-5">
              <h2
                className="text-lg font-semibold"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Activate Sprint
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Are you sure you want to activate{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {selectedSprint.name}
                </span>
                ?
              </p>

              <p
                className="mt-2 text-sm leading-6"
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                The current active sprint will be marked as completed.
              </p>
            </div>

            {/* Actions */}

            <div className="flex justify-end gap-2">
              {/* Cancel */}

              <button
                type="button"
                disabled={activateSprintMutation.isPending}
                onClick={() => {
                  setIsActivateSprintOpen(false);
                  setSelectedSprint(null);
                  activateSprintMutation.reset();
                }}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
              >
                Cancel
              </button>

              {/* Activate */}

              <button
                type="button"
                disabled={activateSprintMutation.isPending}
                onClick={() => {
                  activateSprintMutation.mutate(selectedSprint.id);
                }}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {activateSprintMutation.isPending
                  ? "Activating..."
                  : "Activate Sprint"}
              </button>
            </div>

            {/* Error */}

            {activateSprintMutation.isError && (
              <p
                className="mt-3 text-sm"
                style={{
                  color: "var(--color-priority-high)",
                }}
              >
                {activateSprintMutation.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function formatSprintDate(date: string) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
