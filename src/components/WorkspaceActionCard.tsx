"use client";

type WorkspaceAction =
  | "members"
  | "invite"
  | "update-name"
  | "invitation-status"
  | "delete"
  | "create-board";

type WorkspaceActionCardProps = {
  onSelect: (action: WorkspaceAction) => void;
};

export default function WorkspaceActionCard({
  onSelect,
}: WorkspaceActionCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-lg font-medium text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Workspace Actions
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your workspace and members.
        </p>
      </div>

      {/* Actions */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Members */}
        <button
          type="button"
          onClick={() => onSelect("members")}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-hover)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Workspace Members
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            View and manage workspace members.
          </p>
        </button>

        {/* Invite */}
        <button
          type="button"
          onClick={() => onSelect("invite")}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-hover)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Invite Member
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Invite someone to this workspace.
          </p>
        </button>

        {/* Create Board */}
        <button
          type="button"
          onClick={() => onSelect("create-board")}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-hover)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Create Board
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Create a board and manage your tasks.
          </p>
        </button>

        {/* Update name */}
        <button
          type="button"
          onClick={() => onSelect("update-name")}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-hover)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Update Workspace Name
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Change the workspace name.
          </p>
        </button>

        {/* Invitation status */}
        <button
          type="button"
          onClick={() => onSelect("invitation-status")}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-hover)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Invitation Status
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            View pending and previous invitations.
          </p>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onSelect("delete")}
          className="rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-card-bg)] p-4 text-left transition hover:border-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--color-tag-red-text)]">
            Delete Workspace
          </p>

          <p className="mt-1 text-xs text-[var(--color-tag-red-text)]">
            Permanently delete this workspace.
          </p>
        </button>
      </div>
    </div>
  );
}

export type { WorkspaceAction };
