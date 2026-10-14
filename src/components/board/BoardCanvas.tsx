"use client";

import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { ChevronDown, Plus, X } from "lucide-react";

import BoardList from "./BoardList";

import CreateListCard from "./CreateListCard";

/* dray and drop  */

import {
  DndContext,
  PointerSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  DragOverlay,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableBoardList from "./SortableBoardList";

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

  sprintName?: string | null;

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

export default function BoardCanvas({
  workspaceId,

  boardId,
}: BoardCanvasProps) {
  const queryClient = useQueryClient();

  const router = useRouter();

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

  const listQueryKey = ["board-lists", workspaceId, boardId];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const reorderListsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList`,

        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ orderedIds }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to reorder board lists");
      }

      return data;
    },

    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({
        queryKey: listQueryKey,
      });

      const previousLists =
        queryClient.getQueryData<BoardListType[]>(listQueryKey);

      if (previousLists) {
        const listById = new Map(previousLists.map((list) => [list.id, list]));

        const reorderedLists = orderedIds

          .map((id) => listById.get(id))

          .filter((list): list is BoardListType => list !== undefined)

          .map((list, index) => ({
            ...list,

            position: index + 1,
          }));

        queryClient.setQueryData<BoardListType[]>(listQueryKey, reorderedLists);
      }

      return { previousLists };
    },

    onError: (_error, _orderedIds, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(listQueryKey, context.previousLists);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: listQueryKey,
      });
    },
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

  // Preview ordering lives only while a card is being dragged.
  const [previewCards, setPreviewCards] = useState<Card[] | null>(null);
  const previewCardsRef = useRef<Card[] | null>(null);
  const initialCardsRef = useRef<Card[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const displayedCards = previewCards ?? cards;
  const activeCard = activeCardId
    ? (initialCardsRef.current.find((card) => card.id === activeCardId) ?? null)
    : null;

  const cardQueryKey = [
    "board-cards",

    workspaceId,

    boardId,

    activeSprint?.id ?? null,
  ];

  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,

      destinationListId,

      position,
    }: {
      cardId: string;

      destinationListId: string;

      position: number;
    }) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`,

        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "moveCard",
            destinationListId,
            position,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to move card");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cardQueryKey,
      });
    },

    onError: (error) => {
      console.error("MOVE_CARD_ERROR:", error);
      queryClient.invalidateQueries({ queryKey: cardQueryKey });
    },
  });

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

  // Keep list sorting separate from card collision detection.
  const collisionDetection: CollisionDetection = (args) => {
    const isCard = args.active.data.current?.type === "card";
    const containers = args.droppableContainers.filter((container) => {
      const type = container.data.current?.type;
      return isCard ? type === "card" || type === "list" : !type;
    });
    const restrictedArgs = { ...args, droppableContainers: containers };
    if (!isCard) return closestCenter(restrictedArgs);

    const pointerHits = pointerWithin(restrictedArgs);
    if (pointerHits.length) {
      // Prefer a card over its containing list when both overlap the pointer.
      const onCard = pointerHits.filter(
        (collision) =>
          containers.find((container) => container.id === collision.id)?.data
            .current?.type === "card",
      );
      return onCard.length ? onCard : pointerHits;
    }
    return rectIntersection(restrictedArgs);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type !== "card") return;
    const original = cards.map((card) => ({ ...card }));
    initialCardsRef.current = original;
    previewCardsRef.current = original;
    setPreviewCards(original);
    setActiveCardId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (active.data.current?.type !== "card" || !over || active.id === over.id)
      return;
    const current = previewCardsRef.current;
    if (!current) return;

    const draggedId = String(active.id);
    const source = current.find((card) => card.id === draggedId);
    if (!source) return;

    const overType = over.data.current?.type;
    const hovered = current.find((card) => card.id === String(over.id));
    const destinationId =
      overType === "list"
        ? (over.data.current?.listId as string | undefined)
        : hovered?.boardListId;
    if (!destinationId) return;

    const destinationCards = current
      .filter(
        (card) => card.boardListId === destinationId && card.id !== draggedId,
      )
      .sort((a, b) => a.position - b.position);

    let index = destinationCards.length;
    if (overType === "card" && hovered && hovered.id !== draggedId) {
      index = destinationCards.findIndex((card) => card.id === hovered.id);
      if (index < 0) index = destinationCards.length;
      // Place after the hovered card when moving downward in the same column.
      if (source.boardListId === destinationId) {
        const ordered = current
          .filter((card) => card.boardListId === destinationId)
          .sort((a, b) => a.position - b.position);
        const from = ordered.findIndex((card) => card.id === draggedId);
        const to = ordered.findIndex((card) => card.id === hovered.id);
        if (from < to) index += 1;
      }
    }

    const reordered = [...destinationCards];
    reordered.splice(index, 0, { ...source, boardListId: destinationId });

    // The other source column must be renumbered too.
    const sourceRemaining = current
      .filter(
        (card) =>
          card.boardListId === source.boardListId && card.id !== draggedId,
      )
      .sort((a, b) => a.position - b.position);
    const updated = new Map<string, Card>();
    for (const card of current) updated.set(card.id, card);
    sourceRemaining.forEach((card, i) =>
      updated.set(card.id, { ...card, position: i + 1 }),
    );
    reordered.forEach((card, i) =>
      updated.set(card.id, { ...card, position: i + 1 }),
    );
    const next = current.map((card) => updated.get(card.id)!);

    // Avoid unnecessary renders when hovering over the same insertion point.
    if (
      current.every(
        (card, i) =>
          card.boardListId === next[i].boardListId &&
          card.position === next[i].position,
      )
    )
      return;
    previewCardsRef.current = next;
    setPreviewCards(next);
  };

  const resetDrag = () => {
    previewCardsRef.current = null;
    setPreviewCards(null);
    setActiveCardId(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.data.current?.type !== "card") {
      resetDrag();
      if (!over || active.id === over.id) return;
      const ids = sortedLists.map((list) => list.id);
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (from !== -1 && to !== -1 && from !== to) {
        reorderListsMutation.mutate(arrayMove(ids, from, to));
      }
      return;
    }

    const original = initialCardsRef.current;
    const finalCards = previewCardsRef.current;
    const before = original.find((card) => card.id === String(active.id));
    const after = finalCards?.find((card) => card.id === String(active.id));
    resetDrag();
    if (!over || !before || !after) return;
    if (
      before.boardListId === after.boardListId &&
      before.position === after.position
    )
      return;

    // Show the result immediately; the API is called just once after drop.
    queryClient.setQueryData<CardResponse>(cardQueryKey, (old) =>
      old ? { ...old, cards: finalCards! } : old,
    );
    moveCardMutation.mutate({
      cardId: after.id,
      destinationListId: after.boardListId,
      position: after.position,
    });
  };
  const handleCardClick = (cardId: string) => {
    router.push(
      `/dashboard/workspace/${workspaceId}/board/${boardId}/card/${cardId}`,
    );
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



            \\================================================== */}

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



              \\================================================= */}

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
      </div>

      {/* ======================================================



          BOARD



          \\====================================================== */}

      <section
        className="min-h-0 flex-1 overflow-hidden "
        style={{
          backgroundColor: "var(--color-border)",
        }}
        onClick={() => setCloseMenuSignal((previous) => previous + 1)}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={resetDrag}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full min-h-0 items-start gap-0 overflow-auto pl-6 pr-6 pb-12">
            <SortableContext
              items={sortedLists.map((list) => list.id)}
              strategy={horizontalListSortingStrategy}
            >
              {sortedLists.map((list) => {
                const listCards = displayedCards.filter(
                  (card) =>
                    card.boardListId === list.id &&
                    !card.isArchived &&
                    !card.deletedAt,
                );

                return (
                  <SortableBoardList key={list.id} id={list.id}>
                    <BoardList
                      list={list}
                      workspaceId={workspaceId}
                      boardId={boardId}
                      closeMenuSignal={closeMenuSignal}
                      cards={listCards}
                      activeSprintId={activeSprint?.id ?? null}
                      activeSprintName={activeSprint?.name ?? null}
                      isCardsLoading={isCardsLoading}
                      isCardsError={isCardsError}
                      onCardClick={handleCardClick}
                    />
                  </SortableBoardList>
                );
              })}
            </SortableContext>

            <CreateListCard workspaceId={workspaceId} boardId={boardId} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard ? (
              <div
                className="w-[280px] rounded-xl border p-3 shadow-2xl"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-text-primary)",
                  cursor: "grabbing",
                }}
              >
                <div className="mb-1 text-xs opacity-60">
                  #{activeCard.cardNumber}
                </div>
                <div className="text-sm font-semibold">{activeCard.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>

      {/* ======================================================



          CREATE SPRINT MODAL



          \\====================================================== */}

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



          \\====================================================== */}

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
