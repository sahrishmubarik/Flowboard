// // "use client";

// // import { useParams } from "next/navigation";
// // import { useEffect, useState } from "react";

// // type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED";

// // type Invitation = {
// //   id: string;
// //   email: string;
// //   role: string;
// //   status: InvitationStatus;
// //   expiresAt: string;
// //   createdAt: string;
// // };

// // type InvitationResponse = {
// //   message: string;
// //   invitations: Invitation[];
// //   pagination: {
// //     page: number;
// //     limit: number;
// //     total: number;
// //     totalPages: number;
// //   };
// // };

// // export default function InvitationStatusCard() {
// //   const params = useParams();

// //   const workspaceId = params.workspaceId as string;

// //   const [invitations, setInvitations] = useState<Invitation[]>([]);
// //   const [page, setPage] = useState(1);
// //   const [limit, setLimit] = useState(5);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [total, setTotal] = useState(0);

// //   const [isLoading, setIsLoading] = useState(true);
// //   const [revokingId, setRevokingId] = useState<string | null>(null);

// //   const [error, setError] = useState("");
// //   useEffect(() => {
// //     if (!workspaceId) return;

// //     let cancelled = false;

// //     async function loadInvitations() {
// //       try {
// //         const response = await fetch(
// //           `/api/workspace/${workspaceId}/invitation?page=${page}&limit=${limit}`,
// //           {
// //             method: "GET",
// //           },
// //         );

// //         const data: InvitationResponse = await response.json();

// //         if (!response.ok) {
// //           throw new Error(data.message || "Failed to fetch invitations.");
// //         }

// //         if (cancelled) return;

// //         setInvitations(data.invitations);
// //         setTotalPages(data.pagination.totalPages);
// //         setTotal(data.pagination.total);
// //         setError("");
// //       } catch (error) {
// //         if (cancelled) return;

// //         console.error("FETCH_INVITATIONS_ERROR:", error);

// //         setError(
// //           error instanceof Error
// //             ? error.message
// //             : "Failed to fetch invitations.",
// //         );
// //       } finally {
// //         if (!cancelled) {
// //           setIsLoading(false);
// //         }
// //       }
// //     }

// //     void loadInvitations();

// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [workspaceId, page, limit]);

// //   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
// //     setIsLoading(true);
// //     setError("");
// //     setLimit(Number(event.target.value));
// //     setPage(1);
// //   };

// //   // const handlePrevious = () => {
// //   //   setPage((currentPage) => Math.max(currentPage - 1, 1));
// //   // };
// //   const handlePrevious = () => {
// //     setIsLoading(true);
// //     setError("");

// //     setPage((currentPage) => Math.max(currentPage - 1, 1));
// //   };

// //   // const handleNext = () => {
// //   //   setPage((currentPage) => Math.min(currentPage + 1, totalPages));
// //   // };
// //   const handleNext = () => {
// //     setIsLoading(true);
// //     setError("");

// //     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
// //   };

// //   const handleRevoke = async (email: string, invitationId: string) => {
// //     try {
// //       setRevokingId(invitationId);
// //       setError("");

// //       const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
// //         method: "PATCH",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           email,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.message || "Failed to revoke invitation.");
// //       }

// //       setInvitations((currentInvitations) =>
// //         currentInvitations.map((invitation) =>
// //           invitation.id === invitationId
// //             ? {
// //                 ...invitation,
// //                 status: "REVOKED",
// //               }
// //             : invitation,
// //         ),
// //       );
// //     } catch (error) {
// //       console.error("REVOKE_INVITATION_ERROR:", error);

// //       setError(
// //         error instanceof Error ? error.message : "Failed to revoke invitation.",
// //       );
// //     } finally {
// //       setRevokingId(null);
// //     }
// //   };

// //   const getStatusStyle = (status: InvitationStatus) => {
// //     if (status === "ACCEPTED") {
// //       return {
// //         backgroundColor: "var(--color-tag-green-bg)",
// //         color: "var(--color-tag-green-text)",
// //       };
// //     }

// //     if (status === "REVOKED") {
// //       return {
// //         backgroundColor: "var(--color-tag-red-bg)",
// //         color: "var(--color-tag-red-text)",
// //       };
// //     }

// //     return {
// //       backgroundColor: "var(--color-tag-neutral-bg)",
// //       color: "var(--color-tag-neutral-text)",
// //     };
// //   };

// //   return (
// //     <section
// //       className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-sm"
// //       style={{
// //         border: "1px solid var(--color-border)",
// //         backgroundColor: "var(--color-card-bg)",
// //       }}
// //     >
// //       {/* Header */}
// //       <div
// //         className="px-6 py-5"
// //         style={{
// //           borderBottom: "1px solid var(--color-border)",
// //         }}
// //       >
// //         <div className="flex items-start gap-4">
// //           <div
// //             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
// //             style={{
// //               backgroundColor: "var(--color-primary-active-bg)",
// //               color: "var(--color-primary)",
// //             }}
// //           >
// //             <svg
// //               width="20"
// //               height="20"
// //               viewBox="0 0 24 24"
// //               fill="none"
// //               stroke="currentColor"
// //               strokeWidth="1.8"
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //             >
// //               <path d="M4 4h16v16H4z" />
// //               <path d="m4 7 8 5 8-5" />
// //             </svg>
// //           </div>

// //           <div>
// //             <h2
// //               className="text-xl font-medium tracking-tight"
// //               style={{
// //                 fontFamily: "var(--font-display)",
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               Invitation status
// //             </h2>

// //             <p
// //               className="mt-1 text-sm leading-6"
// //               style={{
// //                 color: "var(--color-text-secondary)",
// //               }}
// //             >
// //               View workspace invitations and manage their current status.
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Content */}
// //       <div className="space-y-6 p-6">
// //         {/* Top Controls */}
// //         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
// //           <div>
// //             <p
// //               className="text-sm font-medium"
// //               style={{
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               Invitations
// //             </p>

// //             {!isLoading && !error && (
// //               <p
// //                 className="mt-1 text-xs"
// //                 style={{
// //                   color: "var(--color-text-muted)",
// //                 }}
// //               >
// //                 {total} invitation{total === 1 ? "" : "s"} in total
// //               </p>
// //             )}
// //           </div>

// //           <div className="w-full sm:w-32">
// //             <label
// //               htmlFor="invitation-limit"
// //               className="mb-2 block text-sm font-medium"
// //               style={{
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               Per page
// //             </label>

// //             <select
// //               id="invitation-limit"
// //               value={limit}
// //               onChange={handleLimitChange}
// //               className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
// //               style={{
// //                 border: "1px solid var(--color-border)",
// //                 backgroundColor: "var(--color-app-bg)",
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               <option value={5}>5</option>
// //               <option value={10}>10</option>
// //               <option value={20}>20</option>
// //             </select>
// //           </div>
// //         </div>

// //         {/* Loading */}
// //         {isLoading && (
// //           <div
// //             className="flex items-center justify-center rounded-xl py-10"
// //             style={{
// //               backgroundColor: "var(--color-app-bg)",
// //             }}
// //           >
// //             <div className="flex items-center gap-3">
// //               <span
// //                 className="h-5 w-5 animate-spin rounded-full border-2"
// //                 style={{
// //                   borderColor: "var(--color-border)",
// //                   borderTopColor: "var(--color-primary)",
// //                 }}
// //               />

// //               <p
// //                 className="text-sm"
// //                 style={{
// //                   color: "var(--color-text-secondary)",
// //                 }}
// //               >
// //                 Loading invitations...
// //               </p>
// //             </div>
// //           </div>
// //         )}

// //         {/* Error */}
// //         {!isLoading && error && (
// //           <div
// //             className="flex items-start gap-3 rounded-xl px-4 py-3"
// //             style={{
// //               border: "1px solid var(--color-tag-red-text)",
// //               backgroundColor: "var(--color-tag-red-bg)",
// //             }}
// //           >
// //             <span
// //               className="mt-0.5"
// //               style={{
// //                 color: "var(--color-priority-high)",
// //               }}
// //             >
// //               !
// //             </span>

// //             <p
// //               className="text-sm"
// //               style={{
// //                 color: "var(--color-tag-red-text)",
// //               }}
// //             >
// //               {error}
// //             </p>
// //           </div>
// //         )}

// //         {/* Empty */}
// //         {!isLoading && !error && invitations.length === 0 && (
// //           <div
// //             className="rounded-xl px-4 py-10 text-center"
// //             style={{
// //               backgroundColor: "var(--color-app-bg)",
// //             }}
// //           >
// //             <div
// //               className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
// //               style={{
// //                 backgroundColor: "var(--color-tag-neutral-bg)",
// //                 color: "var(--color-text-muted)",
// //               }}
// //             >
// //               <svg
// //                 width="18"
// //                 height="18"
// //                 viewBox="0 0 24 24"
// //                 fill="none"
// //                 stroke="currentColor"
// //                 strokeWidth="1.8"
// //                 strokeLinecap="round"
// //                 strokeLinejoin="round"
// //               >
// //                 <path d="M4 4h16v16H4z" />
// //                 <path d="m4 7 8 5 8-5" />
// //               </svg>
// //             </div>

// //             <p
// //               className="mt-3 text-sm font-medium"
// //               style={{
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               No invitations found
// //             </p>

// //             <p
// //               className="mt-1 text-xs"
// //               style={{
// //                 color: "var(--color-text-muted)",
// //               }}
// //             >
// //               Invitations sent from this workspace will appear here.
// //             </p>
// //           </div>
// //         )}

// //         {/* Invitations */}
// //         {!isLoading && !error && invitations.length > 0 && (
// //           <div
// //             className="overflow-hidden rounded-xl"
// //             style={{
// //               border: "1px solid var(--color-border)",
// //             }}
// //           >
// //             <div
// //               className="divide-y"
// //               style={{
// //                 borderColor: "var(--color-border)",
// //               }}
// //             >
// //               {invitations.map((invitation) => (
// //                 <div
// //                   key={invitation.id}
// //                   className="flex flex-col gap-4 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
// //                   style={{
// //                     borderColor: "var(--color-border)",
// //                   }}
// //                 >
// //                   {/* Invitation Details */}
// //                   <div className="flex min-w-0 items-center gap-3">
// //                     <div
// //                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
// //                       style={{
// //                         backgroundColor: "var(--color-primary-active-bg)",
// //                         color: "var(--color-primary)",
// //                       }}
// //                     >
// //                       <svg
// //                         width="17"
// //                         height="17"
// //                         viewBox="0 0 24 24"
// //                         fill="none"
// //                         stroke="currentColor"
// //                         strokeWidth="1.8"
// //                         strokeLinecap="round"
// //                         strokeLinejoin="round"
// //                       >
// //                         <path d="M4 4h16v16H4z" />
// //                         <path d="m4 7 8 5 8-5" />
// //                       </svg>
// //                     </div>

// //                     <div className="min-w-0">
// //                       <p
// //                         className="truncate text-sm font-medium"
// //                         style={{
// //                           color: "var(--color-text-primary)",
// //                         }}
// //                       >
// //                         {invitation.email}
// //                       </p>

// //                       <p
// //                         className="mt-0.5 text-xs capitalize"
// //                         style={{
// //                           color: "var(--color-text-muted)",
// //                         }}
// //                       >
// //                         Role: {invitation.role}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   {/* Status + Action */}
// //                   <div className="flex items-center gap-3 sm:shrink-0">
// //                     <span
// //                       className="rounded-full px-3 py-1.5 text-xs font-medium"
// //                       style={getStatusStyle(invitation.status)}
// //                     >
// //                       {invitation.status}
// //                     </span>

// //                     {invitation.status === "PENDING" && (
// //                       <button
// //                         type="button"
// //                         onClick={() =>
// //                           handleRevoke(invitation.email, invitation.id)
// //                         }
// //                         disabled={revokingId === invitation.id}
// //                         className="rounded-xl px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
// //                         style={{
// //                           border: "1px solid var(--color-tag-red-text)",
// //                           backgroundColor: "var(--color-card-bg)",
// //                           color: "var(--color-tag-red-text)",
// //                         }}
// //                       >
// //                         {revokingId === invitation.id
// //                           ? "Revoking..."
// //                           : "Revoke"}
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         )}

// //         {/* Pagination */}
// //         {!isLoading && !error && invitations.length > 0 && totalPages > 1 && (
// //           <div
// //             className="flex items-center justify-between gap-4 pt-5"
// //             style={{
// //               borderTop: "1px solid var(--color-border)",
// //             }}
// //           >
// //             <button
// //               type="button"
// //               onClick={handlePrevious}
// //               disabled={page === 1}
// //               className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
// //               style={{
// //                 border: "1px solid var(--color-border)",
// //                 backgroundColor: "var(--color-card-bg)",
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               Previous
// //             </button>

// //             <div className="text-center">
// //               <p
// //                 className="text-sm font-medium"
// //                 style={{
// //                   color: "var(--color-text-primary)",
// //                 }}
// //               >
// //                 Page {page} of {totalPages}
// //               </p>

// //               <p
// //                 className="mt-0.5 text-xs"
// //                 style={{
// //                   color: "var(--color-text-muted)",
// //                 }}
// //               >
// //                 {total} total invitation
// //                 {total === 1 ? "" : "s"}
// //               </p>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={handleNext}
// //               disabled={page === totalPages}
// //               className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
// //               style={{
// //                 border: "1px solid var(--color-border)",
// //                 backgroundColor: "var(--color-card-bg)",
// //                 color: "var(--color-text-primary)",
// //               }}
// //             >
// //               Next
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </section>
// //   );
// // }

// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Mail, ChevronLeft, ChevronRight } from "lucide-react";

// type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED";
// type StatusFilter = "ALL" | InvitationStatus;
// type Invitation = {
//   id: string;
//   email: string;
//   role: string;
//   status: InvitationStatus;
//   expiresAt: string | null;
//   createdAt: string;
// };
// type InvitationResponse = {
//   message?: string;
//   invitations: Invitation[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// type InvitationStatusCardProps = { workspaceId?: string };
// const filters: { value: StatusFilter; label: string }[] = [
//   { value: "ALL", label: "All invitations" },
//   { value: "PENDING", label: "Pending" },
//   { value: "ACCEPTED", label: "Accepted" },
//   { value: "REVOKED", label: "Revoked" },
// ];

// function displayDate(value: string | null) {
//   if (!value) return "—";
//   const date = new Date(value);
//   return Number.isNaN(date.getTime())
//     ? "—"
//     : date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });
// }

// function statusStyle(status: InvitationStatus): React.CSSProperties {
//   if (status === "ACCEPTED")
//     return {
//       backgroundColor: "var(--color-tag-green-bg)",
//       color: "var(--color-tag-green-text)",
//     };
//   if (status === "REVOKED")
//     return {
//       backgroundColor: "var(--color-tag-red-bg)",
//       color: "var(--color-tag-red-text)",
//     };
//   return {
//     backgroundColor: "var(--color-tag-neutral-bg)",
//     color: "var(--color-tag-neutral-text)",
//   };
// }

// export default function InvitationStatusCard({
//   workspaceId: workspaceIdProp,
// }: InvitationStatusCardProps) {
//   const params = useParams();
//   const workspaceId =
//     workspaceIdProp ?? (params.workspaceId as string | undefined);
//   const [invitations, setInvitations] = useState<Invitation[]>([]);
//   const [status, setStatus] = useState<StatusFilter>("ALL");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [revokingId, setRevokingId] = useState<string | null>(null);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const workspaceError = !workspaceId ? "Workspace ID is missing." : "";

//   useEffect(() => {
//     if (!workspaceId) return;
//     const controller = new AbortController();
//     const load = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const query = new URLSearchParams({
//           page: String(page),
//           limit: String(limit),
//         });
//         if (status !== "ALL") query.set("status", status);
//         const response = await fetch(
//           `/api/workspace/${workspaceId}/invitation?${query.toString()}`,
//           {
//             signal: controller.signal,
//             cache: "no-store",
//           },
//         );
//         const data: InvitationResponse = await response.json();
//         if (!response.ok)
//           throw new Error(data.message || "Failed to fetch invitations.");
//         if (controller.signal.aborted) return;
//         setInvitations(data.invitations ?? []);
//         setTotal(data.pagination?.total ?? 0);
//         setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
//       } catch (err) {
//         if (!controller.signal.aborted)
//           setError(
//             err instanceof Error ? err.message : "Failed to fetch invitations.",
//           );
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     };
//     void load();
//     return () => controller.abort();
//   }, [workspaceId, status, page, limit, refreshKey]);

//   const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

//   async function revoke(invitation: Invitation) {
//     if (!workspaceId || invitation.status !== "PENDING" || revokingId) return;
//     if (!window.confirm(`Revoke the invitation to ${invitation.email}?`))
//       return;
//     setRevokingId(invitation.id);
//     setError("");
//     try {
//       // Existing PATCH contract uses email; keep it unchanged.
//       const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: invitation.email }),
//       });
//       const data: { message?: string } = await response.json();
//       if (!response.ok)
//         throw new Error(data.message || "Failed to revoke invitation.");
//       // Re-fetch so status filters and pagination totals reflect the database.
//       if (status === "PENDING" && invitations.length === 1 && page > 1)
//         setPage((p) => p - 1);
//       else refresh();
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to revoke invitation.",
//       );
//     } finally {
//       setRevokingId(null);
//     }
//   }

//   const fieldClass =
//     "rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50";
//   const buttonClass =
//     "inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)] disabled:opacity-40 disabled:cursor-not-allowed";

//   return (
//     <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <Mail size={20} />
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
//               Workspace invitations
//             </h2>
//             <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
//               View invitations and filter by invitation status.
//             </p>
//           </div>
//         </div>
//         <div className="flex flex-wrap items-center gap-3">
//           <label
//             className="text-sm text-[var(--color-text-secondary)]"
//             htmlFor="invitation-status"
//           >
//             Status
//           </label>
//           <select
//             id="invitation-status"
//             className={fieldClass}
//             value={status}
//             onChange={(e) => {
//               setStatus(e.target.value as StatusFilter);
//               setPage(1);
//             }}
//           >
//             {filters.map((filter) => (
//               <option key={filter.value} value={filter.value}>
//                 {filter.label}
//               </option>
//             ))}
//           </select>
//           <label
//             className="text-sm text-[var(--color-text-secondary)]"
//             htmlFor="invitation-limit"
//           >
//             Per page
//           </label>
//           <select
//             id="invitation-limit"
//             className={fieldClass}
//             value={limit}
//             onChange={(e) => {
//               setLimit(Number(e.target.value));
//               setPage(1);
//             }}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//           </select>
//         </div>
//       </div>
//       <div className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
//         Showing {invitations.length} of {total} invitation
//         {total === 1 ? "" : "s"}
//       </div>
//       {error && (
//         <div
//           role="alert"
//           className="mx-5 mb-4 rounded-lg bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-tag-red-text)]"
//         >
//           {error}
//         </div>
//       )}
//       {loading ? (
//         <p className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
//           Loading invitations...
//         </p>
//       ) : !error && invitations.length === 0 ? (
//         <p className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
//           No {status === "ALL" ? "" : status.toLowerCase() + " "}invitations
//           found.
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[750px] border-collapse text-left">
//             <thead className="bg-[var(--color-app-bg)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
//               <tr className="border-y border-[var(--color-border)]">
//                 <th className="px-5 py-3 font-semibold">Invited member</th>
//                 <th className="px-5 py-3 font-semibold">Role</th>
//                 <th className="px-5 py-3 font-semibold">Status</th>
//                 <th className="px-5 py-3 font-semibold">Invited</th>
//                 <th className="px-5 py-3 font-semibold">Expires</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-[var(--color-border)]">
//               {invitations.map((invitation) => (
//                 <tr
//                   key={invitation.id}
//                   className="hover:bg-[var(--color-app-bg)]"
//                 >
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-3">
//                       <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-semibold text-[var(--color-primary)]">
//                         {invitation.email.charAt(0).toUpperCase() || "U"}
//                       </span>
//                       <span
//                         className="max-w-[260px] truncate text-sm font-medium text-[var(--color-text-primary)]"
//                         title={invitation.email}
//                       >
//                         {invitation.email}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-5 py-4 text-sm capitalize text-[var(--color-text-secondary)]">
//                     {invitation.role}
//                   </td>
//                   <td className="px-5 py-4">
//                     <span
//                       className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
//                       style={statusStyle(invitation.status)}
//                     >
//                       {invitation.status}
//                     </span>
//                   </td>
//                   <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
//                     {displayDate(invitation.createdAt)}
//                   </td>
//                   <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
//                     {displayDate(invitation.expiresAt)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//       {!loading && !error && totalPages > 1 && (
//         <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
//           <button
//             type="button"
//             className={buttonClass}
//             disabled={page <= 1}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//           >
//             <ChevronLeft size={16} /> Previous
//           </button>
//           <span className="text-xs text-[var(--color-text-secondary)]">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             type="button"
//             className={buttonClass}
//             disabled={page >= totalPages}
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//           >
//             Next <ChevronRight size={16} />
//           </button>
//         </div>
//       )}
//     </section>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mail, ChevronLeft, ChevronRight } from "lucide-react";

type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED";
type StatusFilter = "ALL" | InvitationStatus;
type Invitation = {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  expiresAt: string | null;
  createdAt: string;
};
type InvitationResponse = {
  message?: string;
  invitations: Invitation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type InvitationStatusCardProps = { workspaceId?: string };
const filters: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All invitations" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REVOKED", label: "Revoked" },
];

function displayDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function statusStyle(status: InvitationStatus): React.CSSProperties {
  if (status === "ACCEPTED")
    return {
      backgroundColor: "var(--color-tag-green-bg)",
      color: "var(--color-tag-green-text)",
    };
  if (status === "REVOKED")
    return {
      backgroundColor: "var(--color-tag-red-bg)",
      color: "var(--color-tag-red-text)",
    };
  return {
    backgroundColor: "var(--color-tag-neutral-bg)",
    color: "var(--color-tag-neutral-text)",
  };
}

export default function InvitationStatusCard({
  workspaceId: workspaceIdProp,
}: InvitationStatusCardProps) {
  const params = useParams();
  const workspaceId =
    workspaceIdProp ?? (params.workspaceId as string | undefined);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const workspaceError = !workspaceId ? "Workspace ID is missing." : "";
  const displayError = workspaceError || error;
  const isLoading = Boolean(workspaceId) && loading;

  useEffect(() => {
    if (!workspaceId) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (status !== "ALL") query.set("status", status);
        const response = await fetch(
          `/api/workspace/${workspaceId}/invitation?${query.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const data: InvitationResponse = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch invitations.");
        if (controller.signal.aborted) return;
        setError("");
        setInvitations(data.invitations ?? []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Failed to fetch invitations.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [workspaceId, status, page, limit, refreshKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError("");
    setRefreshKey((value) => value + 1);
  }, []);

  async function revoke(invitation: Invitation) {
    if (!workspaceId || invitation.status !== "PENDING" || revokingId) return;
    if (!window.confirm(`Revoke the invitation to ${invitation.email}?`))
      return;
    setRevokingId(invitation.id);
    setError("");
    try {
      // Existing PATCH contract uses email; keep it unchanged.
      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: invitation.email }),
      });
      const data: { message?: string } = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to revoke invitation.");
      // Re-fetch so status filters and pagination totals reflect the database.
      if (status === "PENDING" && invitations.length === 1 && page > 1) {
        setLoading(true);
        setPage((p) => p - 1);
      } else {
        refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke invitation.",
      );
    } finally {
      setRevokingId(null);
    }
  }

  const fieldClass =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-50";
  const buttonClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)] disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Workspace invitations
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              View invitations and filter by invitation status.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="text-sm text-[var(--color-text-secondary)]"
            htmlFor="invitation-status"
          >
            Status
          </label>
          <select
            id="invitation-status"
            className={fieldClass}
            value={status}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <label
            className="text-sm text-[var(--color-text-secondary)]"
            htmlFor="invitation-limit"
          >
            Per page
          </label>
          <select
            id="invitation-limit"
            className={fieldClass}
            value={limit}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
      <div className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
        Showing {invitations.length} of {total} invitation
        {total === 1 ? "" : "s"}
      </div>
      {displayError && (
        <div
          role="alert"
          className="mx-5 mb-4 rounded-lg bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-tag-red-text)]"
        >
          {displayError}
        </div>
      )}
      {isLoading ? (
        <p className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Loading invitations...
        </p>
      ) : !displayError && invitations.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          No {status === "ALL" ? "" : status.toLowerCase() + " "}invitations
          found.
        </p>
      ) : !displayError ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left">
            <thead className="bg-[var(--color-app-bg)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr className="border-y border-[var(--color-border)]">
                <th className="px-5 py-3 font-semibold">Invited member</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Invited</th>
                <th className="px-5 py-3 font-semibold">Expires</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {invitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="hover:bg-[var(--color-app-bg)]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-semibold text-[var(--color-primary)]">
                        {invitation.email.charAt(0).toUpperCase() || "U"}
                      </span>
                      <span
                        className="max-w-[260px] truncate text-sm font-medium text-[var(--color-text-primary)]"
                        title={invitation.email}
                      >
                        {invitation.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm capitalize text-[var(--color-text-secondary)]">
                    {invitation.role}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                      style={statusStyle(invitation.status)}
                    >
                      {invitation.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
                    {displayDate(invitation.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
                    {displayDate(invitation.expiresAt)}
                  </td>
                  <td className="px-5 py-4">
                    {invitation.status === "PENDING" && (
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={revokingId !== null}
                        onClick={() => void revoke(invitation)}
                      >
                        {revokingId === invitation.id
                          ? "Revoking..."
                          : "Revoke"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {!isLoading && !displayError && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
          <button
            type="button"
            className={buttonClass}
            disabled={page <= 1}
            onClick={() => {
              setLoading(true);
              setError("");
              setPage((p) => Math.max(1, p - 1));
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className={buttonClass}
            disabled={page >= totalPages}
            onClick={() => {
              setLoading(true);
              setError("");
              setPage((p) => Math.min(totalPages, p + 1));
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
