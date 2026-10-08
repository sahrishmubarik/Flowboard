"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Copy, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import CreateCard from "@/components/card/CreateCard";

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

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type CardType = {
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

type BoardListProps = {
  list: BoardListType;

  workspaceId: string;

  boardId: string;

  closeMenuSignal: number;

  cards?: CardType[];

  activeSprintId?: string | null;

  isCardsLoading?: boolean;

  isCardsError?: boolean;

  onCardClick?: (cardId: string) => void;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function BoardList({
  list,
  workspaceId,
  boardId,
  closeMenuSignal,
  cards = [],
  activeSprintId = null,
  isCardsLoading = false,
  isCardsError = false,
  onCardClick,
}: BoardListProps) {
  const queryClient = useQueryClient();

  /*
   * ============================================================
   * LIST MENU
   * ============================================================
   */

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /*
   * ============================================================
   * RENAME MODAL
   * ============================================================
   */

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const [listName, setListName] = useState(list.listName);

  /*
   * ============================================================
   * DELETE MODAL
   * ============================================================
   */

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /*
   * ============================================================
   * CLOSE MENU WHEN BOARD CANVAS SIGNAL CHANGES
   * ============================================================
   */

  useEffect(() => {
    setIsMenuOpen(false);
  }, [closeMenuSignal]);

  /*
   * ============================================================
   * DELETE LIST
   * ============================================================
   */

  const deleteListMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList/${list.id}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            listId: list.id,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete list");
      }

      return data;
    },

    onSuccess: () => {
      /*
       * Close dialogs/menu.
       */

      setIsDeleteModalOpen(false);

      setIsMenuOpen(false);

      /*
       * Refresh lists.
       */

      queryClient.invalidateQueries({
        queryKey: ["board-lists", workspaceId, boardId],
      });

      /*
       * Refresh cards because deleting a list
       * also affects its cards.
       */

      queryClient.invalidateQueries({
        queryKey: ["board-cards", workspaceId, boardId],
      });
    },
  });

  /*
   * ============================================================
   * UPDATE LIST NAME
   * ============================================================
   */

  const updateListMutation = useMutation({
    mutationFn: async (newListName: string) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList/${list.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            listId: list.id,
            listName: newListName,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update list");
      }

      return data;
    },

    onSuccess: () => {
      /*
       * Close rename modal and menu.
       */

      setIsRenameModalOpen(false);

      setIsMenuOpen(false);

      /*
       * Refresh lists.
       */

      queryClient.invalidateQueries({
        queryKey: ["board-lists", workspaceId, boardId],
      });
    },
  });

  /*
   * ============================================================
   * RENAME HANDLERS
   * ============================================================
   */

  const handleRenameClick = () => {
    setIsMenuOpen(false);

    setListName(list.listName);

    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    /*
     * Do not close while request is running.
     */

    if (updateListMutation.isPending) {
      return;
    }

    setListName(list.listName);

    setIsRenameModalOpen(false);
  };

  const handleUpdateListName = () => {
    const trimmedName = listName.trim();

    /*
     * Empty list name is not allowed.
     */

    if (!trimmedName) {
      return;
    }

    /*
     * Nothing changed.
     */

    if (trimmedName === list.listName) {
      setIsRenameModalOpen(false);

      return;
    }

    updateListMutation.mutate(trimmedName);
  };

  /*
   * ============================================================
   * DELETE HANDLERS
   * ============================================================
   */

  const handleDeleteClick = () => {
    setIsMenuOpen(false);

    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteListMutation.mutate();
  };

  const handleCloseDeleteModal = () => {
    /*
     * Do not close while deleting.
     */

    if (deleteListMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(false);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ======================================================
          LIST
      ======================================================= */}

      <div
        className="flex h-fit min-h-[180px] w-[280px] shrink-0 flex-col rounded-xl border"
        style={{
          backgroundColor: "var(--color-column-bg)",

          borderColor: "var(--color-border)",
        }}
      >
        {/* ====================================================
            LIST HEADER
        ===================================================== */}

        <div
          className="flex items-center justify-between border-b px-3 py-3"
          style={{
            borderColor: "var(--color-border)",
          }}
        >
          {/* List name + card count */}

          <div className="flex min-w-0 items-center gap-2">
            <h3
              className="truncate text-sm font-semibold"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              {list.listName}
            </h3>

            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: "var(--color-card-bg)",

                color: "var(--color-text-muted)",
              }}
            >
              {cards.length}
            </span>
          </div>

          {/* ==================================================
              LIST MENU
          =================================================== */}

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setIsMenuOpen((previous) => !previous);
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                color: "var(--color-text-muted)",
              }}
              aria-label="List options"
            >
              <MoreHorizontal size={17} />
            </button>

            {isMenuOpen && (
              <div
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="absolute right-0 top-8 z-40 w-48 rounded-lg border p-1.5 shadow-lg"
                style={{
                  backgroundColor: "var(--color-card-bg)",

                  borderColor: "var(--color-border)",
                }}
              >
                {/* ==================================================
                    ADD CARD
                =================================================== */}

                {/*
                 * Card creation belongs to the Card component.
                 *
                 * We don't implement any card state,
                 * mutation or modal here.
                 *
                 * The Card component should expose its own
                 * create-card trigger.
                 */}

                <CreateCard
                  mode="create"
                  workspaceId={workspaceId}
                  boardId={boardId}
                  listId={list.id}
                  listName={list.listName}
                  activeSprintId={activeSprintId}
                  onCreateClick={() => {
                    setIsMenuOpen(false);
                  }}
                  trigger="menu"
                />

                {/* ==================================================
                    RENAME LIST
                =================================================== */}

                <button
                  type="button"
                  onClick={handleRenameClick}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Pencil size={15} />
                  Rename list
                </button>

                {/* ==================================================
                    COPY LIST
                =================================================== */}

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Copy size={15} />
                  Copy list
                </button>

                {/* Divider */}

                <div
                  className="my-1 border-t"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                />

                {/* ==================================================
                    ARCHIVE LIST
                =================================================== */}

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Archive size={15} />
                  Archive list
                </button>

                {/* ==================================================
                    DELETE LIST
                =================================================== */}

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={deleteListMutation.isPending}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    color: "var(--color-tag-red-text)",
                  }}
                >
                  <Trash2 size={15} />
                  Delete list
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            CARDS
        ===================================================== */}

        <div className="flex flex-col gap-2 p-2">
          {/* ==================================================
              LOADING
          =================================================== */}

          {isCardsLoading ? (
            <>
              <div
                className="h-24 animate-pulse rounded-lg"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                }}
              />

              <div
                className="h-24 animate-pulse rounded-lg"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                }}
              />
            </>
          ) : isCardsError ? (
            /* ==================================================
               ERROR
            =================================================== */

            <div
              className="rounded-lg border p-3 text-xs"
              style={{
                backgroundColor: "var(--color-card-bg)",

                borderColor: "var(--color-border)",

                color: "var(--color-tag-red-text)",
              }}
            >
              Failed to load cards.
            </div>
          ) : cards.length > 0 ? (
            /* ==================================================
               CARD LIST
            =================================================== */

            [...cards]
              .sort((a, b) => a.position - b.position)
              .map((card) => (
                <CreateCard
                  key={card.id}
                  mode="display"
                  card={card}
                  workspaceId={workspaceId}
                  boardId={boardId}
                  listId={list.id}
                  listName={list.listName}
                  activeSprintId={activeSprintId}
                  onCardClick={onCardClick}
                />
              ))
          ) : (
            /* ==================================================
               EMPTY
            =================================================== */

            <div
              className="px-2 py-5 text-center text-xs"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              No cards yet
            </div>
          )}
        </div>

        {/* ====================================================
            ADD CARD BUTTON
        ===================================================== */}

        {/*
         * The complete Add Card functionality belongs
         * to Card component.
         *
         * BoardList only asks Card to render its trigger.
         */}

        <CreateCard
          mode="create"
          workspaceId={workspaceId}
          boardId={boardId}
          listId={list.id}
          listName={list.listName}
          activeSprintId={activeSprintId}
          trigger="button"
        />
      </div>

      {/* ======================================================
          RENAME LIST MODAL
      ======================================================= */}

      {isRenameModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-list-title"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close rename modal"
            onClick={handleCloseRenameModal}
            className="absolute inset-0 cursor-default bg-black/40"
          />

          {/* Modal */}

          <div
            className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-card-bg)",

              borderColor: "var(--color-border)",
            }}
          >
            {/* Close */}

            <button
              type="button"
              onClick={handleCloseRenameModal}
              disabled={updateListMutation.isPending}
              className="absolute right-4 top-4 rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: "var(--color-text-secondary)",
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon */}

            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-primary)",

                color: "var(--color-primary-active-bg)",
              }}
            >
              <Pencil size={20} />
            </div>

            {/* Title */}

            <h2
              id="rename-list-title"
              className="text-lg font-semibold"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              Rename list
            </h2>

            {/* Description */}

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Update the name of this list.
            </p>

            {/* Input */}

            <div className="mt-5">
              <label
                htmlFor={`list-name-${list.id}`}
                className="mb-2 block text-sm font-medium"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                List name
              </label>

              <input
                id={`list-name-${list.id}`}
                type="text"
                value={listName}
                onChange={(event) => setListName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleUpdateListName();
                  }

                  if (event.key === "Escape") {
                    handleCloseRenameModal();
                  }
                }}
                autoFocus
                maxLength={100}
                disabled={updateListMutation.isPending}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: "var(--color-app-bg)",

                  borderColor: "var(--color-border)",

                  color: "var(--color-text-primary)",
                }}
                placeholder="Enter list name"
              />

              {/* Error */}

              {updateListMutation.isError && (
                <p
                  className="mt-2 text-xs"
                  style={{
                    color: "var(--color-tag-red-text)",
                  }}
                >
                  {updateListMutation.error instanceof Error
                    ? updateListMutation.error.message
                    : "Failed to update list"}
                </p>
              )}
            </div>

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseRenameModal}
                disabled={updateListMutation.isPending}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",

                  backgroundColor: "var(--color-card-bg)",

                  color: "var(--color-text-primary)",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateListName}
                disabled={
                  updateListMutation.isPending ||
                  !listName.trim() ||
                  listName.trim() === list.listName
                }
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {updateListMutation.isPending ? "Updating..." : "Update list"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE LIST MODAL
      ======================================================= */}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-list-title"
        >
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={handleCloseDeleteModal}
            className="absolute inset-0 cursor-default bg-black/40"
          />

          {/* Modal */}

          <div
            className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-card-bg)",

              borderColor: "var(--color-border)",
            }}
          >
            {/* Close */}

            <button
              type="button"
              onClick={handleCloseDeleteModal}
              disabled={deleteListMutation.isPending}
              className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: "var(--color-text-secondary)",
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon */}

            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-tag-red-bg)",

                color: "var(--color-tag-red-text)",
              }}
            >
              <Trash2 size={20} />
            </div>

            {/* Content */}

            <div className="pr-8">
              <h2
                id="delete-list-title"
                className="text-lg font-semibold"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Delete list?
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Are you sure you want to delete{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  &quot;
                  {list.listName}
                  &quot;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteListMutation.isPending}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "var(--color-border)",

                  color: "var(--color-text-primary)",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteListMutation.isPending}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-tag-red-text)",
                }}
              >
                {deleteListMutation.isPending ? "Deleting..." : "Delete list"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
