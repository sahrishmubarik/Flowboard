"use client";
import CreateBoard from "@/components/CreateBoardCard";
import WorkspaceModal from "@/components/WorkspaceModal";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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

type Board={
  id:string;
  boardName:string;
  organizationId:string;
  createdBy:string;
  createdAt:string;
  role:"admin"| "owner" |"member" | "manager";
};
type BoardResponse = {
  message: string;
  boards: Board[];
};
export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      throw new Error(
        data.message || "Failed to fetch current user",
      );
    }

    return data;
  },
});
  const workspaces = data?.workspace ?? [];

  const currentWorkspaceId = pathname.match(
    /\/dashboard\/workspace\/([^/]+)/
  )?.[1];

  const selectedWorkspace = workspaces.find(
    (workspace) => workspace.workspaceId === currentWorkspaceId
  );

  const {
    data:boardData,
    isLoading:isBoardsLoading,
    isError:isBoardsError,
  }=useQuery<BoardResponse>({
    queryKey:["boards", currentWorkspaceId],
    enabled:!!currentWorkspaceId,
    queryFn:async()=>{
      const response=await fetch(`/api/workspace/${currentWorkspaceId}/board`);
      const data=await response.json();
      if(!response.ok){
        throw new Error(
          data.message || "Failed to fetch your boards!"
        )
      }
      console.log("Boards get get get frontend response: ", data);
      return data;
    },
  });
const boards = boardData?.boards ?? [];
  const handleWorkspaceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const workspaceId = event.target.value;

    if (!workspaceId) return;

    router.push(`/dashboard/workspace/${workspaceId}`);
    setIsMobileOpen(false);
  };

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
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--mist)] bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm lg:hidden"
        aria-label="Open dashboard sidebar"
      >
        <svg
          width="20"
          height="20"
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

      {/* Mobile overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard sidebar"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-gray-300 bg-[var(--paper-raised)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center border-b border-[var(--mist)] px-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <span
              className="text-[22px] font-semibold tracking-tight text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Flowboard
            </span>

            <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
          </button>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)] lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Organization */}
          <div>
           
    
          
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Organization
              </p>

              {selectedWorkspace && (
                <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--ink-soft)]">
                  {selectedWorkspace.role}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-[var(--mist)]" />
            ) : isError ? (
              <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2 text-xs text-[var(--coral)]">
                Failed to load organizations.
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-3">
                <p className="text-xs text-[var(--ink-soft)]">
                  You do not have an organization yet.
                </p>
              </div>
            ) : (
              <select
                value={currentWorkspaceId ?? ""}
                onChange={handleWorkspaceChange}
                className="w-full cursor-pointer rounded-lg border border-[var(--miglst)] bg-[var(--paper)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--board-line)]"
              >
                <option value="" disabled>
                  Select organization
                </option>

                {workspaces.map((workspace) => (
                  <option
                    key={workspace.workspaceId}
                    value={workspace.workspaceId}
                  >
                    {workspace.workspaceName}
                  </option>
                ))}
              </select>
            )}

            {/* Create organization */}
            <button
              type="button"
              onClick={() => {
                router.push("/dashboard/workspace/create-workspace");
                setIsMobileOpen(false);
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
            >
              <span className="text-lg leading-none">+</span>
              Create new organization
            </button>
          </div>

          {/* Current organization */}
          {selectedWorkspace && (
            <div className="mt-8">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Workspace
              </p>

              <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--board-line)] text-sm font-semibold text-white">
                    {selectedWorkspace.workspaceName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">
                      {selectedWorkspace.workspaceName}
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-[var(--ink-soft)]">
                      {selectedWorkspace.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boards */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Boards
              </p>

              {selectedWorkspace && (
                // <button
                //   type="button"
                //   className="flex h-6 w-6 items-center justify-center rounded-md text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
                //   title="Create board"
                // >
                //   +
                // </button>
                  <button
    type="button"
    onClick={() => setShowCreateBoard(true)}
    className="flex h-6 w-6 items-center justify-center rounded-md text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
    title="Create board"
  >
    +
  </button>
              )}
            </div>
          {selectedWorkspace ? (
  isBoardsLoading ? (
    <div className="space-y-2">
      <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
      <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
    </div>
  ) : isBoardsError ? (
    <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2">
      <p className="text-xs text-[var(--coral)]">
        Failed to load boards.
      </p>
    </div>
  ) : boards.length === 0 ? (
    <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-4 text-center">
      <p className="text-xs text-[var(--ink-soft)]">
        No boards yet
      </p>

      <p className="mt-1 text-[11px] text-[var(--ink-soft)]/70">
        Create a board to get started.
      </p>
    </div>
  ) : (
    <div className="space-y-1">
      {boards.map((board) => (
        <button
          key={board.id}
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/workspace/${selectedWorkspace.workspaceId}/board/${board.id}`
            )
          }
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--board-panel)] text-xs font-semibold text-white">
            {board.boardName.charAt(0).toUpperCase()}
          </span>

          <span className="truncate">
            {board.boardName}
          </span>
        </button>
      ))}
    </div>
  )
) : (
  <p className="px-2 text-xs text-[var(--ink-soft)]">
    Select an organization to view its boards.
  </p>
)}  

  
          </div>
        </div>
        





        {/* Bottom user section */}
        <div className="border-t border-[var(--mist)] p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--board-panel)] text-sm font-semibold text-[var(--paper)]">
    {isUserLoading
      ? "..."
      : userData?.user?.name?.charAt(0).toUpperCase() || "U"}
  </div>

  <div className="min-w-0 flex-1">
    {isUserLoading ? (
      <>
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--mist)]" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-[var(--mist)]" />
      </>
    ) : isUserError ? (
      <p className="text-xs text-[var(--coral)]">
        Failed to load user
      </p>
    ) : (
      <>
        <p className="truncate text-sm font-medium text-[var(--ink)]">
          {userData?.user?.name}
        </p>

        <p className="truncate text-xs text-[var(--ink-soft)]">
          {userData?.user?.email}
        </p>
      </>
    )}
  </div>
</div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-red transition-colors hover:bg-[var(--mist)] hover:text-[red]"
          >
            <svg
              width="17"
              height="17"
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
      </aside>

      {showCreateBoard && selectedWorkspace && (
  <WorkspaceModal
    isOpen={showCreateBoard}
    onClose={() => setShowCreateBoard(false)}
    title="Create Board"
  >
    <CreateBoard
      onClose={() => setShowCreateBoard(false)}
    />
  </WorkspaceModal>
)}
    </>
  );
}