"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Share2,
  SlidersHorizontal,
  Star,
} from "lucide-react";

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

export default function BoardHeader() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const boardId = params.boardId as string;

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

              <span
                className="max-w-[120px] truncate text-xs sm:max-w-[180px] sm:text-sm lg:max-w-none lg:text-[15px]"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                {workspaceName}
              </span>

              <span
                className="shrink-0"
                style={{
                  color: "var(--color-border)",
                }}
              >
                /
              </span>

              {/* Board */}

              <button
                type="button"
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
              </button>

              {/* Star */}

              <button
                type="button"
                className="ml-1 hidden rounded-md p-1.5 transition lg:block"
                style={{
                  color: "var(--color-priority-medium)",
                }}
                aria-label="Favorite board"
              >
                <Star size={19} />
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
                      title={`${member.name} (${member.role})`}
                      className={`
                        flex h-8 w-8 items-center justify-center
                        rounded-full border-2
                        text-[11px] font-semibold text-white
                        ${index > 0 ? "-ml-2" : ""}
                      `}
                      style={{
                        borderColor: "var(--color-card-bg)",
                        backgroundColor: getAvatarColor(index),
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                  ))}
                </div>
              )}

              {/* Share */}

              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
              >
                <Share2 size={16} />
                Share
              </button>

              {/* Settings */}

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border transition"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
                aria-label="Board settings"
              >
                <SlidersHorizontal size={17} />
              </button>

              {/* More */}

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md transition"
                style={{
                  color: "var(--color-text-muted)",
                }}
                aria-label="More actions"
              >
                <MoreHorizontal size={19} />
              </button>

              {/* New Card */}

              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                <Plus size={17} />
                New card
              </button>
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition"
                style={{
                  color: "var(--color-priority-medium)",
                }}
                aria-label="Favorite board"
              >
                <Star size={18} />
              </button>

              {/* Members */}

              {visibleMembers.length > 0 && (
                <div className="flex items-center">
                  {visibleMembers.slice(0, 4).map((member, index) => (
                    <div
                      key={member.userId}
                      title={`${member.name} (${member.role})`}
                      className={`
                        flex h-7 w-7 items-center justify-center
                        rounded-full border-2
                        text-[9px] font-semibold text-white
                        sm:h-8 sm:w-8 sm:text-[10px]
                        ${index > 0 ? "-ml-2" : ""}
                      `}
                      style={{
                        borderColor: "var(--color-card-bg)",
                        backgroundColor: getAvatarColor(index),
                      }}
                    >
                      {getInitials(member.name)}
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

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Share */}

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border transition sm:h-9 sm:w-9"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>

              {/* Settings */}

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border transition sm:h-9 sm:w-9"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-card-bg)",
                }}
                aria-label="Board settings"
              >
                <SlidersHorizontal size={15} />
              </button>

              {/* More */}

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md transition sm:h-9 sm:w-9"
                style={{
                  color: "var(--color-text-muted)",
                }}
                aria-label="More actions"
              >
                <MoreHorizontal size={19} />
              </button>

              {/* New Card */}

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-white transition sm:h-9 sm:w-9"
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
                aria-label="New card"
              >
                <Plus size={17} />
              </button>
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
