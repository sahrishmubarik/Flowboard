"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Ellipsis, Plus, Trash2, Move, X, Pencil } from "lucide-react";

type BoardListType = {
  id: string;
  boardId: string;
  listName: string;
  position: number;
};

type BoardListProps = {
  list: BoardListType;
  workspaceId: string;
  boardId: string;
  closeMenuSignal: number;
};

export default function BoardList({
  list,
  workspaceId,
  boardId,
  closeMenuSignal,
}: BoardListProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const [listName, setListName] = useState(list.listName);

  const queryClient = useQueryClient();
  const [menuOpenedAtSignal, setMenuOpenedAtSignal] = useState<number | null>(
    null,
  );

  const isMenuOpen = menuOpenedAtSignal === closeMenuSignal;

  // =========================================================
  // DELETE LIST
  // =========================================================

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

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "Failed to delete list");
      }

      return response.json();
    },

    onSuccess: () => {
      setIsDeleteModalOpen(false);
      closeMenu();

      queryClient.invalidateQueries({
        queryKey: ["board-lists", workspaceId, boardId],
      });
    },
  });

  // =========================================================
  // UPDATE LIST NAME
  // =========================================================

  const updateListMutation = useMutation({
    mutationFn: async (newListName: string) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
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

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "Failed to update list");
      }

      return response.json();
    },

    onSuccess: () => {
      setIsRenameModalOpen(false);
      closeMenu();

      queryClient.invalidateQueries({
        queryKey: ["board-lists", workspaceId, boardId],
      });
    },
  });

  // =========================================================
  // DELETE HANDLERS
  // =========================================================

  const handleDeleteClick = () => {
    closeMenu();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteListMutation.mutate();
  };

  const handleCloseDeleteModal = () => {
    if (deleteListMutation.isPending) return;

    setIsDeleteModalOpen(false);
  };

  // =========================================================
  // RENAME HANDLERS
  // =========================================================

  const handleRenameClick = () => {
    closeMenu();
    setListName(list.listName);
    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    if (updateListMutation.isPending) return;

    setListName(list.listName);
    setIsRenameModalOpen(false);
  };

  const handleUpdateListName = () => {
    const trimmedName = listName.trim();

    if (!trimmedName) return;

    if (trimmedName === list.listName) {
      setIsRenameModalOpen(false);
      return;
    }

    updateListMutation.mutate(trimmedName);
  };
  const closeMenu = () => {
    setMenuOpenedAtSignal(null);
  };
  return (
    <>
      {/* =====================================================
          LIST
      ====================================================== */}

      <div
        className="relative flex h-fit min-w-[280px] flex-col rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-column-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* LIST HEADER */}

        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{
            borderColor: "var(--color-border)",
          }}
        >
          <h3
            className="truncate text-sm font-semibold"
            style={{
              color: "var(--color-text-primary)",
            }}
          >
            {list.listName}
          </h3>

          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setMenuOpenedAtSignal((previous) =>
                  previous === closeMenuSignal ? null : closeMenuSignal,
                );
              }}
              disabled={
                deleteListMutation.isPending || updateListMutation.isPending
              }
              className="cursor-pointer rounded-lg p-1 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: "var(--color-text-secondary)",
              }}
              aria-label="List options"
            >
              <Ellipsis size={18} />
            </button>

            {/* =================================================
      DROPDOWN
  ================================================== */}

            {isMenuOpen && (
              <div
                onClick={(event) => event.stopPropagation()}
                className="absolute right-0 top-9 z-50 w-48 rounded-xl border p-1.5 shadow-lg"
                style={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                {/* ADD CARD */}

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-black/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Plus size={16} />
                  Add card
                </button>

                {/* RENAME LIST */}

                <button
                  type="button"
                  onClick={handleRenameClick}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-black/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Pencil size={16} />
                  Rename list
                </button>

                {/* COPY LIST */}

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-black/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Copy size={16} />
                  Copy list
                </button>

                {/* MOVE LIST */}

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-black/5"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  <Move size={16} />
                  Move list
                </button>

                <div
                  className="my-1 border-t"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                />

                {/* DELETE LIST */}

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={deleteListMutation.isPending}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    color: "var(--color-tag-red-text)",
                  }}
                >
                  <Trash2 size={16} />
                  Delete list
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CARDS AREA */}

        <div className="min-h-[120px] p-3">
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-secondary)",
            }}
          >
            No cards yet
          </p>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-black/5"
            style={{
              color: "var(--color-text-primary)",
            }}
          >
            <Plus size={16} />
            Add card
          </button>
        </div>
      </div>

      {/* =====================================================
          RENAME LIST MODAL
      ====================================================== */}

      {isRenameModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-list-title"
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close rename modal"
            onClick={handleCloseRenameModal}
            className="absolute inset-0 cursor-default bg-black/40"
          />

          {/* MODAL */}
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={handleCloseRenameModal}
              disabled={updateListMutation.isPending}
              className="absolute right-4 top-4 rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  "var(--color-column-bg)";
                event.currentTarget.style.color = "var(--color-text-primary)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "transparent";
                event.currentTarget.style.color = "var(--color-text-secondary)";
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* ICON */}
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-active-bg)",
              }}
            >
              <Pencil size={20} />
            </div>

            {/* TITLE */}
            <h2
              id="rename-list-title"
              className="text-lg font-semibold"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              Rename list
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              Update the name of this list.
            </p>

            {/* INPUT */}
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
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "var(--color-indigo)";
                  event.currentTarget.style.boxShadow =
                    "0 0 0 3px var(--color-indigo-soft)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "var(--color-border)";
                  event.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Enter list name"
              />

              {/* ERROR */}
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

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-3">
              {/* CANCEL */}
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
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "var(--color-column-bg)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "var(--color-card-bg)";
                }}
              >
                Cancel
              </button>

              {/* UPDATE */}
              <button
                type="button"
                onClick={handleUpdateListName}
                disabled={
                  updateListMutation.isPending ||
                  !listName.trim() ||
                  listName.trim() === list.listName
                }
                className="rounded-xl px-5 py-2.5  text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
                onMouseEnter={(event) => {
                  if (!event.currentTarget.disabled) {
                    event.currentTarget.style.backgroundColor =
                      "var(--color-primary-hover)";
                  }
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "var(--color-primary-hover)";
                }}
              >
                {updateListMutation.isPending ? "Updating..." : "Update list"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE LIST MODAL
      ====================================================== */}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-list-title"
        >
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={handleCloseDeleteModal}
            className="absolute inset-0 cursor-default bg-black/40"
          />

          {/* MODAL */}

          <div
            className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* CLOSE */}

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

            {/* ICON */}

            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-tag-red-bg)",
                color: "var(--color-tag-red-text)",
              }}
            >
              <Trash2 size={20} />
            </div>

            {/* CONTENT */}

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
                  &quot;{list.listName}&quot;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* ACTIONS */}

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
