"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import CreateCard from "@/components/card/CreateCard";

import { ChevronDown, Star } from "lucide-react";

type Workspace = {
  id: string;
  workspaceName: string;
};

type WorkspaceResponse = {
  message: string;
  workspace: Workspace;
};

type Board = {
  id: string;
  boardName: string;
};

type BoardResponse = {
  message: string;
  board: Board;
};

type BoardMember = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member";
};

type BoardMemberResponse = {
  message: string;
  data: {
    members: BoardMember[];
  };
};

type BoardList = {
  id: string;
  listName: string;
  position: number;
};

type BoardListsResponse = {
  lists?: BoardList[];
  boardLists?: BoardList[];
};

type Sprint = {
  id: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};

type SprintResponse = {
  sprints: Sprint[];
};

export default function BoardHeader() {
  const params = useParams();
  const [favoriteBoardId, setFavoriteBoardId] = useState<string | null>(null);

  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;
  const listQuery = useQuery<BoardListsResponse>({
    queryKey: ["board-header-lists", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch board lists");
      }

      return data;
    },
    enabled: Boolean(workspaceId && boardId),
  });
  const sprintQuery = useQuery<SprintResponse>({
    queryKey: ["sprints", workspaceId, boardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/sprint`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to fetch sprints");
      }

      return data;
    },
    enabled: Boolean(workspaceId && boardId),
  });

  const boardLists = (listQuery.data?.boardLists ?? listQuery.data?.lists ?? [])
    .slice()
    .sort((first, second) => first.position - second.position);
  const firstList = boardLists[0];
  const activeSprintId =
    sprintQuery.data?.sprints?.find((sprint) => sprint.status === "ACTIVE")
      ?.id ?? null;
  const isBoardFavorited = favoriteBoardId === boardId;

  // =====================================================
  // WORKSPACE
  // =====================================================

  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useQuery<WorkspaceResponse>({
    queryKey: ["workspace", workspaceId],

    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      return response.json();
    },

    enabled: !!workspaceId,
  });

  // =====================================================
  // BOARD
  // =====================================================

  const {
    data: boardData,
    isLoading: boardLoading,
    error: boardError,
  } = useQuery<BoardResponse>({
    queryKey: ["board", boardId],

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch board");
      }

      return response.json();
    },

    enabled: !!workspaceId && !!boardId,
  });

  // =====================================================
  // BOARD MEMBERS
  // =====================================================

  const { data: boardMemberData } = useQuery<BoardMemberResponse>({
    queryKey: ["board-members", workspaceId, boardId],

    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardMembers`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch board members");
      }

      const data = await response.json();

      console.log("BOARD MEMBERS:", data);

      return data;
    },

    enabled: !!workspaceId && !!boardId,

    retry: false,
  });

  // =====================================================
  // LOADING STATES
  // =====================================================

  if (workspaceLoading || boardLoading) {
    return (
      <div
        className="border-b px-8 py-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Loading board...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR STATES
  // =====================================================

  if (workspaceError) {
    return (
      <div
        className="border-b px-8 py-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-priority-high)" }}>
          Failed to load workspace.
        </p>
      </div>
    );
  }

  if (boardError) {
    return (
      <div
        className="border-b px-8 py-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-priority-high)" }}>
          Failed to load board.
        </p>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const workspaceName = workspaceData?.workspace.workspaceName;
  const boardName = boardData?.board.boardName;

  const visibleMembers =
    boardMemberData?.data?.members?.filter(
      (member) =>
        member.role === "owner" ||
        member.role === "admin" ||
        member.role === "manager",
    ) ?? [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main>
      <header
        className="sticky top-0 z-30"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-card-bg)",
        }}
      >
        {/* =================================================
        TOP SECTION
        ================================================== */}

        <div
          className="border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* =================================================
          ROW 1
          ================================================== */}

          <div className="flex min-h-[56px] items-center px-3 sm:px-5 lg:min-h-[61.5px] lg:px-8">
            {/* ORGANIZATION + BOARD */}

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {/* Organization */}

              <Link
                href={`/dashboard/workspace/${workspaceId}`}
                className="max-w-[120px] truncate text-xs sm:max-w-[180px] sm:text-sm lg:max-w-none lg:text-[15px]"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                {workspaceName}
              </Link>

              <span
                className="shrink-0"
                style={{
                  color: "var(--color-border)",
                }}
              >
                /
              </span>

              {/* Board */}

              <Link
                href={`/dashboard/workspace/${workspaceId}/board/${boardId}`}
                className="group flex min-w-0 items-center gap-1.5"
              >
                <h1
                  className="max-w-[170px] truncate text-lg font-semibold tracking-tight sm:max-w-[280px] sm:text-xl lg:max-w-[350px] lg:text-[22px]"
                  style={{
                    color: "var(--color-text-primary)",
                  }}
                >
                  {boardName}
                </h1>

                <ChevronDown
                  size={16}
                  className="shrink-0 transition"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                />
              </Link>

              {/* Star */}

              <button
                type="button"
                onClick={() =>
                  setFavoriteBoardId(isBoardFavorited ? null : boardId)
                }
                className="ml-1 hidden rounded-md p-1.5 transition lg:block"
                style={{
                  color: "var(--color-priority-medium)",
                }}
                aria-label={
                  isBoardFavorited ? "Remove board favorite" : "Favorite board"
                }
                aria-pressed={isBoardFavorited}
              >
                <Star
                  size={19}
                  fill={isBoardFavorited ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* =================================================
            DESKTOP ACTIONS
            ================================================== */}

            <div className="hidden items-center gap-3 lg:flex">
              {/* Members */}

              {visibleMembers.length > 0 && (
                <div className="flex items-center">
                  {visibleMembers.slice(0, 5).map((member, index) => (
                    <div
                      key={member.userId}
                      className={`group relative ${index > 0 ? "-ml-2" : ""}`}
                    >
                      <div
                        role="img"
                        tabIndex={0}
                        aria-label={`${member.name} (${member.role})`}
                        aria-describedby={`desktop-member-tooltip-${member.userId}`}
                        className={`
                        flex h-8 w-8 items-center justify-center
                        rounded-full border-2
                        text-[11px] font-semibold text-white
                      `}
                        style={{
                          borderColor: "var(--color-card-bg)",
                          backgroundColor: getAvatarColor(index),
                          cursor: "pointer",
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <span
                        id={`desktop-member-tooltip-${member.userId}`}
                        role="tooltip"
                        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-(--color-text-secondary) bg-(--color-tag-neutral-bg) px-2.5 py-1.5 text-xs font-medium text-(--color-tag-neutral-text) opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {member.name} ({member.role})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* New Card */}

              {firstList && (
                <CreateCard
                  workspaceId={workspaceId}
                  boardId={boardId}
                  listId={firstList.id}
                  listName={firstList.listName}
                  activeSprintId={activeSprintId}
                  triggerLabel="New card"
                  triggerClassName="cursor-pointer flex h-9 items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  triggerDisabled={
                    listQuery.isLoading ||
                    sprintQuery.isLoading ||
                    !activeSprintId
                  }
                  triggerIconSize={17}
                />
              )}
            </div>
          </div>

          {/* =================================================
          MOBILE ROW
          ================================================== */}

          <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 sm:px-5 lg:hidden">
            {/* LEFT */}

            <div className="flex min-w-0 items-center gap-2">
              {/* Star */}

              <button
                type="button"
                onClick={() =>
                  setFavoriteBoardId(isBoardFavorited ? null : boardId)
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition"
                style={{
                  color: "var(--color-priority-medium)",
                }}
                aria-label={
                  isBoardFavorited ? "Remove board favorite" : "Favorite board"
                }
                aria-pressed={isBoardFavorited}
              >
                <Star
                  size={18}
                  fill={isBoardFavorited ? "currentColor" : "none"}
                />
              </button>

              {/* Members */}

              {visibleMembers.length > 0 && (
                <div className="flex items-center">
                  {visibleMembers.slice(0, 4).map((member, index) => (
                    <div
                      key={member.userId}
                      className={`group relative ${index > 0 ? "-ml-2" : ""}`}
                    >
                      <div
                        role="img"
                        tabIndex={0}
                        aria-label={`${member.name} (${member.role})`}
                        aria-describedby={`mobile-member-tooltip-${member.userId}`}
                        className={`
                        flex h-7 w-7 items-center justify-center
                        rounded-full border-2
                        text-[9px] font-semibold text-white
                        sm:h-8 sm:w-8 sm:text-[10px]
                      `}
                        style={{
                          borderColor: "var(--color-card-bg)",
                          backgroundColor: getAvatarColor(index),
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <span
                        id={`mobile-member-tooltip-${member.userId}`}
                        role="tooltip"
                        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-(--color-text-secondary) bg-(--color-tag-neutral-bg) px-2.5 py-1.5 text-xs font-medium text-(--color-tag-neutral-text) opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {member.name} ({member.role})
                      </span>
                    </div>
                  ))}

                  {visibleMembers.length > 4 && (
                    <div
                      className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-semibold sm:h-8 sm:w-8 sm:text-[10px]"
                      style={{
                        borderColor: "var(--color-card-bg)",
                        backgroundColor: "var(--color-tag-neutral-bg)",
                        color: "var(--color-tag-neutral-text)",
                      }}
                    >
                      +{visibleMembers.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT */}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 ">
              {/* New Card */}

              {firstList && (
                <CreateCard
                  workspaceId={workspaceId}
                  boardId={boardId}
                  listId={firstList.id}
                  listName={firstList.listName}
                  activeSprintId={activeSprintId}
                  triggerLabel=""
                  triggerClassName="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:w-9"
                  triggerAriaLabel="New card"
                  triggerDisabled={
                    listQuery.isLoading ||
                    sprintQuery.isLoading ||
                    !activeSprintId
                  }
                  triggerIconSize={17}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
      CREATE SPRINT MODAL
      ===================================================== */}
    </main>
  );
}

// =====================================================
// HELPERS
// =====================================================

function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(index: number) {
  const colors = [
    "var(--color-primary)",
    "var(--color-status-review)",
    "var(--color-status-done)",
    "var(--color-priority-medium)",
    "var(--color-tag-purple-text)",
  ];

  return colors[index % colors.length];
}
