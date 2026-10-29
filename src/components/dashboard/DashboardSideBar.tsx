"use client";

import BrandLogo from "@/components/BrandLogo";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  History,
  KanbanSquare,
  LayoutGrid,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sun,
  Users,
  X,
} from "lucide-react";

import CreateBoard from "@/components/board/CreateBoardCard";
import WorkspaceModal from "@/components/WorkspaceModal";
import UserProfileCard from "@/components/auth/UserProfileCard";

import WorkspaceMemberCard from "@/components/workspaceMemberCard";

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

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem("flowboard-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const [isBoardsExpanded, setIsBoardsExpanded] = useState(true);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  const [showUserProfile, setShowUserProfile] = useState(false);

  /* ================================================================
     GLOBAL THEME
  ================================================================ */

  // const [theme, setTheme] = useState<"light" | "dark">("light");
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("flowboard-theme") as
  //     | "light"
  //     | "dark"
  //     | null;

  //   const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
  //     .matches
  //     ? "dark"
  //     : "light";

  //   const nextTheme = savedTheme ?? systemTheme;

  //   document.documentElement.setAttribute("data-theme", nextTheme);

  //   setTheme(nextTheme);
  //   setMounted(true);
  // }, []);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

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
    setIsMobileOpen(false);
  };

  // Called by every navigation link so menus and the mobile drawer close.
  const handleNavigate = () => {
    setShowWorkspaceDropdown(false);
    setIsMobileOpen(false);
  };

  // Close the workspace switcher on an outside click or Esc.
  useEffect(() => {
    if (!showWorkspaceDropdown) return;

    function handlePointerDown(event: PointerEvent) {
      if (!workspaceMenuRef.current?.contains(event.target as Node)) {
        setShowWorkspaceDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowWorkspaceDropdown(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showWorkspaceDropdown]);

  const workspaceBase = selectedWorkspace
    ? `/dashboard/workspace/${selectedWorkspace.workspaceId}`
    : "";

  const navItemClass = (isActive: boolean) =>
    `flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
      isActive
        ? "bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-column-bg)] hover:text-[var(--color-text-primary)]"
    }`;

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

      <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-column-bg)]"
          aria-label={
            isMobileOpen ? "Close dashboard sidebar" : "Open dashboard sidebar"
          }
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link
          href="/dashboard"
          onClick={handleNavigate}
          className="flex items-center gap-2"
        >
          <BrandLogo
            className="flex items-center gap-2"
            markClassName="h-7 w-7 rounded-[6px]"
            nameClassName="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary)]"
          />
        </Link>

        {selectedWorkspace && (
          <span className="ml-auto max-w-[45%] truncate text-xs font-medium text-[var(--color-text-secondary)]">
            {selectedWorkspace.workspaceName}
          </span>
        )}
      </div>

      {isDesktopCollapsed && (
        <button
          type="button"
          onClick={() => setIsDesktopCollapsed(false)}
          className="fixed bottom-4 left-4 z-50 hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-primary)] shadow-sm lg:flex"
          aria-label="Open dashboard sidebar"
          title="Open sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* ================================================================== */}
      {/* Mobile overlay                                                     */}
      {/* ================================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard sidebar"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[rgb(9_30_66_/_0.45)] lg:hidden"
        />
      )}

      {/* ================================================================== */}
      {/* Sidebar                                                             */}
      {/* ================================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-card-bg)] transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:h-screen ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDesktopCollapsed
            ? "lg:w-0 lg:min-w-0 lg:-translate-x-full lg:border-r-0"
            : "lg:w-[240px] lg:translate-x-0"
        }`}
      >
        {/* ================================================================ */}
        {/* Logo + Theme                                                     */}
        {/* ================================================================ */}

        <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4">
          {/* Flowboard logo */}

          <Link
            href="/dashboard"
            onClick={handleNavigate}
            className="flex items-center gap-2 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <BrandLogo
              className="flex items-center gap-2"
              markClassName="h-8 w-8 rounded-[7px]"
              nameClassName="text-[19px] font-semibold tracking-tight text-[var(--color-text-primary)]"
            />

            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--color-priority-medium)]"
            />
          </Link>

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
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* ================================================================ */}
        {/* Sidebar main content                                             */}
        {/* ================================================================ */}

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {/* ============================================================ */}
          {/* Organization                                                  */}
          {/* ============================================================ */}

          <div>
            <div className="mb-1.5 flex items-center justify-between px-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Organization
              </p>
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

              <div className="relative" ref={workspaceMenuRef}>
                {/* Workspace trigger */}

                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={showWorkspaceDropdown}
                  onClick={() =>
                    setShowWorkspaceDropdown((previous) => !previous)
                  }
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                    showWorkspaceDropdown
                      ? "bg-[var(--color-column-bg)]"
                      : "bg-[var(--color-app-bg)] hover:bg-[var(--color-column-bg)]"
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

                  {/* Workspace name + role */}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                      {selectedWorkspace?.workspaceName ?? "Select organization"}
                    </span>

                    {selectedWorkspace && (
                      <span className="block truncate text-[11px] capitalize text-[var(--color-text-muted)]">
                        {selectedWorkspace.role}
                      </span>
                    )}
                  </span>

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
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-md)]">
                    {/* Dropdown header */}

                    <div className="border-b border-[var(--color-border)] px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                        Your organizations
                      </span>
                    </div>

                    {/* Workspace list */}

                    <div className="max-h-64 space-y-0.5 overflow-y-auto p-1.5">
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
                            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors ${
                              isActive
                                ? "bg-[var(--color-primary-active-bg)]"
                                : "hover:bg-[var(--color-column-bg)]"
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
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-column-bg)] hover:text-[var(--color-text-primary)]"
            >
              <Plus size={14} aria-hidden="true" />
              Create new organization
            </button>
          </div>

          {/* ============================================================ */}
          {/* Navigation                                                     */}
          {/* ============================================================ */}

          {selectedWorkspace && (
            <nav aria-label="Workspace" className="mt-5 space-y-0.5">
              <Link
                href={workspaceBase}
                onClick={handleNavigate}
                aria-current={pathname === workspaceBase ? "page" : undefined}
                className={navItemClass(pathname === workspaceBase)}
              >
                <LayoutGrid size={16} aria-hidden="true" />
                Overview
              </Link>

              {/* Boards: expandable list of this workspace's boards */}

              <div>
                <div className="group flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsBoardsExpanded((previous) => !previous)}
                    aria-expanded={isBoardsExpanded}
                    aria-controls="sidebar-board-list"
                    className={`${navItemClass(
                      pathname.startsWith(`${workspaceBase}/board/`),
                    )} cursor-pointer`}
                  >
                    <KanbanSquare size={16} aria-hidden="true" />
                    <span className="flex-1 text-left">Boards</span>
                    <span className="text-[12px] font-normal text-[var(--color-text-muted)]">
                      {boards.length}
                    </span>
                    <ChevronRight
                      size={14}
                      aria-hidden="true"
                      className={`shrink-0 transition-transform ${
                        isBoardsExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateBoard(true)}
                    className="ml-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-column-bg)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                    aria-label="Create board"
                    title="Create board"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {isBoardsExpanded && (
                  <ul
                    id="sidebar-board-list"
                    className="mt-0.5 space-y-0.5 border-l border-[var(--color-border)] pl-2 ml-[18px]"
                  >
                    {isBoardsLoading ? (
                      <li className="space-y-1.5 px-2.5 py-1.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-border)]" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-border)]" />
                      </li>
                    ) : isBoardsError ? (
                      <li className="px-2.5 py-1.5 text-[12px] text-[var(--color-priority-high)]">
                        Failed to load boards.
                      </li>
                    ) : boards.length === 0 ? (
                      <li className="px-2.5 py-1.5 text-[12px] text-[var(--color-text-muted)]">
                        No boards yet.
                      </li>
                    ) : (
                      boards.map((board) => {
                        const isActive = pathname.includes(
                          `/board/${board.id}`,
                        );

                        return (
                          <li key={board.id}>
                            <Link
                              href={`${workspaceBase}/board/${board.id}`}
                              onClick={handleNavigate}
                              aria-current={isActive ? "page" : undefined}
                              className={`flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                                isActive
                                  ? "bg-[var(--color-primary-active-bg)] font-semibold text-[var(--color-primary)]"
                                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-column-bg)] hover:text-[var(--color-text-primary)]"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-primary)] text-[10px] font-semibold text-white"
                              >
                                {board.boardName.charAt(0).toUpperCase()}
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {board.boardName}
                              </span>
                            </Link>
                          </li>
                        );
                      })
                    )}
                  </ul>
                )}
              </div>

              <Link
                href={`${workspaceBase}/member`}
                onClick={handleNavigate}
                aria-current={
                  pathname.startsWith(`${workspaceBase}/member`)
                    ? "page"
                    : undefined
                }
                className={navItemClass(
                  pathname.startsWith(`${workspaceBase}/member`),
                )}
              >
                <Users size={16} aria-hidden="true" />
                Members
              </Link>

              <Link
                href={`${workspaceBase}/activity`}
                onClick={handleNavigate}
                aria-current={
                  pathname.startsWith(`${workspaceBase}/activity`)
                    ? "page"
                    : undefined
                }
                className={navItemClass(
                  pathname.startsWith(`${workspaceBase}/activity`),
                )}
              >
                <History size={16} aria-hidden="true" />
                Activity
              </Link>
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
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors hover:bg-[var(--color-column-bg)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
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
                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                    {userData?.user?.name}
                  </p>

                  <p className="truncate text-[12px] text-[var(--color-text-muted)]">
                    {userData?.user?.email}
                  </p>
                </>
              )}
            </div>

            {/* Arrow */}

            <ChevronRight
              size={16}
              aria-hidden="true"
              className="shrink-0 text-[var(--color-text-muted)]"
            />
          </button>

          {/* Logout */}

          <div className="mt-2 flex items-center gap-1 border-t border-[var(--color-border)] pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[13px] font-medium text-[var(--color-tag-red-text)] transition-colors hover:bg-[var(--color-tag-red-bg)]"
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

            <button
              type="button"
              onClick={() => setIsDesktopCollapsed(true)}
              className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] lg:flex"
              aria-label="Close dashboard sidebar"
              title="Close sidebar"
            >
              <PanelLeftClose size={17} />
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
