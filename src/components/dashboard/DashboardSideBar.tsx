"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Moon, Sun } from "lucide-react";

import CreateBoard from "@/components/board/CreateBoardCard";
import WorkspaceModal from "@/components/WorkspaceModal";
import UserProfileCard from "@/components/auth/UserProfileCard";

import WorkspaceMemberCard from "@/components/workspaceMemberCard";
import InviteMemberCard from "@/components/inviteMemberCard";

type Workspace = {
  workspaceId: string;
  workspaceName: string;
  role: "owner" | "admin" | "manager" | "member";
  createdAt: string;
};

type WorkspaceResponse = {
  message: string;
  workspace: Workspace[];
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type CurrentUserResponse = {
  message: string;
  user: CurrentUser;
};

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  role: "admin" | "owner" | "member" | "manager";
};

type BoardResponse = {
  message: string;
  boards: Board[];
};

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [showBoardsDropdown, setShowBoardsDropdown] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const [showUserProfile, setShowUserProfile] = useState(false);

  /* ================================================================
     GLOBAL THEME
  ================================================================ */

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("flowboard-theme") as
      | "light"
      | "dark"
      | null;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const nextTheme = savedTheme ?? systemTheme;

    document.documentElement.setAttribute("data-theme", nextTheme);

    setTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("flowboard-theme", nextTheme);

    setTheme(nextTheme);
  };

  /* ---------------------------------------------------------------------- */
  /* Workspaces                                                             */
  /* ---------------------------------------------------------------------- */

  const { data, isLoading, isError } = useQuery<WorkspaceResponse>({
    queryKey: ["workspaces"],

    queryFn: async () => {
      const response = await fetch("/api/workspace");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspaces");
      }

      return data;
    },
  });

  /* ---------------------------------------------------------------------- */
  /* Current user                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<CurrentUserResponse>({
    queryKey: ["current-user"],

    queryFn: async () => {
      const response = await fetch("/api/auth");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch current user");
      }

      return data;
    },
  });

  const workspaces = data?.workspace ?? [];

  /* ---------------------------------------------------------------------- */
  /* Current workspace                                                      */
  /* ---------------------------------------------------------------------- */

  const currentWorkspaceId = pathname.match(
    /\/dashboard\/workspace\/([^/]+)/,
  )?.[1];

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.workspaceId === currentWorkspaceId,
  );

  /* ---------------------------------------------------------------------- */
  /* Boards                                                                 */
  /* ---------------------------------------------------------------------- */

  const {
    data: boardData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = useQuery<BoardResponse>({
    queryKey: ["boards", currentWorkspaceId],
    enabled: !!currentWorkspaceId,

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${currentWorkspaceId}/board`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch your boards!");
      }

      return data;
    },
  });

  const boards = boardData?.boards ?? [];

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  const handleWorkspaceChange = (workspaceId: string) => {
    if (!workspaceId) return;

    router.push(`/dashboard/workspace/${workspaceId}`);

    setShowWorkspaceDropdown(false);
    setShowBoardsDropdown(false);
    setIsMobileOpen(false);
  };

  const handleBoardClick = (boardId: string) => {
    if (!selectedWorkspace) return;

    router.push(
      `/dashboard/workspace/${selectedWorkspace.workspaceId}/board/${boardId}`,
    );

    setShowBoardsDropdown(false);
    setShowWorkspaceDropdown(false);
    setIsMobileOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Logout                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action: "logout",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to logout");
      }

      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* ================================================================== */}
      {/* Mobile menu button                                                 */}
      {/* ================================================================== */}

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-primary)] shadow-sm lg:hidden"
        aria-label="Open dashboard sidebar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>

      {/* ================================================================== */}
      {/* Mobile overlay                                                     */}
      {/* ================================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard sidebar"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* ================================================================== */}
      {/* Sidebar                                                             */}
      {/* ================================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[var(--color-border)] bg-[var(--color-card-bg)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ================================================================ */}
        {/* Logo + Theme                                                     */}
        {/* ================================================================ */}

        <div className="flex h-[62px] justify-between shrink-0 items-center border-b border-[var(--color-border)] px-4">
          {/* Flowboard logo */}

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex cursor-pointer items-center gap-2"
          >
            <span
              className="text-[19px] font-semibold tracking-tight text-[var(--color-text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              Flowboard
            </span>

            <span className="h-2 w-2 rounded-full bg-[var(--color-priority-medium)]" />
          </button>

          {/* Theme switch */}

          <button
            type="button"
            onClick={toggleTheme}
            className="flex  h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            {mounted && theme === "dark" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* ================================================================ */}
        {/* Sidebar main content                                             */}
        {/* ================================================================ */}

        <div className="min-h-0 flex-1 overflow-visible px-3 py-4">
          {/* ============================================================ */}
          {/* Organization                                                  */}
          {/* ============================================================ */}

          <div>
            <div className="mb-1.5 flex items-center justify-between px-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                Organization
              </p>

              {selectedWorkspace && (
                <span className="rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-medium uppercase text-[var(--color-text-secondary)]">
                  {selectedWorkspace.role}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-9 animate-pulse rounded-lg bg-[var(--color-border)]" />
            ) : isError ? (
              <div className="rounded-lg border border-[var(--color-priority-high)]/30 bg-[var(--color-priority-high)]/5 px-2.5 py-2 text-[12px] text-[var(--color-priority-high)]">
                Failed to load organizations.
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] px-2.5 py-2.5">
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  No organization yet.
                </p>
              </div>
            ) : (
              /* ============================================================
                 Custom workspace dropdown
              ============================================================ */

              <div className="relative">
                {/* Workspace trigger */}

                <button
                  type="button"
                  onClick={() => {
                    setShowWorkspaceDropdown((previous) => !previous);
                    setShowBoardsDropdown(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-app-bg)] px-2.5 py-2 text-left transition-colors ${
                    showWorkspaceDropdown
                      ? "bg-[var(--color-border)]"
                      : "hover:bg-[var(--color-border)]"
                  }`}
                >
                  {/* Workspace initial */}

                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold text-white"
                    style={{
                      backgroundColor: "var(--color-primary)",
                    }}
                  >
                    {selectedWorkspace?.workspaceName
                      ?.charAt(0)
                      .toUpperCase() ?? "W"}
                  </span>

                  {/* Workspace name */}

                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--color-text-primary)]">
                    {selectedWorkspace?.workspaceName ?? "Select organization"}
                  </span>

                  {/* Role */}

                  {selectedWorkspace && (
                    <span className="shrink-0 rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[var(--color-text-secondary)]">
                      {selectedWorkspace.role}
                    </span>
                  )}

                  {/* Chevron */}

                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-[var(--color-text-secondary)] transition-transform ${
                      showWorkspaceDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ====================================================== */}
                {/* Workspace dropdown                                      */}
                {/* ====================================================== */}

                {showWorkspaceDropdown && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg">
                    {/* Dropdown header */}

                    <div className="border-b border-[var(--color-border)] px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                        Your organizations
                      </span>
                    </div>

                    {/* Workspace list */}

                    <div className="space-y-0.5 p-1.5">
                      {workspaces.map((workspace) => {
                        const isActive =
                          currentWorkspaceId === workspace.workspaceId;

                        return (
                          <button
                            key={workspace.workspaceId}
                            type="button"
                            onClick={() =>
                              handleWorkspaceChange(workspace.workspaceId)
                            }
                            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                              isActive
                                ? "bg-[var(--color-border)]"
                                : "hover:bg-[var(--color-border)]"
                            }`}
                          >
                            {/* Workspace icon */}

                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold text-white"
                              style={{
                                backgroundColor: "var(--color-primary)",
                              }}
                            >
                              {workspace.workspaceName.charAt(0).toUpperCase()}
                            </span>

                            {/* Workspace name */}

                            <span
                              className={`min-w-0 flex-1 truncate text-xs ${
                                isActive
                                  ? "font-semibold text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-primary)]"
                              }`}
                            >
                              {workspace.workspaceName}
                            </span>

                            {/* Role */}

                            <span className="shrink-0 rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[var(--color-text-secondary)]">
                              {workspace.role}
                            </span>

                            {/* Active check */}

                            {isActive && (
                              <Check
                                size={14}
                                className="shrink-0 text-[var(--color-primary)]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create organization remains OUTSIDE dropdown */}

            <button
              type="button"
              onClick={() => {
                router.push("/dashboard/workspace/create-workspace");

                setShowWorkspaceDropdown(false);
                setIsMobileOpen(false);
              }}
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
            >
              <span className="text-base leading-none">+</span>
              Create new organization
            </button>
          </div>

          {/* ============================================================ */}
          {/* Current workspace                                             */}
          {/* ============================================================ */}

          {selectedWorkspace && (
            <div className="mt-5">
              <p className="mb-1.5 px-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                Workspace
              </p>

              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-app-bg)] px-2.5 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-[12px] font-semibold text-white">
                    {selectedWorkspace.workspaceName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {selectedWorkspace.workspaceName}
                    </p>

                    <p className="mt-0.5 text-[12px] capitalize text-[var(--color-text-secondary)]">
                      {selectedWorkspace.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* Navigation                                                     */}
          {/* ============================================================ */}

          {selectedWorkspace && (
            <nav className="mt-5 space-y-0.5">
              {/* ======================================================== */}
              {/* Overview                                                  */}
              {/* ======================================================== */}

              <button
                type="button"
                onClick={() => {
                  router.push(
                    `/dashboard/workspace/${selectedWorkspace.workspaceId}`,
                  );

                  setShowBoardsDropdown(false);
                  setShowWorkspaceDropdown(false);
                  setIsMobileOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                  pathname ===
                  `/dashboard/workspace/${selectedWorkspace.workspaceId}`
                    ? "bg-[var(--color-border)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Overview
              </button>

              {/* ======================================================== */}
              {/* Boards dropdown                                           */}
              {/* ======================================================== */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowBoardsDropdown((previous) => !previous);
                    setShowWorkspaceDropdown(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                    showBoardsDropdown
                      ? "bg-[var(--color-border)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 10h18" />
                    <path d="M9 10v10" />
                  </svg>

                  <span className="flex-1 text-left">Boards</span>

                  <span className="mr-0.5 text-[12px] text-[var(--color-text-secondary)]">
                    {boards.length}
                  </span>

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${
                      showBoardsDropdown ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* ====================================================== */}
                {/* Floating board dropdown                                */}
                {/* ====================================================== */}

                {showBoardsDropdown && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg">
                    {/* Dropdown header */}

                    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                        Your boards
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateBoard(true);
                          setShowBoardsDropdown(false);
                        }}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                        title="Create board"
                      >
                        +
                      </button>
                    </div>

                    {/* Board list */}

                    <div className="space-y-0.5 p-1.5">
                      {isBoardsLoading ? (
                        <div className="px-2.5 py-3 text-[11px] text-[var(--color-text-secondary)]">
                          Loading boards...
                        </div>
                      ) : isBoardsError ? (
                        <div className="px-2.5 py-3 text-[11px] text-[var(--color-priority-high)]">
                          Failed to load boards.
                        </div>
                      ) : boards.length === 0 ? (
                        <div className="px-2.5 py-3 text-[11px] text-[var(--color-text-secondary)]">
                          No boards yet.
                        </div>
                      ) : (
                        boards.map((board) => {
                          const isActive = pathname.includes(
                            `/board/${board.id}`,
                          );

                          return (
                            <button
                              key={board.id}
                              type="button"
                              onClick={() => handleBoardClick(board.id)}
                              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                isActive
                                  ? "bg-[var(--color-border)]"
                                  : "hover:bg-[var(--color-border)]"
                              }`}
                            >
                              {/* Board icon / initial */}

                              <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold text-white"
                                style={{
                                  backgroundColor: "var(--color-primary)",
                                }}
                              >
                                {board.boardName.charAt(0).toUpperCase()}
                              </span>

                              {/* Board name */}

                              <span
                                className={`min-w-0 flex-1 truncate text-xs ${
                                  isActive
                                    ? "font-semibold text-[var(--color-text-primary)]"
                                    : "text-[var(--color-text-primary)]"
                                }`}
                              >
                                {board.boardName}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* Members                                                   */}
              {/* ======================================================== */}

              <button
                type="button"
                onClick={() => {
                  setShowMembers(true);
                  setShowInvitations(false);
                  setShowBoardsDropdown(false);
                  setShowWorkspaceDropdown(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  showMembers
                    ? "bg-[var(--color-border)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Members
              </button>

              {/* ======================================================== */}
              {/* Invitations                                               */}
              {/* ======================================================== */}

              <button
                type="button"
                onClick={() => {
                  setShowInvitations(true);
                  setShowMembers(false);
                  setShowBoardsDropdown(false);
                  setShowWorkspaceDropdown(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  showInvitations
                    ? "bg-[var(--color-border)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />

                  <path d="m3 7 9 6 9-6" />
                </svg>
                Invitations
              </button>
            </nav>
          )}
        </div>

        {/* ================================================================ */}
        {/* Bottom user section                                              */}
        {/* ================================================================ */}

        <div className="shrink-0 border-t border-[var(--color-border)] p-3">
          <button
            type="button"
            onClick={() => setShowUserProfile(true)}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--color-border)]"
          >
            {/* Avatar */}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-[13px] font-semibold text-white">
              {isUserLoading
                ? "..."
                : userData?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* User info */}

            <div className="min-w-0 flex-1">
              {isUserLoading ? (
                <>
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[var(--color-border)]" />

                  <div className="mt-1 h-2.5 w-28 animate-pulse rounded bg-[var(--color-border)]" />
                </>
              ) : isUserError ? (
                <p className="text-[12px] text-[var(--color-priority-high)]">
                  Failed to load user
                </p>
              ) : (
                <>
                  <p className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
                    {userData?.user?.name}
                  </p>

                  <p className="truncate text-[13px] text-[var(--color-text-secondary)]">
                    {userData?.user?.email}
                  </p>
                </>
              )}
            </div>

            {/* Arrow */}

            <span className="text-xl text-[var(--color-text-secondary)]">
              →
            </span>
          </button>

          {/* Logout */}

          <div className="mt-2 border-t border-[var(--color-border)] pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] text-[var(--color-priority-high)] transition-colors hover:bg-[var(--color-border)]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* Create board modal                                                 */}
      {/* ================================================================== */}

      {showCreateBoard && selectedWorkspace && (
        <WorkspaceModal
          isOpen={showCreateBoard}
          onClose={() => setShowCreateBoard(false)}
          title="Create Board"
        >
          <CreateBoard onClose={() => setShowCreateBoard(false)} />
        </WorkspaceModal>
      )}

      {/* ================================================================== */}
      {/* Members modal                                                      */}
      {/* ================================================================== */}

      {showMembers && selectedWorkspace && (
        <WorkspaceModal
          isOpen={showMembers}
          onClose={() => setShowMembers(false)}
          title="Workspace Members"
        >
          <WorkspaceMemberCard />
        </WorkspaceModal>
      )}

      {/* ================================================================== */}
      {/* Invitations modal                                                  */}
      {/* ================================================================== */}

      {showInvitations && selectedWorkspace && (
        <WorkspaceModal
          isOpen={showInvitations}
          onClose={() => setShowInvitations(false)}
          title="Workspace Invitations"
        >
          <InviteMemberCard />
        </WorkspaceModal>
      )}

      {/* ================================================================== */}
      {/* User profile                                                       */}
      {/* ================================================================== */}

      <UserProfileCard
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={userData?.user ?? null}
        onLogout={handleLogout}
      />
    </>
  );
}
