"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, X } from "lucide-react";

import BoardList from "./BoardList";
import CreateListCard from "./CreateListCard";
import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";
/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type BoardListType = {
  id: string;
  boardId: string;
  listName: string;
  position: number;
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

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type Card = {
  id: string;
  boardId: string;
  boardListId: string;
  sprintId: string | null;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;
  position: number;
  reporterId: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type CardResponse = {
  message: string;
  cards: Card[];
};

/*
 * ============================================================
 * BOARD LISTS API
 * ============================================================
 */

async function fetchBoardLists(
  workspaceId: string,
  boardId: string,
): Promise<BoardListType[]> {
  const response = await fetch(
    `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Failed to fetch board lists");
  }

  return data.boardLists ?? data.lists ?? [];
}

/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function BoardCanvas({
  workspaceId,
  boardId,
}: BoardCanvasProps) {
  const queryClient = useQueryClient();

  /*
   * ==========================================================
   * GENERAL UI STATE
   * ==========================================================
   */

  const [closeMenuSignal, setCloseMenuSignal] = useState(0);

  /*
   * ==========================================================
   * SPRINT STATE
   * ==========================================================
   */

  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);

  const [isSprintCreateOpen, setIsSprintCreateOpen] = useState(false);

  const [isActivateSprintOpen, setIsActivateSprintOpen] = useState(false);

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  /*
   * ==========================================================
   * CREATE SPRINT FORM
   * ==========================================================
   */

  const [sprintName, setSprintName] = useState("");

  const [sprintGoal, setSprintGoal] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  /*
   * ============================================================
   * GET BOARD LISTS
   * ============================================================
   */

  const {
    data: lists = [],
    isLoading: isListsLoading,
    isError: isListsError,
  } = useQuery<BoardListType[]>({
    queryKey: ["board-lists", workspaceId, boardId],

    queryFn: () => fetchBoardLists(workspaceId, boardId),

    enabled: Boolean(workspaceId && boardId),
  });

  /*
   * ============================================================
   * GET SPRINTS
   * ============================================================
   */

  const {
    data: sprintData,
    isLoading: isSprintsLoading,
    isError: isSprintsError,
    error: sprintError,
  } = useQuery<SprintResponse>({
    queryKey: ["sprints", workspaceId, boardId],

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch sprints");
      }

      return data;
    },

    enabled: Boolean(workspaceId && boardId),
  });

  const sprints = sprintData?.sprints ?? [];

  /*
   * ============================================================
   * ACTIVE SPRINT
   * ============================================================
   */

  const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");

  /*
   * ============================================================
   * GET CARDS
   *
   * BoardCanvas only FETCHES cards.
   *
   * Card creation belongs to BoardList.
   * ============================================================
   */

  const {
    data: cardData,
    isLoading: isCardsLoading,
    isError: isCardsError,
    error: cardsError,
  } = useQuery<CardResponse>({
    queryKey: ["board-cards", workspaceId, boardId, activeSprint?.id ?? null],

    queryFn: async () => {
      if (!activeSprint?.id) {
        return {
          message: "No active sprint",
          cards: [],
        };
      }

      /*
       * IMPORTANT:
       * GET request uses query parameter.
       *
       * Do NOT send sprintId inside GET request body.
       */

      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card?sprintId=${encodeURIComponent(
          activeSprint.id,
        )}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch board cards");
      }

      return data;
    },

    enabled: Boolean(workspaceId && boardId && activeSprint?.id),
  });

  const cards = cardData?.cards ?? [];

  /*
   * ============================================================
   * CREATE SPRINT MUTATION
   * ============================================================
   */

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
        throw new Error(data?.message ?? "Failed to create sprint");
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
  });

  /*
   * ============================================================
   * CREATE SPRINT HANDLER
   * ============================================================
   */

  const handleCreateSprint = (payload: CreateSprintPayload) => {
    if (!payload.sprintName.trim()) {
      return;
    }

    if (!payload.startDate) {
      return;
    }

    if (!payload.endDate) {
      return;
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      return;
    }

    createSprintMutation.mutate({
      sprintName: payload.sprintName.trim(),

      goal: payload.goal.trim(),

      startDate: payload.startDate,

      endDate: payload.endDate,
    });
  };

  /*
   * ============================================================
   * ACTIVATE SPRINT MUTATION
   * ============================================================
   */

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
        throw new Error(data?.message ?? "Failed to activate sprint");
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

      queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });
    },
  });

  /*
   * ============================================================
   * ACTIVATE SPRINT HANDLER
   * ============================================================
   */

  const handleActivateSprint = (sprintId: string) => {
    if (!sprintId) {
      return;
    }

    activateSprintMutation.mutate(sprintId);
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isListsLoading || isSprintsLoading) {
    return (
      <section
        className="flex h-full min-h-screen items-center justify-center"
        style={{
          backgroundColor: "var(--color-board-bg)",

          color: "var(--color-text-secondary)",
        }}
      >
        Loading board...
      </section>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (isListsError || isSprintsError) {
    return (
      <section
        className="flex h-full min-h-screen items-center justify-center p-6"
        style={{
          backgroundColor: "var(--color-board-bg)",
        }}
      >
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-tag-red-bg)",

            borderColor: "var(--color-tag-red-text)",

            color: "var(--color-tag-red-text)",
          }}
        >
          Failed to load board data.
          {sprintError instanceof Error ? ` ${sprintError.message}` : ""}
          {cardsError instanceof Error ? ` ${cardsError.message}` : ""}
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * SORT LISTS
   * ============================================================
   */

  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  const handleCardClick = async (cardId: string) => {
    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch card");
      }

      setSelectedCard(data.card);
      setIsCardDetailsOpen(true);
    } catch (error) {
      console.error("GET_CARD_ERROR:", error);
    }
  };
  return (
    <main
      className="flex h-full min-h-0 flex-col overflow-hidden "
      style={{
        backgroundColor: "var(--color-column-bg)",
      }}
    >
      {/* TOP BAR */}
      <div
        className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-3 sm:px-5 lg:px-8"
        style={{
          borderColor: "var(--color-border)",

          backgroundColor: "var(--color-card-bg)",
        }}
      >
        {/* ==================================================
            SPRINT SELECTOR
            ================================================== */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsSprintMenuOpen((previous) => !previous)}
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
              ================================================= */}

          {isSprintMenuOpen && (
            <div
              className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border p-1.5 shadow-lg"
              style={{
                backgroundColor: "var(--color-card-bg)",

                borderColor: "var(--color-border)",
              }}
            >
              {sprints.length > 0 ? (
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {sprints.map((sprint) => (
                    <button
                      key={sprint.id}
                      type="button"
                      disabled={activateSprintMutation.isPending}
                      onClick={() => {
                        if (sprint.status === "ACTIVE") {
                          setIsSprintMenuOpen(false);

                          return;
                        }

                        setSelectedSprint(sprint);

                        setIsSprintMenuOpen(false);

                        setIsActivateSprintOpen(true);
                      }}
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
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
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

              <div
                className="my-1.5 border-t"
                style={{
                  borderColor: "var(--color-border)",
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setIsSprintMenuOpen(false);

                  createSprintMutation.reset();

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

        {/* ==================================================
            TABS
            ================================================== */}

        <div className="min-w-0 overflow-x-auto scrollbar-none">
          <div
            className="flex w-max items-center rounded-lg p-1"
            style={{
              backgroundColor: "var(--color-column-bg)",
            }}
          >
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

            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Backlog
            </button>

            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Burndown
            </button>
          </div>
        </div>
      </div>
      {/* ======================================================
          BOARD
          ====================================================== */}
      <section
        className="min-h-0 flex-1 overflow-hidden "
        style={{
          backgroundColor: "var(--color-border)",
        }}
        onClick={() => setCloseMenuSignal((previous) => previous + 1)}
      >
        <div className="flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-auto pl-6 pr-6 pt-8 pb-12">
          {sortedLists.map((list) => {
            const listCards = cards.filter(
              (card) =>
                card.boardListId === list.id &&
                !card.isArchived &&
                !card.deletedAt,
            );

            return (
              <div
                key={list.id}
                className="flex w-[280px] min-w-[280px] flex-col "
                onClick={(event) => event.stopPropagation()}
              >
                <BoardList
                  list={list}
                  workspaceId={workspaceId}
                  boardId={boardId}
                  closeMenuSignal={closeMenuSignal}
                  cards={listCards}
                  activeSprintId={activeSprint?.id ?? null}
                  isCardsLoading={isCardsLoading}
                  isCardsError={isCardsError}
                  onCardClick={handleCardClick}
                />
              </div>
            );
          })}

          <CreateListCard workspaceId={workspaceId} boardId={boardId} />
        </div>
      </section>

      {/* ======================================================
          CREATE SPRINT MODAL
          ====================================================== */}
      {isSprintCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",

              borderColor: "var(--color-border)",
            }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
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

              <button
                type="button"
                onClick={() => {
                  setIsSprintCreateOpen(false);

                  createSprintMutation.reset();
                }}
                className="rounded-md p-1"
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Sprint name */}

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
                    min={startDate || undefined}
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

            {createSprintMutation.isError && (
              <div
                className="mt-4 rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--color-tag-red-bg)",

                  borderColor: "var(--color-tag-red-text)",

                  color: "var(--color-tag-red-text)",
                }}
              >
                {createSprintMutation.error.message}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSprintCreateOpen(false);

                  createSprintMutation.reset();
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: "var(--color-border)",

                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  createSprintMutation.isPending ||
                  !sprintName.trim() ||
                  !startDate ||
                  !endDate ||
                  new Date(endDate) < new Date(startDate)
                }
                onClick={() =>
                  handleCreateSprint({
                    sprintName: sprintName.trim(),

                    goal: sprintGoal.trim(),

                    startDate,

                    endDate,
                  })
                }
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {createSprintMutation.isPending
                  ? "Creating..."
                  : "Create Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================
          ACTIVATE SPRINT MODAL
          ====================================================== */}
      {isActivateSprintOpen && selectedSprint && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",

              borderColor: "var(--color-border)",
            }}
          >
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
              className="mt-2 text-sm"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              The current active sprint will be marked as completed.
            </p>

            {activateSprintMutation.isError && (
              <div
                className="mt-4 rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--color-tag-red-bg)",

                  borderColor: "var(--color-tag-red-text)",

                  color: "var(--color-tag-red-text)",
                }}
              >
                {activateSprintMutation.error.message}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={activateSprintMutation.isPending}
                onClick={() => {
                  setIsActivateSprintOpen(false);

                  setSelectedSprint(null);

                  activateSprintMutation.reset();
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",

                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={activateSprintMutation.isPending}
                onClick={() => handleActivateSprint(selectedSprint.id)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {activateSprintMutation.isPending
                  ? "Activating..."
                  : "Activate Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
    CARD DETAILS MODAL
    ======================================================= */}

      {isCardDetailsOpen && selectedCard && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsCardDetailsOpen(false);
              setSelectedCard(null);
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border p-6 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  CARD-{selectedCard.cardNumber}
                </p>

                <h2
                  className="mt-1 text-xl font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {selectedCard.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCardDetailsOpen(false);
                  setSelectedCard(null);
                }}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Priority */}

            <div className="mt-5">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                style={getPriorityStyle(selectedCard.priority)}
              >
                {selectedCard.priority}
              </span>
            </div>

            {/* Description */}

            <div className="mt-6">
              <h3
                className="mb-2 text-sm font-semibold"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Description
              </h3>

              <CardDescriptionViewer
                content={selectedCard.description}
                className="text-sm leading-6"
              />
            </div>
            {/* Dates */}

            {(selectedCard.startDate || selectedCard.dueDate) && (
              <div className="mt-5">
                <h3
                  className="mb-2 text-sm font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Dates
                </h3>

                <div
                  className="flex items-center gap-2 text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {selectedCard.startDate && (
                    <span>{formatSprintDate(selectedCard.startDate)}</span>
                  )}

                  {selectedCard.startDate && selectedCard.dueDate && (
                    <span>→</span>
                  )}

                  {selectedCard.dueDate && (
                    <span>{formatSprintDate(selectedCard.dueDate)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/*
 * ============================================================
 * DATE HELPERS
 * ============================================================
 */

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

function getPriorityStyle(priority: CardPriority) {
  switch (priority) {
    case "critical":
      return {
        backgroundColor: "var(--color-tag-red-bg)",
        color: "var(--color-tag-red-text)",
      };

    case "show stopper":
      return {
        backgroundColor: "var(--color-tag-orange-bg)",
        color: "var(--color-tag-orange-text)",
      };

    case "major":
      return {
        backgroundColor: "var(--color-tag-yellow-bg)",
        color: "var(--color-tag-yellow-text)",
      };

    case "minor":
      return {
        backgroundColor: "var(--color-tag-blue-bg)",
        color: "var(--color-tag-blue-text)",
      };

    case "normal":
    default:
      return {
        backgroundColor: "var(--color-tag-green-bg)",
        color: "var(--color-tag-green-text)",
      };
  }
}
