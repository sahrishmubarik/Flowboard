"use client";

type WorkspaceAction =
  | "members"
  | "invite"
  | "update-name"
  | "invitation-status"
  | "delete";

type WorkspaceActionCardProps = {
  onSelect: (action: WorkspaceAction) => void;
};

export default function WorkspaceActionCard({
  onSelect,
}: WorkspaceActionCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-6">
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-lg font-medium text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Workspace Actions
        </h2>

        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Manage your workspace and members.
        </p>
      </div>

      {/* Actions */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Members */}
        <button
          type="button"
          onClick={() => onSelect("members")}
          className="rounded-xl border border-[var(--mist)] p-4 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--ink)]">
            Workspace Members
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            View and manage workspace members.
          </p>
        </button>

        {/* Invite */}
        <button
          type="button"
          onClick={() => onSelect("invite")}
          className="rounded-xl border border-[var(--mist)] p-4 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--ink)]">
            Invite Member
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Invite someone to this workspace.
          </p>
        </button>

        {/* Update name */}
        <button
          type="button"
          onClick={() => onSelect("update-name")}
          className="rounded-xl border border-[var(--mist)] p-4 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--ink)]">
            Update Workspace Name
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Change the workspace name.
          </p>
        </button>

        {/* Invitation status */}
        <button
          type="button"
          onClick={() => onSelect("invitation-status")}
          className="rounded-xl border border-[var(--mist)] p-4 text-left transition hover:border-[var(--indigo)] hover:shadow-sm"
        >
          <p className="text-sm font-semibold text-[var(--ink)]">
            Invitation Status
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            View pending and previous invitations.
          </p>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onSelect("delete")}
          className="rounded-xl border border-red-200 p-4 text-left transition hover:border-red-400 hover:bg-red-50"
        >
          <p className="text-sm font-semibold text-red-600">
            Delete Workspace
          </p>

          <p className="mt-1 text-xs text-red-400">
            Permanently delete this workspace.
          </p>
        </button>
      </div>
    </div>
  );
}

export type { WorkspaceAction };