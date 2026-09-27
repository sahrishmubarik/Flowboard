// "use client";
// import CreateBoard from "@/components/CreateBoardCard";
// import WorkspaceModal from "@/components/WorkspaceModal";

// import { usePathname, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";
// import UserProfileCard from "@/components/UserProfileCard";
// type Workspace = {
//   workspaceId: string;
//   workspaceName: string;
//   role: "owner" | "admin" | "manager" | "member";
//   createdAt: string;
// };

// type WorkspaceResponse = {
//   message: string;
//   workspace: Workspace[];
// };
// type CurrentUser = {
//   id: string;
//   name: string;
//   email: string;
// };

// type CurrentUserResponse = {
//   message: string;
//   user: CurrentUser;
// };

// type Board = {
//   id: string;
//   boardName: string;
//   organizationId: string;
//   createdBy: string;
//   createdAt: string;
//   role: "admin" | "owner" | "member" | "manager";
// };
// type BoardResponse = {
//   message: string;
//   boards: Board[];
// };
// export default function DashboardSidebar() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [showCreateBoard, setShowCreateBoard] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const [showChangePassword, setShowChangePassword] = useState(false);
//   const [showUserProfile, setShowUserProfile] = useState(false);
//   const { data, isLoading, isError } = useQuery<WorkspaceResponse>({
//     queryKey: ["workspaces"],
//     queryFn: async () => {
//       const response = await fetch("/api/workspace");

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch workspaces");
//       }

//       return data;
//     },
//   });

//   const {
//     data: userData,
//     isLoading: isUserLoading,
//     isError: isUserError,
//   } = useQuery<CurrentUserResponse>({
//     queryKey: ["current-user"],
//     queryFn: async () => {
//       const response = await fetch("/api/auth");

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch current user");
//       }

//       return data;
//     },
//   });
//   const workspaces = data?.workspace ?? [];

//   const currentWorkspaceId = pathname.match(
//     /\/dashboard\/workspace\/([^/]+)/,
//   )?.[1];

//   const selectedWorkspace = workspaces.find(
//     (workspace) => workspace.workspaceId === currentWorkspaceId,
//   );

//   const {
//     data: boardData,
//     isLoading: isBoardsLoading,
//     isError: isBoardsError,
//   } = useQuery<BoardResponse>({
//     queryKey: ["boards", currentWorkspaceId],
//     enabled: !!currentWorkspaceId,
//     queryFn: async () => {
//       const response = await fetch(
//         `/api/workspace/${currentWorkspaceId}/board`,
//       );
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch your boards!");
//       }
//       console.log("Boards get get get frontend response: ", data);
//       return data;
//     },
//   });
//   const boards = boardData?.boards ?? [];
//   const handleWorkspaceChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     const workspaceId = event.target.value;

//     if (!workspaceId) return;

//     router.push(`/dashboard/workspace/${workspaceId}`);
//     setIsMobileOpen(false);
//   };

//   const handleLogout = async () => {
//     try {
//       const response = await fetch("/api/auth", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action: "logout",
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to logout");
//       }

//       router.push("/auth/login");
//       router.refresh();
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <>
//       {/* Mobile menu button */}
//       <button
//         type="button"
//         onClick={() => setIsMobileOpen(true)}
//         className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--mist)] bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm lg:hidden"
//         aria-label="Open dashboard sidebar"
//       >
//         <svg
//           width="20"
//           height="20"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//         >
//           <path d="M4 6h16" />
//           <path d="M4 12h16" />
//           <path d="M4 18h16" />
//         </svg>
//       </button>

//       {/* Mobile overlay */}
//       {isMobileOpen && (
//         <button
//           type="button"
//           aria-label="Close dashboard sidebar"
//           onClick={() => setIsMobileOpen(false)}
//           className="fixed inset-0 z-40 bg-black/20 lg:hidden"
//         />
//       )}

//       <aside
//         className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-gray-300 bg-[var(--paper-raised)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
//           isMobileOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* Logo */}
//         <div className="flex h-[76px] items-center border-b border-[var(--mist)] px-6">
//           <button
//             type="button"
//             onClick={() => router.push("/dashboard")}
//             className="flex items-center gap-2"
//           >
//             <span
//               className="text-[22px] font-semibold tracking-tight text-[var(--ink)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Flowboard
//             </span>

//             <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
//           </button>

//           {/* Mobile close */}
//           <button
//             type="button"
//             onClick={() => setIsMobileOpen(false)}
//             className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)] lg:hidden"
//             aria-label="Close sidebar"
//           >
//             ×
//           </button>
//         </div>

//         {/* Sidebar content */}
//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           {/* Organization */}
//           <div>
//             <div className="mb-2 flex items-center justify-between px-2">
//               <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Organization
//               </p>

//               {selectedWorkspace && (
//                 <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--ink-soft)]">
//                   {selectedWorkspace.role}
//                 </span>
//               )}
//             </div>

//             {isLoading ? (
//               <div className="h-10 animate-pulse rounded-lg bg-[var(--mist)]" />
//             ) : isError ? (
//               <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2 text-xs text-[var(--coral)]">
//                 Failed to load organizations.
//               </div>
//             ) : workspaces.length === 0 ? (
//               <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-3">
//                 <p className="text-xs text-[var(--ink-soft)]">
//                   You do not have an organization yet.
//                 </p>
//               </div>
//             ) : (
//               <select
//                 value={currentWorkspaceId ?? ""}
//                 onChange={handleWorkspaceChange}
//                 className="w-full cursor-pointer rounded-lg border border-[var(--miglst)] bg-[var(--paper)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--board-line)]"
//               >
//                 <option value="" disabled>
//                   Select organization
//                 </option>

//                 {workspaces.map((workspace) => (
//                   <option
//                     key={workspace.workspaceId}
//                     value={workspace.workspaceId}
//                   >
//                     {workspace.workspaceName}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Create organization */}
//             <button
//               type="button"
//               onClick={() => {
//                 router.push("/dashboard/workspace/create-workspace");
//                 setIsMobileOpen(false);
//               }}
//               className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//             >
//               <span className="text-lg leading-none">+</span>
//               Create new organization
//             </button>
//           </div>

//           {/* Current organization */}
//           {selectedWorkspace && (
//             <div className="mt-8">
//               <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Workspace
//               </p>

//               <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-3">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--board-line)] text-sm font-semibold text-white">
//                     {selectedWorkspace.workspaceName.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="min-w-0">
//                     <p className="truncate text-sm font-semibold text-[var(--ink)]">
//                       {selectedWorkspace.workspaceName}
//                     </p>

//                     <p className="mt-0.5 text-xs capitalize text-[var(--ink-soft)]">
//                       {selectedWorkspace.role}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Boards */}
//           <div className="mt-8">
//             <div className="mb-2 flex items-center justify-between px-2">
//               <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Boards
//               </p>

//               {selectedWorkspace && (
//                 // <button
//                 //   type="button"
//                 //   className="flex h-6 w-6 items-center justify-center rounded-md text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                 //   title="Create board"
//                 // >
//                 //   +
//                 // </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateBoard(true)}
//                   className="flex h-6 w-6 items-center justify-center rounded-md text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   title="Create board"
//                 >
//                   +
//                 </button>
//               )}
//             </div>
//             {selectedWorkspace ? (
//               isBoardsLoading ? (
//                 <div className="space-y-2">
//                   <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
//                   <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
//                 </div>
//               ) : isBoardsError ? (
//                 <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2">
//                   <p className="text-xs text-[var(--coral)]">
//                     Failed to load boards.
//                   </p>
//                 </div>
//               ) : boards.length === 0 ? (
//                 <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-4 text-center">
//                   <p className="text-xs text-[var(--ink-soft)]">
//                     No boards yet
//                   </p>

//                   <p className="mt-1 text-[11px] text-[var(--ink-soft)]/70">
//                     Create a board to get started.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   {boards.map((board) => (
//                     <button
//                       key={board.id}
//                       type="button"
//                       onClick={() =>
//                         router.push(
//                           `/dashboard/workspace/${selectedWorkspace.workspaceId}/board/${board.id}`,
//                         )
//                       }
//                       className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
//                     >
//                       <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--board-panel)] text-xs font-semibold text-white">
//                         {board.boardName.charAt(0).toUpperCase()}
//                       </span>

//                       <span className="truncate">{board.boardName}</span>
//                     </button>
//                   ))}
//                 </div>
//               )
//             ) : (
//               <p className="px-2 text-xs text-[var(--ink-soft)]">
//                 Select an organization to view its boards.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Bottom user section */}
//         <div className="relative border-t border-[var(--mist)] p-4">
//           {/* Bottom user section */}
//           <div className="border-t border-[var(--mist)] p-4">
//             <button
//               type="button"
//               onClick={() => setShowUserProfile(true)}
//               className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--mist)]"
//             >
//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--board-panel)] text-sm font-semibold text-[var(--paper)]">
//                 {isUserLoading
//                   ? "..."
//                   : userData?.user?.name?.charAt(0).toUpperCase() || "U"}
//               </div>

//               <div className="min-w-0 flex-1">
//                 {isUserLoading ? (
//                   <>
//                     <div className="h-4 w-24 animate-pulse rounded bg-[var(--mist)]" />
//                     <div className="mt-1 h-3 w-32 animate-pulse rounded bg-[var(--mist)]" />
//                   </>
//                 ) : isUserError ? (
//                   <p className="text-xs text-[var(--coral)]">
//                     Failed to load user
//                   </p>
//                 ) : (
//                   <>
//                     <p className="truncate text-sm font-medium text-[var(--ink)]">
//                       {userData?.user?.name}
//                     </p>

//                     <p className="truncate text-xs text-[var(--ink-soft)]">
//                       {userData?.user?.email}
//                     </p>
//                   </>
//                 )}
//               </div>

//               <span className="text-xs text-[var(--ink-soft)]">→</span>
//             </button>
//           </div>
//           <button
//             type="button"
//             onClick={handleLogout}
//             className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--mist)]"
//           >
//             <svg
//               width="17"
//               height="17"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M10 17l5-5-5-5" />
//               <path d="M15 12H3" />
//               <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
//             </svg>
//             Sign out
//           </button>
//         </div>
//       </aside>

//       {showCreateBoard && selectedWorkspace && (
//         <WorkspaceModal
//           isOpen={showCreateBoard}
//           onClose={() => setShowCreateBoard(false)}
//           title="Create Board"
//         >
//           <CreateBoard onClose={() => setShowCreateBoard(false)} />
//         </WorkspaceModal>
//       )}
//       {/* {showChangePassword && (
//         <WorkspaceModal
//           isOpen={showChangePassword}
//           onClose={() => setShowChangePassword(false)}
//           title="Change Password"
//         >
//           <ChangePasswordCard onClose={() => setShowChangePassword(false)} />
//         </WorkspaceModal> */}
//       {/* )} */}

//       <UserProfileCard
//         isOpen={showUserProfile}
//         onClose={() => setShowUserProfile(false)}
//         user={userData?.user ?? null}
//         onLogout={handleLogout}
//       />
//     </>
//   );
// // }

// "use client";

// import CreateBoard from "@/components/CreateBoardCard";
// import WorkspaceModal from "@/components/WorkspaceModal";
// import UserProfileCard from "@/components/UserProfileCard";

// import { usePathname, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import { useState } from "react";

// type Workspace = {
//   workspaceId: string;
//   workspaceName: string;
//   role: "owner" | "admin" | "manager" | "member";
//   createdAt: string;
// };

// type WorkspaceResponse = {
//   message: string;
//   workspace: Workspace[];
// };

// type CurrentUser = {
//   id: string;
//   name: string;
//   email: string;
// };

// type CurrentUserResponse = {
//   message: string;
//   user: CurrentUser;
// };

// type Board = {
//   id: string;
//   boardName: string;
//   organizationId: string;
//   createdBy: string;
//   createdAt: string;
//   role: "admin" | "owner" | "member" | "manager";
// };

// type BoardResponse = {
//   message: string;
//   boards: Board[];
// };

// export default function DashboardSidebar() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [showCreateBoard, setShowCreateBoard] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [showUserProfile, setShowUserProfile] = useState(false);

//   /* -------------------------------------------------------------------------- */
//   /* Workspaces                                                                  */
//   /* -------------------------------------------------------------------------- */

//   const { data, isLoading, isError } = useQuery<WorkspaceResponse>({
//     queryKey: ["workspaces"],
//     queryFn: async () => {
//       const response = await fetch("/api/workspace");
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch workspaces");
//       }

//       return data;
//     },
//   });

//   /* -------------------------------------------------------------------------- */
//   /* Current user                                                                */
//   /* -------------------------------------------------------------------------- */

//   const {
//     data: userData,
//     isLoading: isUserLoading,
//     isError: isUserError,
//   } = useQuery<CurrentUserResponse>({
//     queryKey: ["current-user"],
//     queryFn: async () => {
//       const response = await fetch("/api/auth");
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch current user");
//       }

//       return data;
//     },
//   });

//   const workspaces = data?.workspace ?? [];

//   /* -------------------------------------------------------------------------- */
//   /* Current workspace                                                           */
//   /* -------------------------------------------------------------------------- */

//   const currentWorkspaceId = pathname.match(
//     /\/dashboard\/workspace\/([^/]+)/,
//   )?.[1];

//   const selectedWorkspace = workspaces.find(
//     (workspace) => workspace.workspaceId === currentWorkspaceId,
//   );

//   /* -------------------------------------------------------------------------- */
//   /* Boards                                                                      */
//   /* -------------------------------------------------------------------------- */

//   const {
//     data: boardData,
//     isLoading: isBoardsLoading,
//     isError: isBoardsError,
//   } = useQuery<BoardResponse>({
//     queryKey: ["boards", currentWorkspaceId],
//     enabled: !!currentWorkspaceId,

//     queryFn: async () => {
//       const response = await fetch(
//         `/api/workspace/${currentWorkspaceId}/board`,
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch your boards!");
//       }

//       return data;
//     },
//   });

//   const boards = boardData?.boards ?? [];

//   /* -------------------------------------------------------------------------- */
//   /* Navigation                                                                  */
//   /* -------------------------------------------------------------------------- */

//   const navigate = (path: string) => {
//     router.push(path);
//     setIsMobileOpen(false);
//   };

//   const handleWorkspaceChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     const workspaceId = event.target.value;

//     if (!workspaceId) return;

//     navigate(`/dashboard/workspace/${workspaceId}`);
//   };

//   /* -------------------------------------------------------------------------- */
//   /* Logout                                                                      */
//   /* -------------------------------------------------------------------------- */

//   const handleLogout = async () => {
//     try {
//       const response = await fetch("/api/auth", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action: "logout",
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to logout");
//       }

//       router.push("/auth/login");
//       router.refresh();
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   /* -------------------------------------------------------------------------- */
//   /* Active navigation                                                           */
//   /* -------------------------------------------------------------------------- */

//   const isOverviewActive =
//     !!currentWorkspaceId &&
//     pathname === `/dashboard/workspace/${currentWorkspaceId}`;

//   const isBoardsActive =
//     !!currentWorkspaceId &&
//     pathname.startsWith(`/dashboard/workspace/${currentWorkspaceId}/board`);

//   const isMembersActive =
//     !!currentWorkspaceId &&
//     pathname.startsWith(`/dashboard/workspace/${currentWorkspaceId}/members`);

//   const isInvitationsActive =
//     !!currentWorkspaceId &&
//     pathname.startsWith(
//       `/dashboard/workspace/${currentWorkspaceId}/invitation`,
//     );

//   return (
//     <>
//       {/* --------------------------------------------------------------------- */}
//       {/* Mobile menu button                                                     */}
//       {/* --------------------------------------------------------------------- */}

//       <button
//         type="button"
//         onClick={() => setIsMobileOpen(true)}
//         className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--mist)] bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm lg:hidden"
//         aria-label="Open dashboard sidebar"
//       >
//         <svg
//           width="20"
//           height="20"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//         >
//           <path d="M4 6h16" />
//           <path d="M4 12h16" />
//           <path d="M4 18h16" />
//         </svg>
//       </button>

//       {/* --------------------------------------------------------------------- */}
//       {/* Mobile overlay                                                         */}
//       {/* --------------------------------------------------------------------- */}

//       {isMobileOpen && (
//         <button
//           type="button"
//           aria-label="Close dashboard sidebar"
//           onClick={() => setIsMobileOpen(false)}
//           className="fixed inset-0 z-40 bg-black/20 lg:hidden"
//         />
//       )}

//       {/* --------------------------------------------------------------------- */}
//       {/* Sidebar                                                                */}
//       {/* --------------------------------------------------------------------- */}

//       <aside
//         className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[var(--mist)] bg-[var(--paper-raised)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
//           isMobileOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         {/* ------------------------------------------------------------------- */}
//         {/* Logo                                                                */}
//         {/* ------------------------------------------------------------------- */}

//         <div className="flex h-[76px] items-center border-b border-[var(--mist)] px-6">
//           <button
//             type="button"
//             onClick={() => navigate("/dashboard")}
//             className="flex items-center gap-2"
//           >
//             <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
//             <span
//               className="text-[22px] font-semibold tracking-tight text-[var(--ink)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Flowboard
//             </span>
//           </button>

//           <button
//             type="button"
//             onClick={() => setIsMobileOpen(false)}
//             className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)] lg:hidden"
//             aria-label="Close sidebar"
//           >
//             ×
//           </button>
//         </div>

//         {/* ------------------------------------------------------------------- */}
//         {/* Sidebar content                                                      */}
//         {/* ------------------------------------------------------------------- */}

//         <div className="flex-1 overflow-y-auto px-4 py-6">
//           {/* ================================================================ */}
//           {/* Organization                                                      */}
//           {/* ================================================================ */}

//           <div>
//             <div className="mb-2 flex items-center justify-between px-2">
//               <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Organization
//               </p>

//               {selectedWorkspace && (
//                 <span className="rounded-full bg-[var(--mist)] px-2 py-0.5 text-[10px] font-medium uppercase text-[var(--ink-soft)]">
//                   {selectedWorkspace.role}
//                 </span>
//               )}
//             </div>

//             {isLoading ? (
//               <div className="h-10 animate-pulse rounded-lg bg-[var(--mist)]" />
//             ) : isError ? (
//               <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2 text-xs text-[var(--coral)]">
//                 Failed to load organizations.
//               </div>
//             ) : workspaces.length === 0 ? (
//               <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-3">
//                 <p className="text-xs text-[var(--ink-soft)]">
//                   You do not have an organization yet.
//                 </p>
//               </div>
//             ) : (
//               <select
//                 value={currentWorkspaceId ?? ""}
//                 onChange={handleWorkspaceChange}
//                 className="w-full cursor-pointer rounded-lg border border-[var(--mist)] bg-[var(--paper)] px-3 py-2.5 text-sm font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--board-line)]"
//               >
//                 <option value="" disabled>
//                   Select organization
//                 </option>

//                 {workspaces.map((workspace) => (
//                   <option
//                     key={workspace.workspaceId}
//                     value={workspace.workspaceId}
//                   >
//                     {workspace.workspaceName}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Create organization */}

//             <button
//               type="button"
//               onClick={() => {
//                 navigate("/dashboard/workspace/create-workspace");
//               }}
//               className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//             >
//               <span className="text-lg leading-none">+</span>
//               Create new organization
//             </button>
//           </div>

//           {/* ================================================================ */}
//           {/* Current organization                                              */}
//           {/* ================================================================ */}

//           {/* {selectedWorkspace && (
//             <div className="mt-8">
//               <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Workspace
//               </p>

//               <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-3">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--board-line)] text-sm font-semibold text-white">
//                     {selectedWorkspace.workspaceName.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="min-w-0">
//                     <p className="truncate text-sm font-semibold text-[var(--ink)]">
//                       {selectedWorkspace.workspaceName}
//                     </p>

//                     <p className="mt-0.5 text-xs capitalize text-[var(--ink-soft)]">
//                       {selectedWorkspace.role}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )} */}

//           {/* ================================================================ */}
//           {/* Workspace navigation                                              */}
//           {/* ================================================================ */}

//           {selectedWorkspace && (
//             <div className="mt-8">
//               <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Workspace
//               </p>

//               <nav className="space-y-1">
//                 {/* Overview */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       `/dashboard/workspace/${selectedWorkspace.workspaceId}`,
//                     )
//                   }
//                   className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
//                     isOverviewActive
//                       ? "bg-[var(--board-panel)] text-white"
//                       : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   }`}
//                 >
//                   <svg
//                     width="17"
//                     height="17"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                   >
//                     <rect x="3" y="3" width="7" height="7" rx="1" />
//                     <rect x="14" y="3" width="7" height="7" rx="1" />
//                     <rect x="3" y="14" width="7" height="7" rx="1" />
//                     <rect x="14" y="14" width="7" height="7" rx="1" />
//                   </svg>
//                   Overview
//                 </button>

//                 {/* Boards */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       `/dashboard/workspace/${selectedWorkspace.workspaceId}`,
//                     )
//                   }
//                   className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
//                     isBoardsActive
//                       ? "bg-[var(--mist)] text-[var(--ink)]"
//                       : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   }`}
//                 >
//                   <svg
//                     width="17"
//                     height="17"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <rect x="4" y="4" width="16" height="16" rx="2" />
//                     <path d="M9 4v16" />
//                     <path d="M9 9h11" />
//                   </svg>
//                   Boards
//                   <span className="ml-auto rounded-full bg-[var(--paper-raised)] px-2 py-0.5 text-[10px] font-medium text-[var(--ink-soft)]">
//                     {boards.length}
//                   </span>
//                 </button>

//                 {/* Members */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       `/dashboard/workspace/${selectedWorkspace.workspaceId}/members`,
//                     )
//                   }
//                   className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
//                     isMembersActive
//                       ? "bg-[var(--mist)] text-[var(--ink)]"
//                       : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   }`}
//                 >
//                   <svg
//                     width="17"
//                     height="17"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                     <circle cx="9" cy="7" r="4" />
//                     <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//                     <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//                   </svg>
//                   Members
//                 </button>

//                 {/* Invitations */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       `/dashboard/workspace/${selectedWorkspace.workspaceId}/invitation`,
//                     )
//                   }
//                   className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
//                     isInvitationsActive
//                       ? "bg-[var(--mist)] text-[var(--ink)]"
//                       : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   }`}
//                 >
//                   <svg
//                     width="17"
//                     height="17"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <rect x="3" y="5" width="18" height="14" rx="2" />
//                     <path d="m3 7 9 6 9-6" />
//                   </svg>
//                   Invitations
//                 </button>
//               </nav>
//             </div>
//           )}

//           {/* ================================================================ */}
//           {/* Boards                                                             */}
//           {/* ================================================================ */}

//           <div className="mt-8">
//             <div className="mb-2 flex items-center justify-between px-2">
//               <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
//                 Boards
//               </p>

//               {selectedWorkspace && (
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateBoard(true)}
//                   className="flex h-6 w-6 items-center justify-center rounded-md text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
//                   title="Create board"
//                 >
//                   +
//                 </button>
//               )}
//             </div>

//             {selectedWorkspace ? (
//               isBoardsLoading ? (
//                 <div className="space-y-2">
//                   <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
//                   <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
//                 </div>
//               ) : isBoardsError ? (
//                 <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-3 py-2">
//                   <p className="text-xs text-[var(--coral)]">
//                     Failed to load boards.
//                   </p>
//                 </div>
//               ) : boards.length === 0 ? (
//                 <div className="rounded-lg border border-dashed border-[var(--mist)] px-3 py-4 text-center">
//                   <p className="text-xs text-[var(--ink-soft)]">
//                     No boards yet
//                   </p>

//                   <p className="mt-1 text-[11px] text-[var(--ink-soft)]/70">
//                     Create a board to get started.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   {boards.map((board) => (
//                     <button
//                       key={board.id}
//                       type="button"
//                       onClick={() =>
//                         navigate(
//                           `/dashboard/workspace/${selectedWorkspace.workspaceId}/board/${board.id}`,
//                         )
//                       }
//                       className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--mist)]"
//                     >
//                       <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--board-panel)] text-xs font-semibold text-white">
//                         {board.boardName.charAt(0).toUpperCase()}
//                       </span>

//                       <span className="truncate">{board.boardName}</span>
//                     </button>
//                   ))}
//                 </div>
//               )
//             ) : (
//               <p className="px-2 text-xs text-[var(--ink-soft)]">
//                 Select an organization to view its boards.
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ------------------------------------------------------------------- */}
//         {/* Bottom user section — PRESERVED                                    */}
//         {/* ------------------------------------------------------------------- */}

//         <div className="border-t border-[var(--mist)] p-4">
//           <button
//             type="button"
//             onClick={() => setShowUserProfile(true)}
//             className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--mist)]"
//           >
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--board-panel)] text-sm font-semibold text-[var(--paper)]">
//               {isUserLoading
//                 ? "..."
//                 : userData?.user?.name?.charAt(0).toUpperCase() || "U"}
//             </div>

//             <div className="min-w-0 flex-1">
//               {isUserLoading ? (
//                 <>
//                   <div className="h-4 w-24 animate-pulse rounded bg-[var(--mist)]" />
//                   <div className="mt-1 h-3 w-32 animate-pulse rounded bg-[var(--mist)]" />
//                 </>
//               ) : isUserError ? (
//                 <p className="text-xs text-[var(--coral)]">
//                   Failed to load user
//                 </p>
//               ) : (
//                 <>
//                   <p className="truncate text-sm font-medium text-[var(--ink)]">
//                     {userData?.user?.name}
//                   </p>

//                   <p className="truncate text-xs text-[var(--ink-soft)]">
//                     {userData?.user?.email}
//                   </p>
//                 </>
//               )}
//             </div>

//             <span className="text-xs text-[var(--ink-soft)]">→</span>
//           </button>

//           <button
//             type="button"
//             onClick={handleLogout}
//             className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--coral)] transition-colors hover:bg-[var(--mist)]"
//           >
//             <svg
//               width="17"
//               height="17"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M10 17l5-5-5-5" />
//               <path d="M15 12H3" />
//               <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
//             </svg>
//             Sign out
//           </button>
//         </div>
//       </aside>

//       {/* --------------------------------------------------------------------- */}
//       {/* Create board modal                                                    */}
//       {/* --------------------------------------------------------------------- */}

//       {showCreateBoard && selectedWorkspace && (
//         <WorkspaceModal
//           isOpen={showCreateBoard}
//           onClose={() => setShowCreateBoard(false)}
//           title="Create Board"
//         >
//           <CreateBoard onClose={() => setShowCreateBoard(false)} />
//         </WorkspaceModal>
//       )}

//       {/* --------------------------------------------------------------------- */}
//       {/* User profile                                                           */}
//       {/* --------------------------------------------------------------------- */}

//       <UserProfileCard
//         isOpen={showUserProfile}
//         onClose={() => setShowUserProfile(false)}
//         user={userData?.user ?? null}
//         onLogout={handleLogout}
//       />
//     </>
//   );
// }

"use client";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import CreateBoard from "@/components/CreateBoardCard";
import WorkspaceModal from "@/components/WorkspaceModal";
import UserProfileCard from "@/components/UserProfileCard";

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
  const [showUserProfile, setShowUserProfile] = useState(false);

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

  const handleWorkspaceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const workspaceId = event.target.value;

    if (!workspaceId) return;

    router.push(`/dashboard/workspace/${workspaceId}`);

    setShowBoardsDropdown(false);
    setIsMobileOpen(false);
  };

  const handleBoardClick = (boardId: string) => {
    if (!selectedWorkspace) return;

    router.push(
      `/dashboard/workspace/${selectedWorkspace.workspaceId}/board/${boardId}`,
    );

    setShowBoardsDropdown(false);
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
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--mist)] bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm lg:hidden"
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[var(--mist)] bg-[var(--paper-raised)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ================================================================ */}
        {/* Logo                                                              */}
        {/* ================================================================ */}

        <div className="flex h-[62px] shrink-0 items-center border-b border-[var(--mist)] px-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <span
              className="text-[19px] font-semibold tracking-tight text-[var(--ink)]"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              Flowboard
            </span>

            <span className="h-2 w-2 rounded-full bg-[var(--amber)]" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)] lg:hidden"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Organization
              </p>

              {selectedWorkspace && (
                <span className="rounded-full bg-[var(--mist)] px-1.5 py-0.5 text-[11px] font-medium uppercase text-[var(--ink-soft)]">
                  {selectedWorkspace.role}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-9 animate-pulse rounded-lg bg-[var(--mist)]" />
            ) : isError ? (
              <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/5 px-2.5 py-2 text-[12px] text-[var(--coral)]">
                Failed to load organizations.
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--mist)] px-2.5 py-2.5">
                <p className="text-[11px] text-[var(--ink-soft)]">
                  No organization yet.
                </p>
              </div>
            ) : (
              <select
                value={currentWorkspaceId ?? ""}
                onChange={handleWorkspaceChange}
                className="w-full cursor-pointer rounded-lg border border-[var(--mist)] bg-[var(--paper)] px-2.5 py-2 text-[12px] font-medium text-[var(--ink)] outline-none transition-colors focus:border-[var(--board-line)]"
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

            <button
              type="button"
              onClick={() => {
                router.push("/dashboard/workspace/create-workspace");

                setIsMobileOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
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
              <p className="mb-1.5 px-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Workspace
              </p>

              <div className="rounded-lg border border-[var(--mist)] bg-[var(--paper)] px-2.5 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--board-line)] text-[12px] font-semibold text-white">
                    {selectedWorkspace.workspaceName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[var(--ink)]">
                      {selectedWorkspace.workspaceName}
                    </p>

                    <p className="mt-0.5 text-[12px] capitalize text-[var(--ink-soft)]">
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
              {/* Overview */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/workspace/${selectedWorkspace.workspaceId}`,
                  )
                }
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                  pathname ===
                  `/dashboard/workspace/${selectedWorkspace.workspaceId}`
                    ? "bg-[var(--mist)] text-[var(--ink)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
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

              {/* Boards dropdown */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBoardsDropdown((previous) => !previous)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
                    showBoardsDropdown
                      ? "bg-[var(--mist)] text-[var(--ink)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
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

                  <span className="mr-0.5 text-[12px] text-[var(--ink-soft)]">
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
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] overflow-hidden rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-lg">
                    {/* Dropdown header */}

                    <div className="flex items-center justify-between border-b border-[var(--mist)] px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                        Your boards
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowCreateBoard(true)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[12px] text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
                        title="Create board"
                      >
                        +
                      </button>
                    </div>

                    {/* Board list */}

                    <div className="max-h-[240px] overflow-y-auto p-1.5">
                      {isBoardsLoading ? (
                        <div className="space-y-1">
                          <div className="h-8 animate-pulse rounded-lg bg-[var(--mist)]" />
                          <div className="h-8 animate-pulse rounded-lg bg-[var(--mist)]" />
                          <div className="h-8 animate-pulse rounded-lg bg-[var(--mist)]" />
                        </div>
                      ) : isBoardsError ? (
                        <div className="rounded-lg bg-[var(--coral)]/5 px-2.5 py-2">
                          <p className="text-[12px] text-[var(--coral)]">
                            Failed to load boards.
                          </p>
                        </div>
                      ) : boards.length === 0 ? (
                        <div className="px-2.5 py-4 text-center">
                          <p className="text-[12px] font-medium text-[var(--ink)]">
                            No boards yet
                          </p>

                          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">
                            Create your first board.
                          </p>

                          <button
                            type="button"
                            onClick={() => setShowCreateBoard(true)}
                            className="mt-2 rounded-lg bg-[var(--board-panel)] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[var(--board-ink)]"
                          >
                            Create board
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {boards.map((board) => {
                            const isActive = pathname.includes(
                              `/board/${board.id}`,
                            );

                            return (
                              <button
                                key={board.id}
                                type="button"
                                onClick={() => handleBoardClick(board.id)}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                  isActive
                                    ? "bg-[var(--mist)]"
                                    : "hover:bg-[var(--mist)]"
                                }`}
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--board-panel)] text-[13px] font-semibold text-white">
                                  {board.boardName.charAt(0).toUpperCase()}
                                </span>

                                <span
                                  className={`min-w-0 flex-1 truncate text-xs ${
                                    isActive
                                      ? "font-semibold text-[var(--ink)]"
                                      : "text-[var(--ink)]"
                                  }`}
                                >
                                  {board.boardName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Members */}
              <button
                type="button"
                onClick={() => {
                  setShowMembers(true);
                  setShowInvitations(false);
                  setShowBoardsDropdown(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  showMembers
                    ? "bg-[var(--mist)] text-[var(--ink)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
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

              {/* Invitations */}

              <button
                type="button"
                onClick={() => {
                  setShowInvitations(true);
                  setShowMembers(false);
                  setShowBoardsDropdown(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  showInvitations
                    ? "bg-[var(--mist)] text-[var(--ink)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
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
        {/* Bottom user section — kept as your profile/action area           */}
        {/* ================================================================ */}

        <div className="shrink-0 border-t border-[var(--mist)] p-3">
          <button
            type="button"
            onClick={() => setShowUserProfile(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--mist)]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--board-panel)] text-[13px] font-semibold text-[var(--paper)]">
              {isUserLoading
                ? "..."
                : userData?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              {isUserLoading ? (
                <>
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[var(--mist)]" />
                  <div className="mt-1 h-2.5 w-28 animate-pulse rounded bg-[var(--mist)]" />
                </>
              ) : isUserError ? (
                <p className="text-[12px] text-[var(--coral)]">
                  Failed to load user
                </p>
              ) : (
                <>
                  <p className="truncate text-[15px] font-medium text-[var(--ink)]">
                    {userData?.user?.name}
                  </p>

                  <p className="truncate text-[13px] text-[var(--ink-soft)]">
                    {userData?.user?.email}
                  </p>
                </>
              )}
            </div>

            <span className="text-xs text-[var(--ink-soft)]">→</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] text-[var(--coral)] transition-colors hover:bg-[var(--mist)]"
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

      {showMembers && selectedWorkspace && (
        <WorkspaceModal
          isOpen={showMembers}
          onClose={() => setShowMembers(false)}
          title="Workspace Members"
        >
          <WorkspaceMemberCard />
        </WorkspaceModal>
      )}
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
