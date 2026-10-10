"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Plus, X } from "lucide-react";
import CardDescriptionEditor from "@/components/card/CardDescriptionEditor";
/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type CardType = {
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

type CardProps = {
  card?: CardType;
  workspaceId: string;
  boardId: string;
  listId: string;
  listName: string;
  sprintName?: string | null;

  activeSprintId?: string | null;

  onCreateClick?: () => void;

  onCardClick?: (cardId: string) => void;
};

type CreateCardPayload = {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: CardPriority;
  sprintId: string | null;
  sprintName?: string | null;
  listId: string;
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const priorities: CardPriority[] = [
  "normal",
  "show stopper",
  "critical",
  "major",
  "minor",
];

const getPriorityColor = (priority: CardPriority) => {
  switch (priority) {
    case "normal":
      return "#3b82f6"; // Blue

    case "show stopper":
      return "#a855f7"; // Purple

    case "critical":
      return "#ef4444"; // Red

    case "major":
      return "#eab308"; // Yellow

    case "minor":
      return "#9ca3af"; // Gray

    default:
      return "var(--color-border)";
  }
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */
export default function CreateCard({
  card,
  workspaceId,
  boardId,
  listId,
  listName,
  sprintName,
  activeSprintId = null,
  onCreateClick,
  onCardClick,
}: CardProps) {
  /*
   * ============================================================
   * QUERY CLIENT
   * ============================================================
   */

  const queryClient = useQueryClient();

  /*
   * ============================================================
   * CREATE CARD MODAL
   * ============================================================
   */

  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);

  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [cardStartDate, setCardStartDate] = useState("");
  const [cardEndDate, setCardEndDate] = useState("");

  const [cardPriority, setCardPriority] = useState<CardPriority>("normal");

  /*
   * ============================================================
   * CREATE CARD MUTATION
   * ============================================================
   */

  const createCardMutation = useMutation({
    mutationFn: async (payload: CreateCardPayload) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to create card");
      }

      return data;
    },

    onSuccess: () => {
      /*
       * BoardCanvas owns the cards GET query.
       *
       * Invalidate it so the newly-created card
       * appears inside the correct BoardList.
       */
      queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });

      closeCreateCardModal();
    },

    onError: (error) => {
      console.error("CREATE_CARD_ERROR:", error);
    },
  });

  /*
   * ============================================================
   * OPEN CREATE CARD
   * ============================================================
   */

  const openCreateCardModal = () => {
    createCardMutation.reset();

    setCardTitle("");
    setCardDescription("");
    setCardStartDate("");
    setCardEndDate("");
    setCardPriority("normal");

    setIsCreateCardOpen(true);

    onCreateClick?.();
  };

  /*
   * ============================================================
   * CLOSE CREATE CARD
   * ============================================================
   */

  const closeCreateCardModal = () => {
    if (createCardMutation.isPending) {
      return;
    }

    setIsCreateCardOpen(false);

    setCardTitle("");
    setCardDescription("");
    setCardStartDate("");
    setCardEndDate("");
    setCardPriority("normal");

    createCardMutation.reset();
  };

  /*
   * ============================================================
   * CREATE CARD
   * ============================================================
   */

  const handleCreateCard = () => {
    const title = cardTitle.trim();

    if (!title) {
      return;
    }

    createCardMutation.mutate({
      title,

      description: cardDescription.trim(),

      startDate: cardStartDate,

      dueDate: cardEndDate,

      priority: cardPriority,

      /*
       * sprint_id is nullable.
       *
       * Never send an empty string.
       */
      sprintId: activeSprintId ?? null,
      sprintName: sprintName ?? null,

      listId,
    });
  };

  /*
   * ============================================================
   * RENDER EXISTING CARD
   * ============================================================
   */

  /*
   * ============================================================
   * RENDER EXISTING CARD
   * ============================================================
   */

  if (card) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onCardClick?.(card.id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardClick?.(card.id);
          }
        }}
        className="group cursor-pointer rounded-lg border border-l-4 p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
        style={{
          backgroundColor: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
          borderLeftColor: getPriorityColor(card.priority),
        }}
      >
        <div className="pr-1">
          {/* Card number + priority */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <span
              className="text-[10px] font-semibold"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              {sprintName
                ? `${sprintName}_${card.cardNumber}`
                : `CARD-${card.cardNumber}`}
            </span>
            {/* Title */}
            <p
              className="line-clamp-2 text-sm font-medium leading-5"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              {card.title}
            </p>
          </div>

          {/* Description */}

          {card.description && (
            <div
              className="mt-1 line-clamp-2 text-xs leading-4"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              {card.description
                .replace(/<br\s*\/?>/gi, " ")
                .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ")
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/gi, " ")
                .replace(/&amp;/gi, "&")
                .replace(/&lt;/gi, "<")
                .replace(/&gt;/gi, ">")
                .replace(/&quot;/gi, '"')
                .replace(/&#39;/gi, "'")
                .replace(/[#*_~`]/g, "")
                .replace(/\s+/g, " ")
                .trim()}
            </div>
          )}

          {/* Dates */}
          {(card.startDate || card.dueDate) && (
            <div
              className="mt-3 flex items-center gap-1 text-[10px]"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              <CalendarDays size={12} />

              <span>
                {formatCardDate(card.startDate)}

                {card.dueDate ? ` → ${formatCardDate(card.dueDate)}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ADD CARD BUTTON
   *
   * This is used by BoardList.
   * ============================================================
   */

  return (
    <>
      <button
        type="button"
        onClick={openCreateCardModal}
        className="mx-2 mb-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
        style={{
          color: "var(--color-text-muted)",
        }}
      >
        <Plus size={16} />

        <span>Add card</span>
      </button>

      {/* ======================================================
          CREATE CARD MODAL
      ======================================================= */}

      {isCreateCardOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 "
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateCardModal();
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-xl border p-5 shadow-xl card-scroll"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Header */}

            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Create card
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Add a card to <span className="font-medium">{listName}</span>.
                </p>
              </div>

              <button
                type="button"
                disabled={createCardMutation.isPending}
                onClick={closeCreateCardModal}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 disabled:cursor-not-allowed dark:hover:bg-white/5"
                style={{
                  color: "var(--color-text-muted)",
                }}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}

            <div className="space-y-4  ">
              {/* Title */}

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Title
                </label>

                <input
                  type="text"
                  value={cardTitle}
                  onChange={(event) => setCardTitle(event.target.value)}
                  placeholder="e.g. Implement login"
                  autoFocus
                  className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              {/* Description */}

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Description
                </label>

                <CardDescriptionEditor
                  value={cardDescription}
                  onChange={setCardDescription}
                />
              </div>

              {/* Priority */}

              <div>
                <label
                  htmlFor={`card-priority-${listId}`}
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  Priority
                </label>

                <select
                  id={`card-priority-${listId}`}
                  value={cardPriority}
                  onChange={(event) => {
                    setCardPriority(event.target.value as CardPriority);
                  }}
                  className="h-10 w-full cursor-pointer rounded-lg border px-3 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {priorities.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                      className="bg-[var(--color-card-bg)] text-[var(--color-text-primary)] border-2 border-[var(--color-primary)]"
                    >
                      {capitalize(priority)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Start */}

                <div>
                  <label
                    htmlFor={`card-start-date-${listId}`}
                    className="mb-1.5 block text-sm font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Start date
                  </label>

                  <input
                    id={`card-start-date-${listId}`}
                    type="date"
                    value={cardStartDate}
                    onChange={(event) => setCardStartDate(event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>

                {/* Due */}

                <div>
                  <label
                    htmlFor={`card-due-date-${listId}`}
                    className="mb-1.5 block text-sm font-medium"
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Due date
                  </label>

                  <input
                    id={`card-due-date-${listId}`}
                    type="date"
                    value={cardEndDate}
                    onChange={(event) => setCardEndDate(event.target.value)}
                    className="h-10 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--color-input-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Sprint */}

              <div
                className="rounded-lg border px-3 py-2.5 text-xs"
                style={{
                  backgroundColor: "var(--color-column-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {activeSprintId ? (
                  <div className="flex items-center gap-2">
                    <Check size={14} />

                    <span>This card will be added to the active sprint.</span>
                  </div>
                ) : (
                  <span>
                    No active sprint. The card will be created without a sprint.
                  </span>
                )}
              </div>
            </div>

            {/* Error */}

            {createCardMutation.isError && (
              <div
                className="mt-4 rounded-lg border px-3 py-2.5 text-sm"
                style={{
                  backgroundColor: "var(--color-tag-red-bg)",
                  borderColor: "var(--color-tag-red-text)",
                  color: "var(--color-tag-red-text)",
                }}
              >
                {createCardMutation.error instanceof Error
                  ? createCardMutation.error.message
                  : "Failed to create card"}
              </div>
            )}

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={createCardMutation.isPending}
                onClick={closeCreateCardModal}
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={createCardMutation.isPending || !cardTitle.trim()}
                onClick={handleCreateCard}
                className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {createCardMutation.isPending ? "Creating..." : "Create card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

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
        backgroundColor: "var(--color-column-bg)",
        color: "var(--color-text-secondary)",
      };
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCardDate(date: string | null) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
