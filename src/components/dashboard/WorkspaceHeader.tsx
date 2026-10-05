"use client";

import {
  MoreHorizontal,
  Search,
  Bell,
  Users,
  UserPlus,
  Mail,
  Pencil,
  Trash2,
  LayoutDashboard,
} from "lucide-react";

import { useState } from "react";

export type WorkspaceAction =
  | "members"
  | "invite"
  | "update-name"
  | "invitation-status"
  | "delete"
  | "create-board";

type WorkspaceHeaderProps = {
  workspaceName: string;
  boardCount: number;
  onAction: (action: WorkspaceAction) => void;
};

const actions = [
  {
    value: "members" as const,
    label: "Workspace Members",
    description: "View and manage members",
    icon: Users,
  },
  {
    value: "invite" as const,
    label: "Invite Member",
    description: "Invite someone to this workspace",
    icon: UserPlus,
  },
  {
    value: "invitation-status" as const,
    label: "Invitation Status",
    description: "View pending invitations",
    icon: Mail,
  },
  {
    value: "update-name" as const,
    label: "Update Workspace",
    description: "Change workspace details",
    icon: Pencil,
  },
  {
    value: "create-board" as const,
    label: "Create New Board",
    description: "Create a board for your work",
    icon: LayoutDashboard,
  },
  {
    value: "delete" as const,
    label: "Delete Workspace",
    description: "Permanently delete workspace",
    icon: Trash2,
    destructive: true,
  },
];

export default function WorkspaceHeader({
  workspaceName,
  boardCount,
  onAction,
}: WorkspaceHeaderProps) {
  const [showActions, setShowActions] = useState(false);

  const handleAction = (action: WorkspaceAction) => {
    setShowActions(false);
    onAction(action);
  };

  return (
    <header className="mb-8 flex items-start justify-between gap-6">
      {/* ================================================================ */}
      {/* Workspace information                                            */}
      {/* ================================================================ */}

      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
          <span>Workspace</span>

          <span className="text-[var(--color-border)]">/</span>

          <span>
            {boardCount} {boardCount === 1 ? "board" : "boards"}
          </span>
        </div>

        <h2
          className="mt-2 truncate text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]"
          style={{
            fontFamily: "var(--font-display)",
          }}
        >
          {workspaceName}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          Organize your work, keep your team aligned, and move ideas from
          planning to completion.
        </p>
      </div>

      {/* ================================================================ */}
      {/* Header actions                                                    */}
      {/* ================================================================ */}

      <div className="relative flex shrink-0 items-center gap-2">
        {/* Search */}

        <button
          type="button"
          aria-label="Search"
          className="
            flex h-10 w-10 items-center justify-center rounded-xl
            border border-[var(--color-border)]
            bg-[var(--color-card-bg)]
            text-[var(--color-text-secondary)]
            transition-all duration-200
            hover:border-[var(--color-primary)]/40
            hover:bg-[var(--color-primary-active-bg)]
            hover:text-[var(--color-primary)]
            cursor-pointer
          "
        >
          <Search size={17} />
        </button>

        {/* Notifications */}

        <button
          type="button"
          aria-label="Notifications"
          className="
            flex h-10 w-10 items-center justify-center rounded-xl
            border border-[var(--color-border)]
            bg-[var(--color-card-bg)]
            text-[var(--color-text-secondary)]
            transition-all duration-200
            hover:border-[var(--color-primary)]/40
            hover:bg-[var(--color-primary-active-bg)]
            hover:text-[var(--color-primary)]
             cursor-pointer
          "
        >
          <Bell size={17} />
        </button>

        {/* ============================================================ */}
        {/* More / workspace actions                                      */}
        {/* ============================================================ */}

        <button
          type="button"
          aria-label="Workspace options"
          aria-expanded={showActions}
          onClick={() => setShowActions((previous) => !previous)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200  cursor-pointer ${
            showActions
              ? "border-[var(--color-primary)]/50 bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]"
              : "border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-active-bg)] hover:text-[var(--color-primary)]  cursor-pointer"
          }`}
        >
          <MoreHorizontal size={18} />
        </button>

        {/* ============================================================ */}
        {/* Dropdown                                                       */}
        {/* ============================================================ */}

        {showActions && (
          <>
            {/* Invisible backdrop */}

            <button
              type="button"
              aria-label="Close workspace actions"
              onClick={() => setShowActions(false)}
              className="fixed inset-0 z-40  "
            />

            <div
              className="
                absolute right-0 top-12 z-50 w-[280px]
                overflow-hidden rounded-2xl
                border border-[var(--color-border)]
                bg-[var(--color-card-bg)]
                shadow-[var(--shadow-md)]
              "
            >
              {/* Dropdown header */}

              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <p
                  className="text-sm font-semibold text-[var(--color-text-primary)]"
                  style={{
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Workspace actions
                </p>

                <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                  Manage {workspaceName}
                </p>
              </div>

              {/* Actions */}

              <div className="p-1.5 ">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isDestructive = action.destructive;

                  return (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => handleAction(action.value)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors  cursor-pointer ${
                        isDestructive
                          ? "hover:bg-[var(--color-tag-red-bg)]"
                          : "hover:bg-[var(--color-card-hover)]"
                      }`}
                    >
                      {/* Icon */}

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          isDestructive
                            ? "bg-[var(--color-tag-red-bg)] text-[var(--color-priority-high)] group-hover:bg-[var(--color-priority-high)] group-hover:text-white"
                            : "bg-[var(--color-primary-active-bg)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white"
                        }`}
                      >
                        <Icon size={16} />
                      </span>

                      {/* Text */}

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-xs font-medium ${
                            isDestructive
                              ? "text-[var(--color-priority-high)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                        >
                          {action.label}
                        </span>

                        <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-muted)]">
                          {action.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
