"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  type Query,
} from "@tanstack/react-query";
import { ChevronDown, Pencil, Trash2, X } from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { boardValidation, validateData } from "@/lib/validations/board";

type BoardRole = "owner" | "admin" | "manager" | "member";

type BoardActionsMenuProps = {
  workspaceId: string;
  boardId: string;
  boardName: string;
  role?: BoardRole;
};

type BoardResponse = {
  message: string;
  board: { id: string; boardName: string; role?: BoardRole };
};

type BoardsListResponse = {
  message: string;
  boards: { id: string; boardName: string }[];
};

// Workspace-level caches that list boards (stats card, dashboard table,
// sidebar). Each holds a `{ boards: [...] }` response.
const workspaceBoardListKeys = (workspaceId: string) => [
  ["workspace-boards", workspaceId],
  ["assigned-task-boards", workspaceId],
  ["boards", workspaceId],
];

export default function BoardActionsMenu({
  workspaceId,
  boardId,
  boardName,
  role,
}: BoardActionsMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(boardName);
  const [nameError, setNameError] = useState("");
  const isDeletedRef = useRef(false);

  // Mirrors the API's role checks: PATCH needs owner/admin, DELETE needs owner.
  const canRename = role === "owner" || role === "admin";
  const canDelete = role === "owner";

  // Board-scoped queries are removed once this page unmounts after a delete,
  // so mounted observers never re-fetch the deleted board mid-navigation.
  useEffect(() => {
    return () => {
      if (!isDeletedRef.current) return;
      queryClient.removeQueries({
        predicate: (query: Query) => query.queryKey.includes(boardId),
      });
    };
  }, [queryClient, boardId]);

  const renameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardName: newName }),
        },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to update board.");
      }

      // The update endpoint returns the board under `workspace`.
      return {
        message: data?.message as string | undefined,
        boardName: (data?.workspace?.boardName as string | undefined) ?? newName,
      };
    },

    onSuccess: async (result) => {
      queryClient.setQueryData<BoardResponse>(["board", boardId], (old) =>
        old && { ...old, board: { ...old.board, boardName: result.boardName } },
      );

      showToast("Board renamed successfully.", "success");
      setIsRenameOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        ...workspaceBoardListKeys(workspaceId).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ]);
    },

    // Nothing was changed optimistically, so the old name is still shown.
    onError: (error) => {
      setNameError(error.message);
      showToast(error.message || "Failed to update board.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to delete board.");
      }

      return data;
    },

    onSuccess: async () => {
      isDeletedRef.current = true;

      // Drop the board from every workspace board list right away, then
      // re-fetch them so the default board is re-selected from the server.
      for (const queryKey of workspaceBoardListKeys(workspaceId)) {
        queryClient.setQueryData<BoardsListResponse>(queryKey, (old) =>
          old && {
            ...old,
            boards: old.boards.filter((item) => item.id !== boardId),
          },
        );
      }

      showToast(`Board "${boardName}" deleted.`, "success");
      setIsDeleteOpen(false);
      router.replace(`/dashboard/workspace/${workspaceId}`);

      await Promise.all(
        workspaceBoardListKeys(workspaceId).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },

    // The board still exists; keep the dialog open so the user can retry.
    onError: (error) => {
      showToast(error.message || "Failed to delete board.", "error");
    },
  });

  if (!canRename && !canDelete) return null;

  function openRename() {
    setIsMenuOpen(false);
    setNameDraft(boardName);
    setNameError("");
    renameMutation.reset();
    setIsRenameOpen(true);
  }

  function openDelete() {
    setIsMenuOpen(false);
    deleteMutation.reset();
    setIsDeleteOpen(true);
  }

  function closeRename() {
    if (!renameMutation.isPending) setIsRenameOpen(false);
  }

  function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (renameMutation.isPending) return;

    const validation = validateData(boardValidation, { boardName: nameDraft });

    if (!validation.success) {
      setNameError(validation.error);
      return;
    }

    if (validation.data.boardName === boardName) {
      setIsRenameOpen(false);
      return;
    }

    setNameError("");
    renameMutation.mutate(validation.data.boardName);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Board actions"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((previous) => !previous)}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition hover:bg-[var(--color-card-hover)]"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ChevronDown size={16} />
      </button>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close board actions"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div
            role="menu"
            className="absolute left-0 top-9 z-50 w-[240px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-1.5 shadow-[var(--shadow-md)]"
          >
            {canRename && (
              <button
                type="button"
                role="menuitem"
                onClick={openRename}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-card-hover)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-active-bg)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  <Pencil size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-[var(--color-text-primary)]">
                    Rename board
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-muted)]">
                    Change this board&apos;s name
                  </span>
                </span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={openDelete}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-tag-red-bg)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-tag-red-bg)] text-[var(--color-priority-high)] transition-colors group-hover:bg-[var(--color-priority-high)] group-hover:text-white">
                  <Trash2 size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-[var(--color-priority-high)]">
                    Delete board
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-muted)]">
                    Permanently delete this board
                  </span>
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          RENAME BOARD MODAL
      ====================================================== */}

      {isRenameOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-board-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeRename();
            }}
          >
            <button
              type="button"
              aria-label="Close rename board"
              onClick={closeRename}
              disabled={renameMutation.isPending}
              className="absolute inset-0 cursor-default bg-black/40"
            />

            <form
              onSubmit={handleRenameSubmit}
              noValidate
              className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
              style={{
                backgroundColor: "var(--color-card-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <button
                type="button"
                onClick={closeRename}
                disabled={renameMutation.isPending}
                className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
                <Pencil size={20} />
              </div>

              <h2
                id="rename-board-title"
                className="pr-8 text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Rename board
              </h2>

              <label
                htmlFor="rename-board-name"
                className="mt-4 mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Board name
              </label>

              <input
                id="rename-board-name"
                type="text"
                autoFocus
                value={nameDraft}
                disabled={renameMutation.isPending}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "rename-board-error" : undefined}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  setNameError("");
                }}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)] disabled:opacity-60"
              />

              {nameError ? (
                <p
                  id="rename-board-error"
                  role="alert"
                  className="mt-2 text-xs text-[var(--color-tag-red-text)]"
                >
                  {nameError}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  3–50 characters.
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRename}
                  disabled={renameMutation.isPending}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    renameMutation.isPending ||
                    nameDraft.trim() === boardName ||
                    !nameDraft.trim()
                  }
                  className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {renameMutation.isPending && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {renameMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}

      {/* =====================================================
          DELETE BOARD MODAL
      ====================================================== */}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete board?"
        description={
          <>
            <p>
              This permanently deletes{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                &quot;{boardName}&quot;
              </span>{" "}
              along with all of its lists, cards, sprints, comments,
              attachments and member access.
            </p>
            <p className="mt-2">This action cannot be undone.</p>
          </>
        }
        icon={<Trash2 size={20} />}
        confirmLabel="Delete board"
        pendingLabel="Deleting..."
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteMutation.isPending) deleteMutation.mutate();
        }}
        onCancel={() => {
          if (!deleteMutation.isPending) setIsDeleteOpen(false);
        }}
      />
    </div>
  );
}
