"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import CreateCard from "@/components/card/CreateCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableCard from "./SortableCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal, { modalButtonClass } from "@/components/ui/Modal";

import { useDroppable } from "@dnd-kit/core";

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
  sprintId: string[];
  sprintName?: string | null;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;

  type: "bug" | "feature" | "task" | "tbd"; // Add this

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
type BoardListProps = {
  list: BoardListType;

  workspaceId: string;

  boardId: string;

  closeMenuSignal: number;

  cards?: CardType[];

  activeSprintId?: string | null;

  activeSprintName?: string | null;

  isCardsLoading?: boolean;

  isCardsError?: boolean;

  onCardClick?: (cardId: string) => void;
  memberId?: string | null;
  hideHeader?: boolean;
  hideAddCard?: boolean;
  headerOnly?: boolean;
  seamless?: boolean;
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

  activeSprintName = null,

  isCardsLoading = false,

  isCardsError = false,

  onCardClick,
  memberId = null,
  hideHeader = false,
  hideAddCard = false,
  headerOnly = false,
  seamless = false,
}: BoardListProps) {
  const queryClient = useQueryClient();

  /*

   * ============================================================

   * LIST MENU

   * ============================================================

   */
  const [openedAtSignal, setOpenedAtSignal] = useState<number | null>(null);

  const isMenuOpen = openedAtSignal === closeMenuSignal;

  /*

   * ============================================================

   * RENAME MODAL

   * ============================================================

   */

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const { setNodeRef: setCardsDropRef, isOver } = useDroppable({
    id: headerOnly
      ? `list-header-${list.id}`
      : `cell-${memberId ?? "unassigned"}-${list.id}`,
    disabled: headerOnly,

    data: {
      type: "cell",
      listId: list.id,
      memberId,
    },
  });

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

  // useEffect(() => {
  //   setOpenedAtSignal(null);
  // }, [closeMenuSignal]);

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
      setOpenedAtSignal(null);

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

      setOpenedAtSignal(null);

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
    setOpenedAtSignal(null);

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
    setOpenedAtSignal(null);
    deleteListMutation.reset();
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

      \======================================================= */}

      <div
        className={`flex ${headerOnly ? "" : "min-h-full"} w-full shrink-0 flex-col ${seamless ? "rounded-none border-0" : "rounded-xl border"}`}
        style={{
          backgroundColor: "var(--color-column-bg)",

          borderColor: "var(--color-border)",
        }}
      >
        {/* ====================================================

            LIST HEADER

        \===================================================== */}

        {!hideHeader && (
          <div
            className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b px-6 py-3"
            style={{
              backgroundColor: "var(--color-column-bg)",

              borderColor: "var(--color-border)",
            }}
          >
            {/* List name + card count */}

            <div className="flex min-w-0 items-center gap-3">
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

          \=================================================== */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenedAtSignal((previous) =>
                    previous === closeMenuSignal ? null : closeMenuSignal,
                  );
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  color: "var(--color-text-muted)",
                }}
                aria-label="List options"
              >
                <MoreHorizontal size={17} />
              </button>

              <div
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className={`absolute right-0 top-8 z-40 w-48 rounded-lg border p-1.5 shadow-lg ${isMenuOpen ? "" : "hidden"}`}
                style={{
                  backgroundColor: "var(--color-card-bg)",

                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                <CreateCard
                  workspaceId={workspaceId}
                  boardId={boardId}
                  listId={list.id}
                  listName={list.listName}
                  sprintName={activeSprintName}
                  activeSprintId={activeSprintId}
                  triggerClassName="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                  onCreateClick={() => {
                    setOpenedAtSignal(null);
                  }}
                />

                {/* ==================================================

                    RENAME LIST

                \=================================================== */}

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
            </div>
          </div>
        )}

        {!headerOnly && (
          <>
            {!hideAddCard && (
              <CreateCard
                workspaceId={workspaceId}
                boardId={boardId}
                listId={list.id}
                listName={list.listName}
                activeSprintId={activeSprintId}
                sprintName={activeSprintName}
                triggerClassName="mx-2 mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                triggerIconSize={16}
              />
            )}

            {/* ====================================================

                CARDS

            \===================================================== */}

            <div
              ref={setCardsDropRef}
              className="flex min-h-16 flex-1 flex-col gap-2 p-2"
              style={{
                backgroundColor: isOver
                  ? "var(--color-primary-soft, var(--color-column-bg))"
                  : undefined,
              }}
            >
              {/* ==================================================

              LOADING

          \=================================================== */}

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

            \=================================================== */

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

            \=================================================== */

                <SortableContext
                  items={[...cards]

                    .sort((a, b) => a.position - b.position)

                    .map((card) => card.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {[...cards]

                    .sort((a, b) => a.position - b.position)

                    .map((card) => (
                      <SortableCard key={card.id} card={card}>
                        <CreateCard
                          card={card}
                          workspaceId={workspaceId}
                          boardId={boardId}
                          listId={list.id}
                          listName={list.listName}
                          sprintName={card.sprintName ?? activeSprintName}
                          activeSprintId={activeSprintId}
                          onCardClick={onCardClick}
                        />
                      </SortableCard>
                    ))}
                </SortableContext>
              ) : (
                /* ==================================================

               EMPTY

            \=================================================== */

                <div
                  className="flex min-h-30 flex-1 items-center justify-center text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                >
                  No cards yet
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ======================================================

          RENAME LIST MODAL

      \======================================================= */}

      <Modal
        isOpen={isRenameModalOpen}
        onClose={handleCloseRenameModal}
        title="Rename list"
        description="Update the name of this list."
        icon={<Pencil size={20} />}
        size="sm"
        dismissible={!updateListMutation.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseRenameModal}
              disabled={updateListMutation.isPending}
              className={modalButtonClass.secondary}
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
              className={modalButtonClass.primary}
            >
              {updateListMutation.isPending ? "Updating..." : "Update list"}
            </button>
          </>
        }
      >
        <label
          htmlFor={`list-name-${list.id}`}
          className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
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
          }}
          data-autofocus
          maxLength={100}
          disabled={updateListMutation.isPending}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Enter list name"
        />

        {updateListMutation.isError && (
          <p
            role="alert"
            className="mt-2 text-xs text-[var(--color-tag-red-text)]"
          >
            {updateListMutation.error instanceof Error
              ? updateListMutation.error.message
              : "Failed to update list"}
          </p>
        )}
      </Modal>

      {/* ======================================================

          DELETE LIST MODAL

      \======================================================= */}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete list?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              &quot;{list.listName}&quot;
            </span>
            ? This action cannot be undone.
          </>
        }
        icon={<Trash2 size={20} />}
        confirmLabel="Delete list"
        pendingLabel="Deleting..."
        isPending={deleteListMutation.isPending}
        error={deleteListMutation.error?.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      />
    </>
  );
}
