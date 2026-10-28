"use client";

import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { ChevronDown, Plus, X, Pencil, Trash2 } from "lucide-react";
import BoardList from "./BoardList";

import CreateListCard from "./CreateListCard";
import { useToast } from "@/components/ui/ToastProvider";

import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";
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
  carryUnresolvedTickets?: boolean;
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
  carryUnresolvedTickets: boolean;
};

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type Card = {
  id: string;

  boardId: string;

  boardListId: string;

  sprintId: string[];

  sprintName?: string | null;

  cardNumber: number;

  title: string;

  description: string | null;

  priority: CardPriority;
  type: "bug" | "feature" | "task" | "tbd";
  position: number;
  assignedTo: string | null;
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

type BoardMember = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member";
};

type BoardMemberResponse = {
  message: string;
  data: BoardMember[];
};
const UNASSIGNED = "__unassigned__";
// Width of every board list column: the list header and each member's status
// cell below it must use the same value so the grid stays aligned.
const LIST_COLUMN_WIDTH = "w-[260px] min-w-[260px] max-w-[260px]";
// The board-members endpoint returns data: [{ userId, name, email, role }].
// Use the user ID: cards.assignedTo references users.id, not boardMembers.id.
const memberKey = (member: BoardMember) => member.userId;
const memberName = (member: BoardMember) =>
  member.name?.trim() || member.email || "Board member";

//BOARD LISTS API

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
  const { showToast } = useToast();

  const router = useRouter();

  const [closeMenuSignal, setCloseMenuSignal] = useState(0);

  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);

  const [isSprintCreateOpen, setIsSprintCreateOpen] = useState(false);

  const [isActivateSprintOpen, setIsActivateSprintOpen] = useState(false);

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const [sprintName, setSprintName] = useState("");

  const [sprintGoal, setSprintGoal] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [carryUnresolvedTickets, setCarryUnresolvedTickets] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null);
  // * GET BOARD LISTS
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

  // GET SPRINT
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

  const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");

  /* GET CARDS
BoardCanvas only FETCHES cards.
Card creation belongs to BoardList.*/
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

  /* Get board member  */

  const {
    data: boardMemberData,
    isLoading: isMembersLoading,
    isError: isMembersError,
    error: membersError,
  } = useQuery<BoardMemberResponse>({
    queryKey: ["board-members-all", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardMembers?all=true`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch board members");
      }

      return data;
    },
    enabled: Boolean(workspaceId && boardId),
  });

  const members = boardMemberData?.data ?? [];
  const cards = cardData?.cards ?? [];

  // Preview ordering lives only while a card is being dragged.
  const [previewCards, setPreviewCards] = useState<Card[] | null>(null);
  const previewCardsRef = useRef<Card[] | null>(null);
  const initialCardsRef = useRef<Card[]>([]);

  // const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const displayedCards = previewCards ?? cards;

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
      assignedTo,
    }: {
      cardId: string;
      destinationListId: string;
      position: number;
      assignedTo: string | null;
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
            assignedTo,
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

    // Errors are shown inline in the sprint form, so only success toasts.
    onSuccess: (data) => {
      showToast(data?.message ?? "Sprint created successfully.", "success");
      setIsSprintCreateOpen(false);

      setSprintName("");

      setSprintGoal("");

      setStartDate("");

      setEndDate("");
      setCarryUnresolvedTickets(false);
      setIsDatePickerOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["sprints", workspaceId, boardId],
      });
    },
  });
  const updateSprintMutation = useMutation({
    mutationFn: async (payload: CreateSprintPayload & { sprintId: string }) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to update sprint");
      }

      return data;
    },

    onSuccess: () => {
      setIsSprintCreateOpen(false);
      setEditingSprint(null);
      setSprintName("");
      setSprintGoal("");
      setStartDate("");
      setEndDate("");
      setCarryUnresolvedTickets(false);
      setIsDatePickerOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["sprints", workspaceId, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });
    },
  });
  const deleteSprintMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sprintId }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to delete sprint");
      }

      return data;
    },

    onSuccess: () => {
      setDeletingSprint(null);

      queryClient.invalidateQueries({
        queryKey: ["sprints", workspaceId, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });
    },
  });
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
      carryUnresolvedTickets: payload.carryUnresolvedTickets,
    });
  };
  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);

    setSprintName(sprint.name);
    setSprintGoal(sprint.goal ?? "");
    setStartDate(sprint.startDate.slice(0, 10));
    setEndDate(sprint.endDate.slice(0, 10));
    setCarryUnresolvedTickets(sprint.carryUnresolvedTickets ?? false);

    updateSprintMutation.reset();
    setIsDatePickerOpen(false);
    setIsSprintMenuOpen(false);
    setIsSprintCreateOpen(true);
  };
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

  const handleActivateSprint = (sprintId: string) => {
    if (!sprintId) {
      return;
    }

    activateSprintMutation.mutate(sprintId);
  };

  const handleUpdateSprint = () => {
    if (!editingSprint || !sprintName.trim() || !startDate || !endDate) {
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      return;
    }

    updateSprintMutation.mutate({
      sprintId: editingSprint.id,
      sprintName: sprintName.trim(),
      goal: sprintGoal.trim(),
      startDate,
      endDate,
      carryUnresolvedTickets,
    });
  };
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

  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  // Card collisions are limited to member/list cells and cards. List headers
  // remain independently draggable, with no duplicate sortable IDs.
  const collisionDetection: CollisionDetection = (args) => {
    const isCard = args.active.data.current?.type === "card";
    const containers = args.droppableContainers.filter((container) => {
      const type = container.data.current?.type;
      return isCard ? type === "card" || type === "cell" : !type;
    });
    const restricted = { ...args, droppableContainers: containers };
    if (!isCard) return closestCenter(restricted);
    const hits = pointerWithin(restricted);
    if (hits.length) {
      const cards = hits.filter(
        (hit) =>
          containers.find((item) => item.id === hit.id)?.data.current?.type ===
          "card",
      );
      return cards.length ? cards : hits;
    }
    return rectIntersection(restricted);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type !== "card") return;
    const original = cards.map((card) => ({ ...card }));
    initialCardsRef.current = original;
    previewCardsRef.current = original;
    setPreviewCards(original);
    setActiveCard(
      original.find((card) => card.id === String(active.id)) ?? null,
    );
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (active.data.current?.type !== "card" || !over || active.id === over.id)
      return;
    const current = previewCardsRef.current;
    if (!current) return;
    const source = current.find((card) => card.id === String(active.id));
    if (!source) return;

    const hovered = current.find((card) => card.id === String(over.id));
    const meta = over.data.current;
    const destinationListId =
      meta?.type === "cell" ? (meta.listId as string) : hovered?.boardListId;
    const assignedTo =
      meta?.type === "cell"
        ? ((meta.memberId as string | null) ?? null)
        : (hovered?.assignedTo ?? null);
    if (!destinationListId) return;
    // Sort and position are scoped to the pair (member, list).
    const sameCell = (card: Card, listId: string, member: string | null) =>
      card.boardListId === listId && (card.assignedTo ?? null) === member;
    const destination = current
      .filter(
        (card) =>
          card.id !== source.id &&
          sameCell(card, destinationListId, assignedTo),
      )
      .sort((a, b) => a.position - b.position);
    let insertAt = destination.length;
    if (meta?.type === "card" && hovered) {
      const found = destination.findIndex((card) => card.id === hovered.id);
      if (found >= 0) {
        insertAt = found;
        if (sameCell(source, destinationListId, assignedTo)) {
          const originalOrder = current
            .filter((card) => sameCell(card, destinationListId, assignedTo))
            .sort((a, b) => a.position - b.position);
          if (
            originalOrder.findIndex((c) => c.id === source.id) >
            originalOrder.findIndex((c) => c.id === hovered.id)
          ) {
            // moving upward: insert before target
          } else {
            insertAt = Math.min(found + 1, destination.length);
          }
        }
      }
    }
    const reordered = [...destination];
    reordered.splice(insertAt, 0, {
      ...source,
      boardListId: destinationListId,
      assignedTo,
    });
    const sourceRemaining = current
      .filter(
        (card) =>
          card.id !== source.id &&
          sameCell(card, source.boardListId, source.assignedTo ?? null),
      )
      .sort((a, b) => a.position - b.position);
    const updated = new Map(current.map((card) => [card.id, card]));
    sourceRemaining.forEach((card, index) =>
      updated.set(card.id, { ...card, position: index + 1 }),
    );
    reordered.forEach((card, index) =>
      updated.set(card.id, { ...card, position: index + 1 }),
    );
    const next = current.map((card) => updated.get(card.id)!);
    if (
      current.every(
        (card, index) =>
          card.boardListId === next[index].boardListId &&
          (card.assignedTo ?? null) === (next[index].assignedTo ?? null) &&
          card.position === next[index].position,
      )
    )
      return;
    previewCardsRef.current = next;
    setPreviewCards(next);
  };

  const resetDrag = () => {
    previewCardsRef.current = null;
    setActiveCard(null);
    setPreviewCards(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.data.current?.type !== "card") {
      resetDrag();
      if (!over || active.id === over.id) return;
      const ids = sortedLists.map((list) => list.id);
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (from >= 0 && to >= 0 && from !== to) {
        reorderListsMutation.mutate(arrayMove(ids, from, to));
      }
      return;
    }
    const finalCards = previewCardsRef.current;
    const before = initialCardsRef.current.find(
      (card) => card.id === String(active.id),
    );
    const after = finalCards?.find((card) => card.id === String(active.id));
    resetDrag();
    if (!over || !before || !after || !finalCards) return;
    if (
      before.boardListId === after.boardListId &&
      (before.assignedTo ?? null) === (after.assignedTo ?? null) &&
      before.position === after.position
    )
      return;
    queryClient.setQueryData<CardResponse>(cardQueryKey, (old) =>
      old ? { ...old, cards: finalCards } : old,
    );
    moveCardMutation.mutate({
      cardId: after.id,
      destinationListId: after.boardListId,
      assignedTo: after.assignedTo ?? null,
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
                  {/* {sprints.map((sprint) => (
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
                  ))} */}

                  {sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className="rounded-md px-2 py-2 transition hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <button
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
                          className="min-w-0 flex-1 text-left disabled:opacity-60"
                        >
                          <div className="flex items-center gap-2">
                            <p
                              className="truncate text-sm font-medium"
                              style={{ color: "var(--color-text-primary)" }}
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
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {formatSprintDate(sprint.startDate)} –{" "}
                            {formatSprintDate(sprint.endDate)}
                          </p>

                          <p
                            className="mt-0.5 text-[10px] font-semibold"
                            style={{
                              color:
                                sprint.status === "ACTIVE"
                                  ? "var(--color-tag-green-text)"
                                  : "var(--color-text-secondary)",
                            }}
                          >
                            {sprint.status}
                          </p>
                        </button>

                        <button
                          type="button"
                          title="Edit sprint"
                          aria-label={`Edit ${sprint.name}`}
                          onClick={() => handleEditSprint(sprint)}
                          className="rounded-md p-2 hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          title="Delete sprint"
                          aria-label={`Delete ${sprint.name}`}
                          onClick={() => {
                            setDeletingSprint(sprint);
                            setIsSprintMenuOpen(false);
                            deleteSprintMutation.reset();
                          }}
                          className="rounded-md p-2 hover:bg-black/10 dark:hover:bg-white/10"
                          style={{ color: "var(--color-tag-red-text)" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
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
                  setEditingSprint(null);
                  setSprintName("");
                  setSprintGoal("");
                  setStartDate("");
                  setEndDate("");
                  setCarryUnresolvedTickets(false);
                  setIsDatePickerOpen(false);
                  createSprintMutation.reset();
                  updateSprintMutation.reset();
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
          backgroundColor: "var(--color-column-bg)",
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
          <div className="h-full overflow-auto">
            <div className="min-w-max">
              {/* Status headers. Each list has one sortable ID only. */}
              <div
                className="sticky top-0 z-30 flex"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="sticky left-0 z-40 w-52 shrink-0 border-r px-3 py-4 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--color-card-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Assignee / Status
                </div>
                <SortableContext
                  items={sortedLists.map((list) => list.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {sortedLists.map((list) => (
                    // Keep the sortable wrapper and its child the exact same
                    // width as every status cell in the member rows below.
                    <div
                      key={list.id}
                      className={`${LIST_COLUMN_WIDTH} shrink-0 [&>*]:!w-full [&>*]:!min-w-0 [&>*]:!max-w-full`}
                    >
                      <SortableBoardList id={list.id}>
                        <BoardList
                          list={list}
                          workspaceId={workspaceId}
                          boardId={boardId}
                          closeMenuSignal={closeMenuSignal}
                          cards={displayedCards.filter(
                            (card) =>
                              card.boardListId === list.id &&
                              !card.isArchived &&
                              !card.deletedAt,
                          )}
                          activeSprintId={activeSprint?.id ?? null}
                          activeSprintName={activeSprint?.name ?? null}
                          headerOnly
                          hideAddCard
                          seamless
                        />
                      </SortableBoardList>
                    </div>
                  ))}
                </SortableContext>
                <div
                  className="w-[290px] shrink-0 border-r"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <CreateListCard workspaceId={workspaceId} boardId={boardId} />
                </div>
              </div>
              {/* All active board members, even those with zero tickets.
                  Show a fallback row when an assigned user is no longer active
                  or the member query is temporarily incomplete, so cards
                  never silently disappear from the board. */}
              {[
                ...members
                  .filter((member) => Boolean(memberKey(member)))
                  .map((member) => ({
                    id: memberKey(member),
                    name: memberName(member),
                  })),
                ...Array.from(
                  new Set(
                    displayedCards
                      .filter((card) => !card.isArchived && !card.deletedAt)
                      .map((card) => card.assignedTo)
                      .filter((id): id is string => Boolean(id)),
                  ),
                )
                  .filter((id) => !members.some((m) => m.userId === id))
                  .map((id) => ({
                    id,
                    name: `Unknown member (${id.slice(0, 8)})`,
                  })),
                { id: UNASSIGNED, name: "Unassigned" },
              ].map((member) => {
                const memberId = member.id === UNASSIGNED ? null : member.id;
                const memberCards = displayedCards.filter(
                  (card) =>
                    (card.assignedTo ?? null) === memberId &&
                    !card.isArchived &&
                    !card.deletedAt,
                );
                return (
                  <div
                    key={member.id}
                    className="flex min-h-[164px] items-stretch border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="sticky left-0 z-20 flex w-52 shrink-0 flex-col gap-2 border-r p-3"
                      style={{
                        backgroundColor: "var(--color-card-bg)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            "var(--color-primary-soft, var(--color-border))",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div
                        className="max-w-full break-words text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {member.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {memberCards.length} tickets
                      </div>
                    </div>
                    {sortedLists.map((list) => {
                      const cellCards = memberCards.filter(
                        (card) => card.boardListId === list.id,
                      );
                      return (
                        <div
                          key={`${member.id}-${list.id}`}
                          className={`${LIST_COLUMN_WIDTH} shrink-0 border-r`}
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <BoardList
                            list={list}
                            workspaceId={workspaceId}
                            boardId={boardId}
                            closeMenuSignal={closeMenuSignal}
                            cards={cellCards}
                            activeSprintId={activeSprint?.id ?? null}
                            activeSprintName={activeSprint?.name ?? null}
                            isCardsLoading={isCardsLoading}
                            isCardsError={isCardsError}
                            onCardClick={handleCardClick}
                            memberId={memberId}
                            hideHeader
                            hideAddCard={false}
                            seamless
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {isMembersLoading && (
                <p className="p-4 text-sm">Loading board members…</p>
              )}
              {isMembersError && (
                <p className="p-4 text-sm text-[var(--color-tag-red-text)]" role="alert">
                  Failed to load board members:{" "}
                  {membersError instanceof Error
                    ? membersError.message
                    : "Unknown error"}
                </p>
              )}
            </div>
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
                  {/* Create Sprint */}
                  {editingSprint ? "Edit Sprint" : "Create Sprint"}
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {editingSprint
                    ? "Update this sprint's details."
                    : "Create a sprint for this board."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSprintCreateOpen(false);

                  setEditingSprint(null);
                  setIsDatePickerOpen(false);
                  createSprintMutation.reset();
                  updateSprintMutation.reset();
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

              {/* Sprint date range — one calendar for both dates */}
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Sprint dates
                </label>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((open) => !open)}
                  className="h-10 w-full rounded-lg border px-3 text-left text-sm"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {startDate && endDate
                    ? `${format(new Date(`${startDate}T12:00:00`), "MMM d, yyyy")} – ${format(
                        new Date(`${endDate}T12:00:00`),
                        "MMM d, yyyy",
                      )}`
                    : startDate
                      ? `${format(new Date(`${startDate}T12:00:00`), "MMM d, yyyy")} – Select end date`
                      : "Select start and end dates"}
                </button>

                {isDatePickerOpen && (
                  <div
                    className="mt-2 rounded-lg border p-3"
                    style={{
                      backgroundColor: "var(--color-card-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    <p
                      className="mb-2 text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {!startDate
                        ? "Select the start date"
                        : !endDate
                          ? "Now select the end date"
                          : "Select another range if needed"}
                    </p>

                    <DayPicker
                      mode="range"
                      selected={{
                        from: startDate
                          ? new Date(`${startDate}T12:00:00`)
                          : undefined,
                        to: endDate
                          ? new Date(`${endDate}T12:00:00`)
                          : undefined,
                      }}
                      onSelect={(range: DateRange | undefined) => {
                        if (!range?.from) {
                          setStartDate("");
                          setEndDate("");
                          return;
                        }

                        setStartDate(format(range.from, "yyyy-MM-dd"));

                        setEndDate(
                          range.to ? format(range.to, "yyyy-MM-dd") : "",
                        );
                      }}
                      disabled={(date) =>
                        Boolean(startDate && date < new Date(startDate))
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      disabled={!startDate || !endDate}
                      className="mt-2 h-9 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="carryUnresolvedTickets"
                  type="checkbox"
                  checked={carryUnresolvedTickets}
                  onChange={(event) =>
                    setCarryUnresolvedTickets(event.target.checked)
                  }
                  className="h-4 w-4 shrink-0 cursor-pointer"
                  style={{ accentColor: "var(--color-primary)" }}
                />

                <div>
                  <label
                    htmlFor="carryUnresolvedTickets"
                    className="cursor-pointer text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Carry unresolved tickets forward
                  </label>
                </div>
              </div>
            </div>

            {(editingSprint
              ? updateSprintMutation.isError
              : createSprintMutation.isError) && (
              <div
                className="mt-4 rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--color-tag-red-bg)",
                  borderColor: "var(--color-tag-red-text)",
                  color: "var(--color-tag-red-text)",
                }}
              >
                {editingSprint
                  ? updateSprintMutation.error?.message
                  : createSprintMutation.error?.message}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSprintCreateOpen(false);
                  setEditingSprint(null);
                  setIsDatePickerOpen(false);
                  createSprintMutation.reset();
                  updateSprintMutation.reset();
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: "var(--color-border)",

                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>

              {/* <button
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
                    carryUnresolvedTickets,
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
              </button> */}
              <button
                type="button"
                disabled={
                  createSprintMutation.isPending ||
                  updateSprintMutation.isPending ||
                  !sprintName.trim() ||
                  !startDate ||
                  !endDate ||
                  new Date(endDate) < new Date(startDate)
                }
                onClick={() => {
                  if (editingSprint) {
                    handleUpdateSprint();
                  } else {
                    handleCreateSprint({
                      sprintName: sprintName.trim(),
                      goal: sprintGoal.trim(),
                      startDate,
                      endDate,
                      carryUnresolvedTickets,
                    });
                  }
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {updateSprintMutation.isPending
                  ? "Saving..."
                  : createSprintMutation.isPending
                    ? "Creating..."
                    : editingSprint
                      ? "Save Changes"
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
      {/* delete model */}
      {deletingSprint && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Delete Sprint
            </h2>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {deletingSprint.name}
              </strong>
              ? This action cannot be undone.
            </p>

            {deleteSprintMutation.isError && (
              <div
                className="mt-4 rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--color-tag-red-bg)",
                  borderColor: "var(--color-tag-red-text)",
                  color: "var(--color-tag-red-text)",
                }}
              >
                {deleteSprintMutation.error.message}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteSprintMutation.isPending}
                onClick={() => {
                  setDeletingSprint(null);
                  deleteSprintMutation.reset();
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
                disabled={deleteSprintMutation.isPending}
                onClick={() => deleteSprintMutation.mutate(deletingSprint.id)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-tag-red-text)",
                }}
              >
                {deleteSprintMutation.isPending
                  ? "Deleting..."
                  : "Delete Sprint"}
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
