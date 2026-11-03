"use client";

import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import Modal, { modalButtonClass } from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/ToastProvider";

type MemberRole = "owner" | "admin" | "manager" | "member";
type BoardStatus = "ACTIVE" | "DEACTIVATED";

export type BoardDialogAction = "assign" | "remove-board";

export type BoardDialogMember = {
  userId: string;
  name: string;
  email: string;
};

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
};

type BoardMember = {
  userId: string;
  role: MemberRole;
  status?: BoardStatus;
};

type BoardResponse = {
  message?: string;
  boards?: Board[];
  data?: { boards?: Board[] };
};

type BoardMembersResponse = {
  message?: string;
  members?: BoardMember[];
  data?: { members?: BoardMember[] };
};

type MemberBoardDialogProps = {
  workspaceId: string;
  // The dialog is open while a member is set.
  member: BoardDialogMember | null;
  action: BoardDialogAction;
  onClose: () => void;
};

const boardRoles: MemberRole[] = ["admin", "manager", "member"];

const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)] disabled:opacity-60";

// Assign a workspace member to a board, or remove them from one. Board
// membership is read from each board's boardMembers route when it opens.
export default function MemberBoardDialog({
  workspaceId,
  member,
  action,
  onClose,
}: MemberBoardDialogProps) {
  const { showToast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [memberships, setMemberships] = useState<
    Record<string, BoardMember | null>
  >({});
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("member");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const userId = member?.userId;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadBoards() {
      setLoading(true);
      setError("");
      setBoards([]);
      setMemberships({});
      setSelectedBoardId("");
      setSelectedRole("member");

      try {
        const response = await fetch(`/api/workspace/${workspaceId}/board`, {
          cache: "no-store",
        });
        const data: BoardResponse = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch workspace boards.");

        // Only boards belonging to this workspace.
        const workspaceBoards = (data.boards ?? data.data?.boards ?? []).filter(
          (board) => board.organizationId === workspaceId,
        );

        const entries = await Promise.all(
          workspaceBoards.map(async (board) => {
            const memberResponse = await fetch(
              `/api/workspace/${workspaceId}/board/${board.id}/boardMembers?page=1&limit=100`,
              { cache: "no-store" },
            );
            if (!memberResponse.ok)
              throw new Error(
                `Could not check membership for ${board.boardName}.`,
              );

            const memberData: BoardMembersResponse =
              await memberResponse.json();
            const existing = (
              memberData.data?.members ??
              memberData.members ??
              []
            ).find(
              (boardMember) =>
                boardMember.userId === userId &&
                boardMember.status !== "DEACTIVATED",
            );
            return [board.id, existing ?? null] as const;
          }),
        );

        if (cancelled) return;
        setBoards(workspaceBoards);
        setMemberships(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load boards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, userId]);

  const selectedBoard = boards.find((board) => board.id === selectedBoardId);
  const selectedMembership = selectedBoardId
    ? memberships[selectedBoardId]
    : null;

  // Boards the action applies to: not yet joined for assign, joined for remove.
  const availableBoards = boards.filter((board) =>
    action === "assign" ? !memberships[board.id] : Boolean(memberships[board.id]),
  );

  function close() {
    if (saving) return;
    setConfirmingRemoval(false);
    onClose();
  }

  async function handleAssign() {
    if (!member || !selectedBoardId || selectedMembership) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${selectedBoardId}/boardMembers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: member.userId,
            email: member.email,
            role: selectedRole,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to assign member to board.");

      showToast(
        `${member.name} was added to ${selectedBoard?.boardName ?? "the board"}.`,
        "success",
      );
      setSaving(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign member.");
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!member || !selectedBoardId || !selectedMembership) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${selectedBoardId}/boardMembers`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: member.userId }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove board member.");

      showToast(
        `${member.name} was removed from ${selectedBoard?.boardName ?? "the board"}.`,
        "success",
      );
      setSaving(false);
      setConfirmingRemoval(false);
      onClose();
    } catch (err) {
      // Keep the confirmation open so the user can retry or cancel.
      setError(
        err instanceof Error ? err.message : "Failed to remove board member.",
      );
      setSaving(false);
    }
  }

  const isAssign = action === "assign";

  return (
    <>
      <Modal
        isOpen={Boolean(member)}
        onClose={close}
        dismissible={!saving}
        size="sm"
        icon={<LayoutGrid size={20} aria-hidden="true" />}
        iconTone={isAssign ? "primary" : "danger"}
        title={isAssign ? "Assign to a board" : "Remove from a board"}
        description={
          member && (
            <>
              <span className="font-medium text-[var(--color-text-primary)]">
                {member.name}
              </span>{" "}
              · {member.email}
            </>
          )
        }
        footer={
          <>
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className={modalButtonClass.secondary}
            >
              Cancel
            </button>
            {isAssign ? (
              <button
                type="button"
                onClick={() => void handleAssign()}
                disabled={saving || loading || !selectedBoardId}
                className={`${modalButtonClass.primary} gap-2`}
              >
                {saving && <LoadingSpinner size="sm" />}
                {saving ? "Assigning..." : "Assign to board"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingRemoval(true)}
                disabled={saving || loading || !selectedBoardId}
                className={modalButtonClass.danger}
              >
                Remove from board
              </button>
            )}
          </>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-[var(--color-text-secondary)]">
            <LoadingSpinner size="sm" tone="primary" />
            Loading boards…
          </div>
        ) : boards.length === 0 && !error ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-app-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
            This workspace has no boards yet.
          </p>
        ) : (
          <div className="space-y-4">
            {boards.length > 0 && availableBoards.length === 0 ? (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-app-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
                {isAssign
                  ? "This member is already on every board in this workspace."
                  : "This member isn't on any board in this workspace."}
              </p>
            ) : (
              boards.length > 0 && (
                <div>
                  <label
                    htmlFor="member-board"
                    className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    Board
                  </label>
                  <select
                    id="member-board"
                    data-autofocus
                    value={selectedBoardId}
                    disabled={saving}
                    onChange={(event) => {
                      setSelectedBoardId(event.target.value);
                      setError("");
                    }}
                    className={fieldClass}
                  >
                    <option value="">Choose a board</option>
                    {availableBoards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.boardName}
                        {memberships[board.id]
                          ? ` (${memberships[board.id]?.role})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            {isAssign && availableBoards.length > 0 && (
              <div>
                <label
                  htmlFor="board-member-role"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
                >
                  Board role
                </label>
                <select
                  id="board-member-role"
                  value={selectedRole}
                  disabled={saving}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as MemberRole)
                  }
                  className={fieldClass}
                >
                  {boardRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && !confirmingRemoval && (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] bg-[var(--color-tag-red-bg)] px-3 py-2.5 text-sm text-[var(--color-tag-red-text)]"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmingRemoval}
        title="Remove from board?"
        description={
          <>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {member?.name}
            </span>{" "}
            will lose access to{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {selectedBoard?.boardName ?? "this board"}
            </span>
            .
          </>
        }
        confirmLabel="Remove from board"
        pendingLabel="Removing..."
        isPending={saving}
        error={confirmingRemoval ? error : undefined}
        onConfirm={() => void handleRemove()}
        onCancel={() => {
          if (saving) return;
          setConfirmingRemoval(false);
          setError("");
        }}
      />
    </>
  );
}
