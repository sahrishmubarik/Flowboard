// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole = "owner" | "admin" | "manager" | "member";

// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   createdAt: string;
// };

// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];

// export default function WorkspaceMemberCard() {
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const fetchMembers = async () => {
//     if (!workspaceId) return;

//     try {
//       setLoading(true);
//       setError("");

//       const searchParams = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//       });

//       if (selectedRole) {
//         searchParams.set("role", selectedRole);
//       }

//       const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

//       const response = await fetch(url);

//       const data: MembersResponse = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch members.");
//       }

//       setMembers(data.members);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error("FETCH_MEMBERS_ERROR:", error);

//       setError(
//         error instanceof Error ? error.message : "Failed to fetch members.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMembers();
//   }, [workspaceId, page, limit, selectedRole]);

//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedRole(event.target.value);
//     setPage(1);
//   };

//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLimit(Number(event.target.value));
//     setPage(1);
//   };

//   const handlePrevious = () => {
//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };

//   const handleNext = () => {
//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };

//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
//       {/* Header */}{" "}
//       <div className="border-b border-[var(--mist)] px-6 py-5">
//         {" "}
//         <div className="flex items-start gap-4">
//           {" "}
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
//             {" "}
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               {" "}
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />{" "}
//               <circle cx="9" cy="7" r="4" />{" "}
//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />{" "}
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />{" "}
//             </svg>{" "}
//           </div>
//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--ink)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Content */}
//       <div className="space-y-6 p-6">
//         {/* Filters */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* Role */}
//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--ink)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Limit */}
//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--ink)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* Member Count */}
//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--paper)] px-4 py-3">
//             <p className="text-xs text-[var(--ink-soft)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--ink)]">
//                 {members.length}
//               </span>{" "}
//               of <span className="font-medium text-[var(--ink)]">{total}</span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--paper)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mist)] border-t-[var(--indigo)]" />

//               <p className="text-sm text-[var(--ink-soft)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
//             <span className="mt-0.5 text-[var(--coral)]">!</span>

//             <p className="text-sm text-[var(--ink)]">{error}</p>
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--paper)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mist)] text-[var(--ink-soft)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--ink)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--ink-soft)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* Members */}
//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--mist)]">
//             <div className="divide-y divide-[var(--mist)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--paper)]"
//                 >
//                   {/* User */}
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--indigo)]/[0.08] text-sm font-medium text-[var(--indigo)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--ink)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--ink-soft)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Role */}
//                   <span className="shrink-0 rounded-full bg-[var(--paper)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--ink-soft)]">
//                     {member.role}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--mist)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--ink)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
//                 {total} total member{total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// type MemberRole = "owner" | "admin" | "manager" | "member";
// type MemberStatus = "ACTIVE" | "REMOVED";
// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   status: MemberStatus;
//   createdAt: string;
// };
// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };
// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];
// export default function WorkspaceMemberCard() {
//   const params = useParams();
//   const workspaceId = params.workspaceId as string;
//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [deactivatingMemberId, setDeactivatingMemberId] = useState<
//     string | null
//   >(null);
//   const fetchMembers = async () => {
//     if (!workspaceId) return;
//     try {
//       setLoading(true);
//       setError("");
//       const searchParams = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//       });
//       if (selectedRole) {
//         searchParams.set("role", selectedRole);
//       }
//       const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;
//       const response = await fetch(url);
//       const data: MembersResponse = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch members.");
//       }
//       setMembers(data.members);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error("FETCH_MEMBERS_ERROR:", error);
//       setError(
//         error instanceof Error ? error.message : "Failed to fetch members.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchMembers();
//   }, [workspaceId, page, limit, selectedRole]);
//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedRole(event.target.value);
//     setPage(1);
//   };
//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLimit(Number(event.target.value));
//     setPage(1);
//   };
//   const handlePrevious = () => {
//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };
//   const handleNext = () => {
//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };
//   const handleDeactivateMember = async (userId: string) => {
//     try {
//       setDeactivatingMemberId(userId);
//       setError("");
//       const response = await fetch(`/api/workspace/${workspaceId}/members`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to deactivate member.");
//       }
//       await fetchMembers();
//     } catch (error) {
//       console.error("DEACTIVATE_MEMBER_ERROR:", error);
//       setError(
//         error instanceof Error ? error.message : "Failed to deactivate member.",
//       );
//     } finally {
//       setDeactivatingMemberId(null);
//     }
//   };
//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       {/* Header */}
//       <div className="border-b border-[var(--color-border)] px-6 py-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="space-y-6 p-6">
//         {/* Filters */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* Role */}
//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)]"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Limit */}
//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)]"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* Member Count */}
//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
//             <p className="text-xs text-[var(--color-text-muted)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {members.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {total}
//               </span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

//               <p className="text-sm text-[var(--color-text-secondary)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-tag-red-bg)] px-4 py-3">
//             <span className="mt-0.5 text-[var(--color-priority-high)]">!</span>

//             <p className="text-sm text-[var(--color-text-primary)]">{error}</p>
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tag-neutral-bg)] text-[var(--color-text-muted)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--color-text-muted)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* Members */}
//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
//             <div className="divide-y divide-[var(--color-border)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-app-bg)]"
//                 >
//                   {/* User */}
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-medium text-[var(--color-primary)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--color-text-muted)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Role + Action */}
//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
//                       {member.role}
//                     </span>

//                     {/* Owner cannot be deactivated */}
//                     {member.role !== "owner" && (
//                       <button
//                         type="button"
//                         onClick={() => handleDeactivateMember(member.userId)}
//                         disabled={deactivatingMemberId === member.userId}
//                         className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {deactivatingMemberId === member.userId
//                           ? "Deactivating..."
//                           : "Deactivate"}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
//                 {total} total member {total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole = "owner" | "admin" | "manager" | "member";

// type MemberStatus = "ACTIVE" | "REMOVED";

// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   status: MemberStatus;
//   createdAt: string;
// };

// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];

// export default function WorkspaceMemberCard() {
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   const [members, setMembers] = useState<Member[]>([]);

//   const [selectedRole, setSelectedRole] = useState("");

//   const [page, setPage] = useState(1);

//   const [limit, setLimit] = useState(5);

//   const [totalPages, setTotalPages] = useState(1);

//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState("");

//   const [deactivatingMemberId, setDeactivatingMemberId] = useState<
//     string | null
//   >(null);

//   // =========================================================
//   // FETCH MEMBERS
//   // =========================================================

//   useEffect(() => {
//     if (!workspaceId) {
//       return;
//     }

//     let cancelled = false;

//     async function loadMembers() {
//       try {
//         const searchParams = new URLSearchParams({
//           page: String(page),
//           limit: String(limit),
//         });

//         if (selectedRole) {
//           searchParams.set("role", selectedRole);
//         }

//         const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

//         const response = await fetch(url, {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: MembersResponse = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to fetch members.");
//         }

//         // Ignore response if component was unmounted
//         // or dependencies changed before request completed.
//         if (cancelled) {
//           return;
//         }

//         setMembers(data.members);
//         setTotalPages(data.pagination.totalPages);
//         setTotal(data.pagination.total);
//         setError("");
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error("FETCH_MEMBERS_ERROR:", error);

//         setError(
//           error instanceof Error ? error.message : "Failed to fetch members.",
//         );
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadMembers();

//     return () => {
//       cancelled = true;
//     };
//   }, [workspaceId, page, limit, selectedRole]);

//   // =========================================================
//   // ROLE FILTER
//   // =========================================================

//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLoading(true);
//     setError("");

//     setSelectedRole(event.target.value);

//     // When changing filter, always go back to page 1.
//     setPage(1);
//   };

//   // =========================================================
//   // PAGE LIMIT
//   // =========================================================

//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLoading(true);
//     setError("");

//     setLimit(Number(event.target.value));

//     // Changing page size should start from first page.
//     setPage(1);
//   };

//   // =========================================================
//   // PAGINATION
//   // =========================================================

//   const handlePrevious = () => {
//     if (page <= 1) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };

//   const handleNext = () => {
//     if (page >= totalPages) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };

//   // =========================================================
//   // DEACTIVATE MEMBER
//   // =========================================================

//   const handleDeactivateMember = async (userId: string) => {
//     try {
//       setDeactivatingMemberId(userId);
//       setError("");

//       const response = await fetch(`/api/workspace/${workspaceId}/members`, {
//         method: "PATCH",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           userId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to deactivate member.");
//       }

//       /*
//        * If this is the last member on the current page and
//        * we're not on page 1, move to the previous page.
//        *
//        * Changing page will automatically trigger useEffect
//        * and fetch fresh members.
//        */
//       if (members.length === 1 && page > 1) {
//         setLoading(true);
//         setPage((currentPage) => currentPage - 1);

//         return;
//       }

//       /*
//        * Otherwise update the UI locally.
//        * This avoids making another API request.
//        */
//       setMembers((currentMembers) =>
//         currentMembers.filter((member) => member.userId !== userId),
//       );

//       setTotal((currentTotal) => {
//         const nextTotal = Math.max(currentTotal - 1, 0);

//         setTotalPages(Math.max(1, Math.ceil(nextTotal / limit)));

//         return nextTotal;
//       });
//     } catch (error) {
//       console.error("DEACTIVATE_MEMBER_ERROR:", error);

//       setError(
//         error instanceof Error ? error.message : "Failed to deactivate member.",
//       );
//     } finally {
//       setDeactivatingMemberId(null);
//     }
//   };

//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       {/* =====================================================
//           HEADER
//       ====================================================== */}

//       <div className="border-b border-[var(--color-border)] px-6 py-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

//               <circle cx="9" cy="7" r="4" />

//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
//               style={{
//                 fontFamily: "var(--font-display)",
//               }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           CONTENT
//       ====================================================== */}

//       <div className="space-y-6 p-6">
//         {/* ===================================================
//             FILTERS
//         ==================================================== */}

//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* ROLE FILTER */}

//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               disabled={loading}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* PAGE LIMIT */}

//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               disabled={loading}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               <option value={5}>5</option>

//               <option value={10}>10</option>

//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* ===================================================
//             MEMBER COUNT
//         ==================================================== */}

//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
//             <p className="text-xs text-[var(--color-text-muted)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {members.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {total}
//               </span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* ===================================================
//             LOADING
//         ==================================================== */}

//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

//               <p className="text-sm text-[var(--color-text-secondary)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             ERROR
//         ==================================================== */}

//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-tag-red-bg)] px-4 py-3">
//             <span className="mt-0.5 text-[var(--color-priority-high)]">!</span>

//             <p className="text-sm text-[var(--color-text-primary)]">{error}</p>
//           </div>
//         )}

//         {/* ===================================================
//             EMPTY STATE
//         ==================================================== */}

//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tag-neutral-bg)] text-[var(--color-text-muted)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--color-text-muted)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* ===================================================
//             MEMBERS
//         ==================================================== */}

//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
//             <div className="divide-y divide-[var(--color-border)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-app-bg)]"
//                 >
//                   {/* USER */}

//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-medium text-[var(--color-primary)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--color-text-muted)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* ROLE + ACTION */}

//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
//                       {member.role}
//                     </span>

//                     {/* OWNER CANNOT BE DEACTIVATED */}

//                     {member.role !== "owner" && (
//                       <button
//                         type="button"
//                         onClick={() => handleDeactivateMember(member.userId)}
//                         disabled={deactivatingMemberId === member.userId}
//                         className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {deactivatingMemberId === member.userId
//                           ? "Deactivating..."
//                           : "Deactivate"}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             PAGINATION
//         ==================================================== */}

//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
//                 {total} total member
//                 {total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole = "owner" | "admin" | "manager" | "member";
// type BoardStatus = "ACTIVE" | "DEACTIVATED";

// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   status: "ACTIVE" | "REMOVED";
//   createdAt: string;
// };

// type Board = {
//   id: string;
//   boardName: string;
//   organizationId: string;
//   role?: MemberRole;
// };

// type BoardMember = {
//   userId: string;
//   role: MemberRole;
//   status?: BoardStatus;
// };

// type MembersResponse = {
//   message?: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// type BoardResponse = {
//   message?: string;
//   boards?: Board[];
//   data?: {
//     boards?: Board[];
//   };
// };

// type BoardMembersResponse = {
//   message?: string;
//   members?: BoardMember[];
//   data?: {
//     members?: BoardMember[];
//     total?: number;
//   };
// };

// type MenuAction = "assign" | "remove-board";

// type ConfirmationAction =
//   | { type: "workspace"; member: Member }
//   | { type: "board"; member: Member; boardId: string }
//   | null;

// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];

// const boardRoles: MemberRole[] = ["admin", "manager", "member"];

// export default function WorkspaceMemberCard() {
//   const params = useParams();
//   const workspaceId = params.workspaceId as string;

//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);

//   const [activeMember, setActiveMember] = useState<Member | null>(null);
//   const [menuAction, setMenuAction] = useState<MenuAction>("assign");

//   const [boards, setBoards] = useState<Board[]>([]);
//   const [selectedBoardId, setSelectedBoardId] = useState("");
//   const [selectedBoardRole, setSelectedBoardRole] =
//     useState<MemberRole>("member");

//   const [boardMemberships, setBoardMemberships] = useState<
//     Record<string, BoardMember | null>
//   >({});

//   const [loadingBoards, setLoadingBoards] = useState(false);
//   const [savingBoard, setSavingBoard] = useState(false);
//   const [boardError, setBoardError] = useState("");
//   const [boardMessage, setBoardMessage] = useState("");

//   const [deactivatingMemberId, setDeactivatingMemberId] = useState<
//     string | null
//   >(null);

//   // Custom confirmation modal state.
//   const [confirmation, setConfirmation] = useState<ConfirmationAction>(null);

//   const [confirming, setConfirming] = useState(false);

//   // =========================================================
//   // FETCH WORKSPACE MEMBERS
//   // =========================================================

//   useEffect(() => {
//     if (!workspaceId) return;

//     let cancelled = false;

//     async function loadMembers() {
//       setLoading(true);
//       setError("");

//       try {
//         const searchParams = new URLSearchParams({
//           page: String(page),
//           limit: String(limit),
//         });

//         if (selectedRole) {
//           searchParams.set("role", selectedRole);
//         }

//         const response = await fetch(
//           `/api/workspace/${workspaceId}/members?${searchParams.toString()}`,
//           { cache: "no-store" },
//         );

//         const data: MembersResponse = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to fetch members.");
//         }

//         if (cancelled) return;

//         setMembers(data.members ?? []);
//         setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
//         setTotal(data.pagination?.total ?? 0);
//       } catch (err) {
//         if (cancelled) return;

//         setError(
//           err instanceof Error ? err.message : "Failed to fetch members.",
//         );
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMembers();

//     return () => {
//       cancelled = true;
//     };
//   }, [workspaceId, page, limit, selectedRole]);

//   // =========================================================
//   // CLOSE MENUS WHEN CLICKING OUTSIDE
//   // =========================================================

//   useEffect(() => {
//     function handleOutsideClick(event: PointerEvent) {
//       const target = event.target;

//       if (target instanceof Element && !target.closest("[data-member-menu]")) {
//         setOpenMenuId(null);
//       }
//     }

//     function handleEscape(event: KeyboardEvent) {
//       if (event.key !== "Escape") return;

//       setOpenMenuId(null);

//       if (!confirming && !savingBoard && !deactivatingMemberId) {
//         setConfirmation(null);
//       }
//     }

//     document.addEventListener("pointerdown", handleOutsideClick);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("pointerdown", handleOutsideClick);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [confirming, savingBoard, deactivatingMemberId]);

//   // =========================================================
//   // OPEN ASSIGN / REMOVE BOARD DIALOG
//   // =========================================================

//   async function openBoardDialog(member: Member, action: MenuAction) {
//     setOpenMenuId(null);
//     setActiveMember(member);
//     setMenuAction(action);
//     setSelectedBoardId("");
//     setSelectedBoardRole("member");
//     setBoardError("");
//     setBoardMessage("");
//     setBoards([]);
//     setBoardMemberships({});
//     setLoadingBoards(true);

//     try {
//       const response = await fetch(`/api/workspace/${workspaceId}/board`, {
//         cache: "no-store",
//       });

//       const data: BoardResponse = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch workspace boards.");
//       }

//       const allBoards = data.boards ?? data.data?.boards ?? [];

//       // Only show boards belonging to this workspace.
//       const workspaceBoards = allBoards.filter(
//         (board) => board.organizationId === workspaceId,
//       );

//       setBoards(workspaceBoards);

//       // Use the existing boardMembers route.
//       const membershipEntries = await Promise.all(
//         workspaceBoards.map(async (board) => {
//           const memberResponse = await fetch(
//             `/api/workspace/${workspaceId}/board/${board.id}/boardMembers?page=1&limit=100`,
//             { cache: "no-store" },
//           );

//           if (!memberResponse.ok) {
//             throw new Error(
//               `Could not check membership for ${board.boardName}.`,
//             );
//           }

//           const memberData: BoardMembersResponse = await memberResponse.json();

//           const boardMembers =
//             memberData.data?.members ?? memberData.members ?? [];

//           const existing = boardMembers.find(
//             (boardMember) =>
//               boardMember.userId === member.userId &&
//               boardMember.status !== "DEACTIVATED",
//           );

//           return [board.id, existing ?? null] as const;
//         }),
//       );

//       setBoardMemberships(Object.fromEntries(membershipEntries));
//     } catch (err) {
//       setBoardError(
//         err instanceof Error ? err.message : "Failed to load boards.",
//       );
//     } finally {
//       setLoadingBoards(false);
//     }
//   }

//   // =========================================================
//   // ASSIGN MEMBER TO BOARD
//   // =========================================================

//   async function handleAssignBoard() {
//     if (!activeMember || !selectedBoardId) {
//       setBoardError("Please select a board.");
//       return;
//     }

//     if (boardMemberships[selectedBoardId]) {
//       setBoardError("This member is already active on that board.");
//       return;
//     }

//     setSavingBoard(true);
//     setBoardError("");
//     setBoardMessage("");

//     try {
//       const response = await fetch(
//         `/api/workspace/${workspaceId}/board/${selectedBoardId}/boardMembers`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: activeMember.userId,
//             email: activeMember.email,
//             role: selectedBoardRole,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to assign member to board.");
//       }

//       setBoardMemberships((current) => ({
//         ...current,
//         [selectedBoardId]: {
//           userId: activeMember.userId,
//           role: selectedBoardRole,
//           status: "ACTIVE",
//         },
//       }));

//       setBoardMessage(data.message || "Member assigned to board successfully.");
//     } catch (err) {
//       setBoardError(
//         err instanceof Error ? err.message : "Failed to assign member.",
//       );
//     } finally {
//       setSavingBoard(false);
//     }
//   }

//   // =========================================================
//   // REQUEST BOARD REMOVAL
//   // Opens the custom confirmation modal.
//   // =========================================================

//   function requestBoardRemoval() {
//     if (!activeMember || !selectedBoardId) {
//       setBoardError("Please select a board.");
//       return;
//     }

//     if (!boardMemberships[selectedBoardId]) {
//       setBoardError("This member is not active on that board.");
//       return;
//     }

//     setConfirmation({
//       type: "board",
//       member: activeMember,
//       boardId: selectedBoardId,
//     });
//   }

//   // =========================================================
//   // REQUEST WORKSPACE REMOVAL
//   // Opens the custom confirmation modal.
//   // =========================================================

//   function requestWorkspaceRemoval(member: Member) {
//     if (member.role === "owner") return;

//     setOpenMenuId(null);
//     setConfirmation({
//       type: "workspace",
//       member,
//     });
//   }

//   // =========================================================
//   // CONFIRM REMOVAL
//   // This function is called only after confirmation.
//   // =========================================================

//   async function handleConfirmRemoval() {
//     if (!confirmation || confirming) return;

//     const action = confirmation;

//     setConfirming(true);
//     setError("");
//     setBoardError("");
//     setBoardMessage("");

//     if (action.type === "workspace") {
//       setDeactivatingMemberId(action.member.userId);
//     } else {
//       setSavingBoard(true);
//     }

//     try {
//       if (action.type === "workspace") {
//         const response = await fetch(`/api/workspace/${workspaceId}/members`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId: action.member.userId,
//           }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to remove workspace member.");
//         }

//         // Remove the member from the visible list after API success.
//         if (members.length === 1 && page > 1) {
//           setTotal(Math.max(0, total - 1));
//           setPage((current) => current - 1);
//         } else {
//           setMembers((current) =>
//             current.filter((member) => member.userId !== action.member.userId),
//           );

//           const nextTotal = Math.max(0, total - 1);
//           setTotal(nextTotal);
//           setTotalPages(Math.max(1, Math.ceil(nextTotal / limit)));
//         }

//         // Close the confirmation modal only after success.
//         setConfirmation(null);
//       } else {
//         const response = await fetch(
//           `/api/workspace/${workspaceId}/board/${action.boardId}/boardMembers`,
//           {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               userId: action.member.userId,
//             }),
//           },
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to remove board member.");
//         }

//         setBoardMemberships((current) => ({
//           ...current,
//           [action.boardId]: null,
//         }));

//         setBoardMessage(data.message || "Member removed from board.");
//         setConfirmation(null);
//       }
//     } catch (err) {
//       const message =
//         err instanceof Error ? err.message : "Failed to remove member.";

//       if (action.type === "workspace") {
//         setError(message);
//       } else {
//         setBoardError(message);
//       }

//       // Keep the modal open on failure so the user can retry or cancel.
//     } finally {
//       setConfirming(false);
//       setSavingBoard(false);
//       setDeactivatingMemberId(null);
//     }
//   }

//   // =========================================================
//   // CLOSE BOARD DIALOG
//   // =========================================================

//   function closeBoardDialog() {
//     if (savingBoard || confirming) return;

//     setActiveMember(null);
//     setSelectedBoardId("");
//     setBoardError("");
//     setBoardMessage("");
//     setBoardMemberships({});
//   }

//   // =========================================================
//   // STYLES
//   // =========================================================

//   const fieldClass =
//     "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60";

//   const secondaryButtonClass =
//     "rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-50";

//   const primaryButtonClass =
//     "rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

//   const dangerButtonClass =
//     "rounded-xl bg-[var(--color-priority-high)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

//   const confirmingMember = confirmation?.member;

//   return (
//     <section className="relative w-full max-w-3xl overflow-visible rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       {/* HEADER */}
//       <div className="border-b border-[var(--color-border)] px-6 py-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               aria-hidden="true"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Workspace members
//             </h2>
//             <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
//               Manage organization members and their board access.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="space-y-6 p-6">
//         {/* FILTERS */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Filter by role
//             </label>
//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={(event) => {
//                 setSelectedRole(event.target.value);
//                 setPage(1);
//                 setOpenMenuId(null);
//               }}
//               disabled={loading}
//               className={fieldClass}
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Per page
//             </label>
//             <select
//               id="member-limit"
//               value={limit}
//               onChange={(event) => {
//                 setLimit(Number(event.target.value));
//                 setPage(1);
//                 setOpenMenuId(null);
//               }}
//               disabled={loading}
//               className={fieldClass}
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* MEMBER COUNT */}
//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
//             <p className="text-xs text-[var(--color-text-muted)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {members.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {total}
//               </span>{" "}
//               members
//             </p>
//           </div>
//         )}

//         {/* LOADING */}
//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
//               <p className="text-sm text-[var(--color-text-secondary)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* WORKSPACE ERROR */}
//         {!loading && error && (
//           <div
//             role="alert"
//             className="rounded-xl border border-[var(--color-border)] bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
//           >
//             {error}
//           </div>
//         )}

//         {/* EMPTY STATE */}
//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
//             <p className="text-sm font-medium text-[var(--color-text-primary)]">
//               No members found
//             </p>
//             <p className="mt-1 text-xs text-[var(--color-text-muted)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* MEMBER CARDS */}
//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-visible rounded-xl border border-[var(--color-border)]">
//             <div className="divide-y divide-[var(--color-border)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-[var(--color-app-bg)]"
//                 >
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-medium text-[var(--color-primary)]">
//                       {member.name?.charAt(0).toUpperCase() || "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
//                         {member.name}
//                       </p>
//                       <p className="truncate text-xs text-[var(--color-text-muted)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
//                       {member.role}
//                     </span>

//                     {member.role !== "owner" && (
//                       <div className="relative" data-member-menu>
//                         <button
//                           type="button"
//                           aria-label={`Actions for ${member.name}`}
//                           aria-expanded={openMenuId === member.userId}
//                           onClick={() =>
//                             setOpenMenuId((current) =>
//                               current === member.userId ? null : member.userId,
//                             )
//                           }
//                           className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] text-xl text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
//                         >
//                           <span aria-hidden="true">⋮</span>
//                         </button>

//                         {openMenuId === member.userId && (
//                           <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-1 shadow-lg">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 void openBoardDialog(member, "assign")
//                               }
//                               className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
//                             >
//                               Assign to board
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 void openBoardDialog(member, "remove-board")
//                               }
//                               className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
//                             >
//                               Remove from board
//                             </button>

//                             <button
//                               type="button"
//                               disabled={
//                                 deactivatingMemberId === member.userId ||
//                                 confirming
//                               }
//                               onClick={() => requestWorkspaceRemoval(member)}
//                               className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:opacity-50"
//                             >
//                               Remove from workspace
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* PAGINATION */}
//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
//             <button
//               type="button"
//               onClick={() => {
//                 setOpenMenuId(null);
//                 setPage((current) => Math.max(current - 1, 1));
//               }}
//               disabled={page === 1}
//               className={secondaryButtonClass}
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                 Page {page} of {totalPages}
//               </p>
//               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
//                 {total} total members
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={() => {
//                 setOpenMenuId(null);
//                 setPage((current) => Math.min(current + 1, totalPages));
//               }}
//               disabled={page === totalPages}
//               className={secondaryButtonClass}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ASSIGN / REMOVE BOARD DIALOG */}
//       {activeMember && (
//         <div
//           className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget) {
//               closeBoardDialog();
//             }
//           }}
//         >
//           <section
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="board-dialog-title"
//             className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-2xl"
//           >
//             <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
//               <div>
//                 <h3
//                   id="board-dialog-title"
//                   className="text-lg font-medium text-[var(--color-text-primary)]"
//                 >
//                   {menuAction === "assign"
//                     ? "Assign member to a board"
//                     : "Remove member from a board"}
//                 </h3>
//                 <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//                   {activeMember.name} · {activeMember.email}
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeBoardDialog}
//                 disabled={savingBoard || confirming}
//                 aria-label="Close dialog"
//                 className="rounded-lg px-2 py-1 text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-app-bg)] disabled:opacity-50"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-5 p-6">
//               {loadingBoards ? (
//                 <div className="flex items-center justify-center gap-3 py-8">
//                   <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
//                   <p className="text-sm text-[var(--color-text-secondary)]">
//                     Loading boards and membership...
//                   </p>
//                 </div>
//               ) : boardError && boards.length === 0 ? (
//                 <p
//                   role="alert"
//                   className="rounded-xl bg-[var(--color-tag-red-bg)] p-3 text-sm text-[var(--color-text-primary)]"
//                 >
//                   {boardError}
//                 </p>
//               ) : boards.length === 0 ? (
//                 <p className="rounded-xl bg-[var(--color-app-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
//                   No boards were returned for this workspace. Check the
//                   workspace boards endpoint and its access permissions.
//                 </p>
//               ) : (
//                 <>
//                   <div>
//                     <label
//                       htmlFor="member-board"
//                       className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//                     >
//                       Select board
//                     </label>

//                     <select
//                       id="member-board"
//                       value={selectedBoardId}
//                       onChange={(event) => {
//                         setSelectedBoardId(event.target.value);
//                         setBoardError("");
//                         setBoardMessage("");
//                       }}
//                       className={fieldClass}
//                     >
//                       <option value="">Choose a board</option>
//                       {boards.map((board) => (
//                         <option key={board.id} value={board.id}>
//                           {board.boardName}
//                           {boardMemberships[board.id]
//                             ? " — Already assigned"
//                             : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {selectedBoardId && (
//                     <div className="rounded-xl bg-[var(--color-app-bg)] p-4">
//                       <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                         {
//                           boards.find((board) => board.id === selectedBoardId)
//                             ?.boardName
//                         }
//                       </p>
//                       <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
//                         {boardMemberships[selectedBoardId]
//                           ? `Currently assigned as ${boardMemberships[selectedBoardId]?.role}.`
//                           : "No active membership was found for this member."}
//                       </p>
//                     </div>
//                   )}

//                   {menuAction === "assign" && (
//                     <div>
//                       <label
//                         htmlFor="board-member-role"
//                         className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//                       >
//                         Board role
//                       </label>

//                       <select
//                         id="board-member-role"
//                         value={selectedBoardRole}
//                         onChange={(event) =>
//                           setSelectedBoardRole(event.target.value as MemberRole)
//                         }
//                         className={fieldClass}
//                       >
//                         {boardRoles.map((role) => (
//                           <option key={role} value={role}>
//                             {role.charAt(0).toUpperCase() + role.slice(1)}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}
//                 </>
//               )}

//               {boardError && boards.length > 0 && (
//                 <p
//                   role="alert"
//                   className="rounded-xl bg-[var(--color-tag-red-bg)] p-3 text-sm text-[var(--color-text-primary)]"
//                 >
//                   {boardError}
//                 </p>
//               )}

//               {boardMessage && (
//                 <p
//                   role="status"
//                   className="rounded-xl bg-[var(--color-app-bg)] p-3 text-sm text-[var(--color-text-primary)]"
//                 >
//                   {boardMessage}
//                 </p>
//               )}

//               <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] pt-4">
//                 <button
//                   type="button"
//                   onClick={closeBoardDialog}
//                   disabled={savingBoard || confirming}
//                   className={secondaryButtonClass}
//                 >
//                   Close
//                 </button>

//                 {menuAction === "assign" ? (
//                   <button
//                     type="button"
//                     onClick={() => void handleAssignBoard()}
//                     disabled={
//                       savingBoard ||
//                       loadingBoards ||
//                       !selectedBoardId ||
//                       Boolean(boardMemberships[selectedBoardId])
//                     }
//                     className={primaryButtonClass}
//                   >
//                     {savingBoard ? "Assigning..." : "Assign member"}
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={requestBoardRemoval}
//                     disabled={
//                       savingBoard ||
//                       loadingBoards ||
//                       !selectedBoardId ||
//                       !boardMemberships[selectedBoardId]
//                     }
//                     className={dangerButtonClass}
//                   >
//                     Remove from board
//                   </button>
//                 )}
//               </div>
//             </div>
//           </section>
//         </div>
//       )}

//       {/* CUSTOM CONFIRMATION MODAL */}
//       {confirmation && confirmingMember && (
//         <div
//           className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget && !confirming) {
//               setConfirmation(null);
//             }
//           }}
//         >
//           <section
//             role="alertdialog"
//             aria-modal="true"
//             aria-labelledby="remove-confirmation-title"
//             aria-describedby="remove-confirmation-description"
//             className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-2xl"
//           >
//             <div className="flex items-start gap-4">
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-tag-red-bg)] text-[var(--color-priority-high)]">
//                 <svg
//                   width="22"
//                   height="22"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="1.8"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   aria-hidden="true"
//                 >
//                   <path d="M12 9v4" />
//                   <path d="M12 17h.01" />
//                   <path d="M10.3 3.86 1.82 18.5A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.5L13.7 3.86a2 2 0 0 0-3.4 0Z" />
//                 </svg>
//               </div>

//               <div className="min-w-0 flex-1">
//                 <h3
//                   id="remove-confirmation-title"
//                   className="text-lg font-semibold text-[var(--color-text-primary)]"
//                 >
//                   {confirmation.type === "workspace"
//                     ? "Remove workspace member?"
//                     : "Remove member from board?"}
//                 </h3>

//                 <p
//                   id="remove-confirmation-description"
//                   className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]"
//                 >
//                   {confirmation.type === "workspace" ? (
//                     <>
//                       Are you sure you want to remove{" "}
//                       <span className="font-semibold text-[var(--color-text-primary)]">
//                         {confirmingMember.name}
//                       </span>{" "}
//                       from this workspace? Their workspace membership will be
//                       deactivated.
//                     </>
//                   ) : (
//                     <>
//                       Are you sure you want to remove{" "}
//                       <span className="font-semibold text-[var(--color-text-primary)]">
//                         {confirmingMember.name}
//                       </span>{" "}
//                       from{" "}
//                       <span className="font-semibold text-[var(--color-text-primary)]">
//                         {boards.find(
//                           (board) => board.id === confirmation.boardId,
//                         )?.boardName ?? "this board"}
//                       </span>
//                       ? They will lose access through this board membership.
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 disabled={confirming}
//                 onClick={() => setConfirmation(null)}
//                 className={secondaryButtonClass}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={confirming}
//                 onClick={() => void handleConfirmRemoval()}
//                 className={dangerButtonClass}
//               >
//                 {confirming
//                   ? "Removing..."
//                   : confirmation.type === "workspace"
//                     ? "Remove member"
//                     : "Remove from board"}
//               </button>
//             </div>
//           </section>
//         </div>
//       )}
//     </section>
//   );
// }

"use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole = "owner" | "admin" | "manager" | "member";

// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   createdAt: string;
// };

// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];

// export default function WorkspaceMemberCard() {
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const fetchMembers = async () => {
//     if (!workspaceId) return;

//     try {
//       setLoading(true);
//       setError("");

//       const searchParams = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//       });

//       if (selectedRole) {
//         searchParams.set("role", selectedRole);
//       }

//       const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

//       const response = await fetch(url);

//       const data: MembersResponse = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch members.");
//       }

//       setMembers(data.members);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error("FETCH_MEMBERS_ERROR:", error);

//       setError(
//         error instanceof Error ? error.message : "Failed to fetch members.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMembers();
//   }, [workspaceId, page, limit, selectedRole]);

//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedRole(event.target.value);
//     setPage(1);
//   };

//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLimit(Number(event.target.value));
//     setPage(1);
//   };

//   const handlePrevious = () => {
//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };

//   const handleNext = () => {
//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };

//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
//       {/* Header */}{" "}
//       <div className="border-b border-[var(--mist)] px-6 py-5">
//         {" "}
//         <div className="flex items-start gap-4">
//           {" "}
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
//             {" "}
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               {" "}
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />{" "}
//               <circle cx="9" cy="7" r="4" />{" "}
//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />{" "}
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />{" "}
//             </svg>{" "}
//           </div>
//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--ink)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Content */}
//       <div className="space-y-6 p-6">
//         {/* Filters */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* Role */}
//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--ink)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Limit */}
//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--ink)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* Member Count */}
//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--paper)] px-4 py-3">
//             <p className="text-xs text-[var(--ink-soft)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--ink)]">
//                 {members.length}
//               </span>{" "}
//               of <span className="font-medium text-[var(--ink)]">{total}</span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--paper)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mist)] border-t-[var(--indigo)]" />

//               <p className="text-sm text-[var(--ink-soft)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
//             <span className="mt-0.5 text-[var(--coral)]">!</span>

//             <p className="text-sm text-[var(--ink)]">{error}</p>
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--paper)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mist)] text-[var(--ink-soft)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--ink)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--ink-soft)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* Members */}
//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--mist)]">
//             <div className="divide-y divide-[var(--mist)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--paper)]"
//                 >
//                   {/* User */}
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--indigo)]/[0.08] text-sm font-medium text-[var(--indigo)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--ink)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--ink-soft)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Role */}
//                   <span className="shrink-0 rounded-full bg-[var(--paper)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--ink-soft)]">
//                     {member.role}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--mist)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--ink)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
//                 {total} total member{total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// "use client";
// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// type MemberRole = "owner" | "admin" | "manager" | "member";
// type MemberStatus = "ACTIVE" | "REMOVED";
// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   status: MemberStatus;
//   createdAt: string;
// };
// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };
// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];
// export default function WorkspaceMemberCard() {
//   const params = useParams();
//   const workspaceId = params.workspaceId as string;
//   const [members, setMembers] = useState<Member[]>([]);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [deactivatingMemberId, setDeactivatingMemberId] = useState<
//     string | null
//   >(null);
//   const fetchMembers = async () => {
//     if (!workspaceId) return;
//     try {
//       setLoading(true);
//       setError("");
//       const searchParams = new URLSearchParams({
//         page: String(page),
//         limit: String(limit),
//       });
//       if (selectedRole) {
//         searchParams.set("role", selectedRole);
//       }
//       const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;
//       const response = await fetch(url);
//       const data: MembersResponse = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to fetch members.");
//       }
//       setMembers(data.members);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error("FETCH_MEMBERS_ERROR:", error);
//       setError(
//         error instanceof Error ? error.message : "Failed to fetch members.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchMembers();
//   }, [workspaceId, page, limit, selectedRole]);
//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedRole(event.target.value);
//     setPage(1);
//   };
//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLimit(Number(event.target.value));
//     setPage(1);
//   };
//   const handlePrevious = () => {
//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };
//   const handleNext = () => {
//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };
//   const handleDeactivateMember = async (userId: string) => {
//     try {
//       setDeactivatingMemberId(userId);
//       setError("");
//       const response = await fetch(`/api/workspace/${workspaceId}/members`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to deactivate member.");
//       }
//       await fetchMembers();
//     } catch (error) {
//       console.error("DEACTIVATE_MEMBER_ERROR:", error);
//       setError(
//         error instanceof Error ? error.message : "Failed to deactivate member.",
//       );
//     } finally {
//       setDeactivatingMemberId(null);
//     }
//   };
//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       {/* Header */}
//       <div className="border-b border-[var(--color-border)] px-6 py-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
//               style={{ fontFamily: "var(--font-display)" }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="space-y-6 p-6">
//         {/* Filters */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* Role */}
//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)]"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Limit */}
//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)]"
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* Member Count */}
//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
//             <p className="text-xs text-[var(--color-text-muted)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {members.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {total}
//               </span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

//               <p className="text-sm text-[var(--color-text-secondary)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-tag-red-bg)] px-4 py-3">
//             <span className="mt-0.5 text-[var(--color-priority-high)]">!</span>

//             <p className="text-sm text-[var(--color-text-primary)]">{error}</p>
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tag-neutral-bg)] text-[var(--color-text-muted)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--color-text-muted)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* Members */}
//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
//             <div className="divide-y divide-[var(--color-border)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-app-bg)]"
//                 >
//                   {/* User */}
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-medium text-[var(--color-primary)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--color-text-muted)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Role + Action */}
//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
//                       {member.role}
//                     </span>

//                     {/* Owner cannot be deactivated */}
//                     {member.role !== "owner" && (
//                       <button
//                         type="button"
//                         onClick={() => handleDeactivateMember(member.userId)}
//                         disabled={deactivatingMemberId === member.userId}
//                         className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {deactivatingMemberId === member.userId
//                           ? "Deactivating..."
//                           : "Deactivate"}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
//                 {total} total member {total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole = "owner" | "admin" | "manager" | "member";

// type MemberStatus = "ACTIVE" | "REMOVED";

// type Member = {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   role: MemberRole;
//   status: MemberStatus;
//   createdAt: string;
// };

// type MembersResponse = {
//   message: string;
//   members: Member[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// const roles = [
//   { label: "All Members", value: "" },
//   { label: "Owner", value: "owner" },
//   { label: "Admin", value: "admin" },
//   { label: "Manager", value: "manager" },
//   { label: "Member", value: "member" },
// ];

// export default function WorkspaceMemberCard() {
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   const [members, setMembers] = useState<Member[]>([]);

//   const [selectedRole, setSelectedRole] = useState("");

//   const [page, setPage] = useState(1);

//   const [limit, setLimit] = useState(5);

//   const [totalPages, setTotalPages] = useState(1);

//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] = useState(true);

//   const [error, setError] = useState("");

//   const [deactivatingMemberId, setDeactivatingMemberId] = useState<
//     string | null
//   >(null);

//   // =========================================================
//   // FETCH MEMBERS
//   // =========================================================

//   useEffect(() => {
//     if (!workspaceId) {
//       return;
//     }

//     let cancelled = false;

//     async function loadMembers() {
//       try {
//         const searchParams = new URLSearchParams({
//           page: String(page),
//           limit: String(limit),
//         });

//         if (selectedRole) {
//           searchParams.set("role", selectedRole);
//         }

//         const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

//         const response = await fetch(url, {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: MembersResponse = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Failed to fetch members.");
//         }

//         // Ignore response if component was unmounted
//         // or dependencies changed before request completed.
//         if (cancelled) {
//           return;
//         }

//         setMembers(data.members);
//         setTotalPages(data.pagination.totalPages);
//         setTotal(data.pagination.total);
//         setError("");
//       } catch (error) {
//         if (cancelled) {
//           return;
//         }

//         console.error("FETCH_MEMBERS_ERROR:", error);

//         setError(
//           error instanceof Error ? error.message : "Failed to fetch members.",
//         );
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadMembers();

//     return () => {
//       cancelled = true;
//     };
//   }, [workspaceId, page, limit, selectedRole]);

//   // =========================================================
//   // ROLE FILTER
//   // =========================================================

//   const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLoading(true);
//     setError("");

//     setSelectedRole(event.target.value);

//     // When changing filter, always go back to page 1.
//     setPage(1);
//   };

//   // =========================================================
//   // PAGE LIMIT
//   // =========================================================

//   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setLoading(true);
//     setError("");

//     setLimit(Number(event.target.value));

//     // Changing page size should start from first page.
//     setPage(1);
//   };

//   // =========================================================
//   // PAGINATION
//   // =========================================================

//   const handlePrevious = () => {
//     if (page <= 1) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     setPage((currentPage) => Math.max(currentPage - 1, 1));
//   };

//   const handleNext = () => {
//     if (page >= totalPages) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     setPage((currentPage) => Math.min(currentPage + 1, totalPages));
//   };

//   // =========================================================
//   // DEACTIVATE MEMBER
//   // =========================================================

//   const handleDeactivateMember = async (userId: string) => {
//     try {
//       setDeactivatingMemberId(userId);
//       setError("");

//       const response = await fetch(`/api/workspace/${workspaceId}/members`, {
//         method: "PATCH",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           userId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to deactivate member.");
//       }

//       /*
//        * If this is the last member on the current page and
//        * we're not on page 1, move to the previous page.
//        *
//        * Changing page will automatically trigger useEffect
//        * and fetch fresh members.
//        */
//       if (members.length === 1 && page > 1) {
//         setLoading(true);
//         setPage((currentPage) => currentPage - 1);

//         return;
//       }

//       /*
//        * Otherwise update the UI locally.
//        * This avoids making another API request.
//        */
//       setMembers((currentMembers) =>
//         currentMembers.filter((member) => member.userId !== userId),
//       );

//       setTotal((currentTotal) => {
//         const nextTotal = Math.max(currentTotal - 1, 0);

//         setTotalPages(Math.max(1, Math.ceil(nextTotal / limit)));

//         return nextTotal;
//       });
//     } catch (error) {
//       console.error("DEACTIVATE_MEMBER_ERROR:", error);

//       setError(
//         error instanceof Error ? error.message : "Failed to deactivate member.",
//       );
//     } finally {
//       setDeactivatingMemberId(null);
//     }
//   };

//   return (
//     <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
//       {/* =====================================================
//           HEADER
//       ====================================================== */}

//       <div className="border-b border-[var(--color-border)] px-6 py-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

//               <circle cx="9" cy="7" r="4" />

//               <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
//               style={{
//                 fontFamily: "var(--font-display)",
//               }}
//             >
//               Workspace members
//             </h2>

//             <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
//               View workspace members and manage their organization roles.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           CONTENT
//       ====================================================== */}

//       <div className="space-y-6 p-6">
//         {/* ===================================================
//             FILTERS
//         ==================================================== */}

//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           {/* ROLE FILTER */}

//           <div className="flex-1">
//             <label
//               htmlFor="member-role"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Filter by role
//             </label>

//             <select
//               id="member-role"
//               value={selectedRole}
//               onChange={handleRoleChange}
//               disabled={loading}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {roles.map((role) => (
//                 <option key={role.value} value={role.value}>
//                   {role.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* PAGE LIMIT */}

//           <div className="w-full sm:w-32">
//             <label
//               htmlFor="member-limit"
//               className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Per page
//             </label>

//             <select
//               id="member-limit"
//               value={limit}
//               onChange={handleLimitChange}
//               disabled={loading}
//               className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-card-bg)] focus:ring-4 focus:ring-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               <option value={5}>5</option>

//               <option value={10}>10</option>

//               <option value={20}>20</option>
//             </select>
//           </div>
//         </div>

//         {/* ===================================================
//             MEMBER COUNT
//         ==================================================== */}

//         {!loading && !error && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
//             <p className="text-xs text-[var(--color-text-muted)]">
//               Showing{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {members.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-medium text-[var(--color-text-primary)]">
//                 {total}
//               </span>{" "}
//               member{total === 1 ? "" : "s"}
//             </p>
//           </div>
//         )}

//         {/* ===================================================
//             LOADING
//         ==================================================== */}

//         {loading && (
//           <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
//             <div className="flex items-center gap-3">
//               <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />

//               <p className="text-sm text-[var(--color-text-secondary)]">
//                 Loading members...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             ERROR
//         ==================================================== */}

//         {!loading && error && (
//           <div className="flex items-start gap-3 rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-tag-red-bg)] px-4 py-3">
//             <span className="mt-0.5 text-[var(--color-priority-high)]">!</span>

//             <p className="text-sm text-[var(--color-text-primary)]">{error}</p>
//           </div>
//         )}

//         {/* ===================================================
//             EMPTY STATE
//         ==================================================== */}

//         {!loading && !error && members.length === 0 && (
//           <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-tag-neutral-bg)] text-[var(--color-text-muted)]">
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.8"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

//                 <circle cx="9" cy="7" r="4" />
//               </svg>
//             </div>

//             <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
//               No members found
//             </p>

//             <p className="mt-1 text-xs text-[var(--color-text-muted)]">
//               Try changing the role filter.
//             </p>
//           </div>
//         )}

//         {/* ===================================================
//             MEMBERS
//         ==================================================== */}

//         {!loading && !error && members.length > 0 && (
//           <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
//             <div className="divide-y divide-[var(--color-border)]">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-app-bg)]"
//                 >
//                   {/* USER */}

//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-medium text-[var(--color-primary)]">
//                       {member.name ? member.name.charAt(0).toUpperCase() : "U"}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
//                         {member.name}
//                       </p>

//                       <p className="truncate text-xs text-[var(--color-text-muted)]">
//                         {member.email}
//                       </p>
//                     </div>
//                   </div>

//                   {/* ROLE + ACTION */}

//                   <div className="flex shrink-0 items-center gap-2">
//                     <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
//                       {member.role}
//                     </span>

//                     {/* OWNER CANNOT BE DEACTIVATED */}

//                     {member.role !== "owner" && (
//                       <button
//                         type="button"
//                         onClick={() => handleDeactivateMember(member.userId)}
//                         disabled={deactivatingMemberId === member.userId}
//                         className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {deactivatingMemberId === member.userId
//                           ? "Deactivating..."
//                           : "Deactivate"}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             PAGINATION
//         ==================================================== */}

//         {!loading && !error && members.length > 0 && totalPages > 1 && (
//           <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
//             <button
//               type="button"
//               onClick={handlePrevious}
//               disabled={page === 1}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <div className="text-center">
//               <p className="text-sm font-medium text-[var(--color-text-primary)]">
//                 Page {page} of {totalPages}
//               </p>

//               <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
//                 {total} total member
//                 {total === 1 ? "" : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useModalBehavior } from "@/components/ui/Modal";
import { useParams } from "next/navigation";

type MemberRole = "owner" | "admin" | "manager" | "member";
type BoardStatus = "ACTIVE" | "DEACTIVATED";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
  status: "ACTIVE" | "REMOVED";
  createdAt: string;
};

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
  role?: MemberRole;
};

type BoardMember = {
  userId: string;
  role: MemberRole;
  status?: BoardStatus;
};

type MembersResponse = {
  message?: string;
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BoardResponse = {
  message?: string;
  boards?: Board[];
  data?: {
    boards?: Board[];
  };
};

type BoardMembersResponse = {
  message?: string;
  members?: BoardMember[];
  data?: {
    members?: BoardMember[];
    total?: number;
  };
};

type MenuAction = "assign" | "remove-board";

type ConfirmationAction =
  | { type: "workspace"; member: Member }
  | { type: "board"; member: Member; boardId: string }
  | null;

const roles = [
  { label: "All Members", value: "" },
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Member", value: "member" },
];

const boardRoles: MemberRole[] = ["admin", "manager", "member"];

export default function WorkspaceMemberCard() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [menuAction, setMenuAction] = useState<MenuAction>("assign");

  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedBoardRole, setSelectedBoardRole] =
    useState<MemberRole>("member");

  const [boardMemberships, setBoardMemberships] = useState<
    Record<string, BoardMember | null>
  >({});

  const [loadingBoards, setLoadingBoards] = useState(false);
  const [savingBoard, setSavingBoard] = useState(false);
  const [boardError, setBoardError] = useState("");
  const [boardMessage, setBoardMessage] = useState("");

  const [deactivatingMemberId, setDeactivatingMemberId] = useState<
    string | null
  >(null);

  // Custom confirmation modal state.
  const [confirmation, setConfirmation] = useState<ConfirmationAction>(null);

  const [confirming, setConfirming] = useState(false);

  // =========================================================
  // FETCH WORKSPACE MEMBERS
  // =========================================================

  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;

    async function loadMembers() {
      setLoading(true);
      setError("");

      try {
        const searchParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (selectedRole) {
          searchParams.set("role", selectedRole);
        }

        const response = await fetch(
          `/api/workspace/${workspaceId}/members?${searchParams.toString()}`,
          { cache: "no-store" },
        );

        const data: MembersResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch members.");
        }

        if (cancelled) return;

        setMembers(data.members ?? []);
        setTotalPages(Math.max(1, data.pagination?.totalPages ?? 1));
        setTotal(data.pagination?.total ?? 0);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to fetch members.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, page, limit, selectedRole]);

  // =========================================================
  // CLOSE MENUS WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Element && !target.closest("[data-member-menu]")) {
        setOpenMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpenMenuId(null);

      if (!confirming && !savingBoard && !deactivatingMemberId) {
        setConfirmation(null);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [confirming, savingBoard, deactivatingMemberId]);

  // =========================================================
  // OPEN ASSIGN / REMOVE BOARD DIALOG
  // =========================================================

  async function openBoardDialog(member: Member, action: MenuAction) {
    setOpenMenuId(null);
    setActiveMember(member);
    setMenuAction(action);
    setSelectedBoardId("");
    setSelectedBoardRole("member");
    setBoardError("");
    setBoardMessage("");
    setBoards([]);
    setBoardMemberships({});
    setLoadingBoards(true);

    try {
      const response = await fetch(`/api/workspace/${workspaceId}/board`, {
        cache: "no-store",
      });

      const data: BoardResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspace boards.");
      }

      const allBoards = data.boards ?? data.data?.boards ?? [];

      // Only show boards belonging to this workspace.
      const workspaceBoards = allBoards.filter(
        (board) => board.organizationId === workspaceId,
      );

      setBoards(workspaceBoards);

      // Use the existing boardMembers route.
      const membershipEntries = await Promise.all(
        workspaceBoards.map(async (board) => {
          const memberResponse = await fetch(
            `/api/workspace/${workspaceId}/board/${board.id}/boardMembers?page=1&limit=100`,
            { cache: "no-store" },
          );

          if (!memberResponse.ok) {
            throw new Error(
              `Could not check membership for ${board.boardName}.`,
            );
          }

          const memberData: BoardMembersResponse = await memberResponse.json();

          const boardMembers =
            memberData.data?.members ?? memberData.members ?? [];

          const existing = boardMembers.find(
            (boardMember) =>
              boardMember.userId === member.userId &&
              boardMember.status !== "DEACTIVATED",
          );

          return [board.id, existing ?? null] as const;
        }),
      );

      setBoardMemberships(Object.fromEntries(membershipEntries));
    } catch (err) {
      setBoardError(
        err instanceof Error ? err.message : "Failed to load boards.",
      );
    } finally {
      setLoadingBoards(false);
    }
  }

  // =========================================================
  // ASSIGN MEMBER TO BOARD
  // =========================================================

  async function handleAssignBoard() {
    if (!activeMember || !selectedBoardId) {
      setBoardError("Please select a board.");
      return;
    }

    if (boardMemberships[selectedBoardId]) {
      setBoardError("This member is already active on that board.");
      return;
    }

    setSavingBoard(true);
    setBoardError("");
    setBoardMessage("");

    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${selectedBoardId}/boardMembers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: activeMember.userId,
            email: activeMember.email,
            role: selectedBoardRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign member to board.");
      }

      setBoardMemberships((current) => ({
        ...current,
        [selectedBoardId]: {
          userId: activeMember.userId,
          role: selectedBoardRole,
          status: "ACTIVE",
        },
      }));

      setBoardMessage(data.message || "Member assigned to board successfully.");
    } catch (err) {
      setBoardError(
        err instanceof Error ? err.message : "Failed to assign member.",
      );
    } finally {
      setSavingBoard(false);
    }
  }

  // =========================================================
  // REQUEST BOARD REMOVAL
  // Opens the custom confirmation modal.
  // =========================================================

  function requestBoardRemoval() {
    if (!activeMember || !selectedBoardId) {
      setBoardError("Please select a board.");
      return;
    }

    if (!boardMemberships[selectedBoardId]) {
      setBoardError("This member is not active on that board.");
      return;
    }

    setConfirmation({
      type: "board",
      member: activeMember,
      boardId: selectedBoardId,
    });
  }

  // =========================================================
  // REQUEST WORKSPACE REMOVAL
  // Opens the custom confirmation modal.
  // =========================================================

  function requestWorkspaceRemoval(member: Member) {
    if (member.role === "owner") return;

    setOpenMenuId(null);
    setConfirmation({
      type: "workspace",
      member,
    });
  }

  // =========================================================
  // CONFIRM REMOVAL
  // This function is called only after confirmation.
  // =========================================================

  async function handleConfirmRemoval() {
    if (!confirmation || confirming) return;

    const action = confirmation;

    setConfirming(true);
    setError("");
    setBoardError("");
    setBoardMessage("");

    if (action.type === "workspace") {
      setDeactivatingMemberId(action.member.userId);
    } else {
      setSavingBoard(true);
    }

    try {
      if (action.type === "workspace") {
        const response = await fetch(`/api/workspace/${workspaceId}/members`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: action.member.userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to remove workspace member.");
        }

        // Remove the member from the visible list after API success.
        if (members.length === 1 && page > 1) {
          setTotal(Math.max(0, total - 1));
          setPage((current) => current - 1);
        } else {
          setMembers((current) =>
            current.filter((member) => member.userId !== action.member.userId),
          );

          const nextTotal = Math.max(0, total - 1);
          setTotal(nextTotal);
          setTotalPages(Math.max(1, Math.ceil(nextTotal / limit)));
        }

        // Close the confirmation modal only after success.
        setConfirmation(null);
      } else {
        const response = await fetch(
          `/api/workspace/${workspaceId}/board/${action.boardId}/boardMembers`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: action.member.userId,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to remove board member.");
        }

        setBoardMemberships((current) => ({
          ...current,
          [action.boardId]: null,
        }));

        setBoardMessage(data.message || "Member removed from board.");
        setConfirmation(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove member.";

      if (action.type === "workspace") {
        setError(message);
      } else {
        setBoardError(message);
      }

      // Keep the modal open on failure so the user can retry or cancel.
    } finally {
      setConfirming(false);
      setSavingBoard(false);
      setDeactivatingMemberId(null);
    }
  }

  // =========================================================
  // CLOSE BOARD DIALOG
  // =========================================================

  function closeBoardDialog() {
    if (savingBoard || confirming) return;

    setActiveMember(null);
    setSelectedBoardId("");
    setBoardError("");
    setBoardMessage("");
    setBoardMemberships({});
  }

  // =========================================================
  // STYLES
  // =========================================================

  const fieldClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60";

  const secondaryButtonClass =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-50";

  const primaryButtonClass =
    "rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

  const dangerButtonClass =
    "rounded-xl bg-[var(--color-priority-high)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

  const confirmingMember = confirmation?.member;


  // Esc, focus handling and scroll lock for the assign/remove board dialog.
  const boardDialogRef = useRef<HTMLElement>(null);
  useModalBehavior({
    isOpen: Boolean(activeMember),
    onClose: closeBoardDialog,
    dismissible: !savingBoard && !confirming,
    panelRef: boardDialogRef,
  });

  return (
    <section className="relative w-full max-w-6xl overflow-visible rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
      {/* HEADER */}
      <div className="border-b border-[var(--color-border)] px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <div>
            <h2
              className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Workspace members
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              Manage organization members and their board access.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 p-6">
        {/* FILTERS */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label
              htmlFor="member-role"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Filter by role
            </label>
            <select
              id="member-role"
              value={selectedRole}
              onChange={(event) => {
                setSelectedRole(event.target.value);
                setPage(1);
                setOpenMenuId(null);
              }}
              disabled={loading}
              className={fieldClass}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-32">
            <label
              htmlFor="member-limit"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Per page
            </label>
            <select
              id="member-limit"
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
                setOpenMenuId(null);
              }}
              disabled={loading}
              className={fieldClass}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* MEMBER COUNT */}
        {!loading && !error && (
          <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Showing{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {members.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {total}
              </span>{" "}
              members
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center rounded-xl bg-[var(--color-app-bg)] py-10">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Loading members...
              </p>
            </div>
          </div>
        )}

        {/* WORKSPACE ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
          >
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && members.length === 0 && (
          <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              No members found
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Try changing the role filter.
            </p>
          </div>
        )}

        {/* WORKSPACE MEMBERS TABLE */}
        {!loading && !error && members.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-[var(--color-app-bg)]">
                <tr className="border-b border-[var(--color-border)]">
                  {(
                    ["Member", "Role", "Status", "Joined", "Actions"] as const
                  ).map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] ${heading === "Actions" ? "text-right" : ""}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[var(--color-app-bg)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-active-bg)] text-sm font-semibold text-[var(--color-primary)]">
                          {member.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate text-sm font-medium text-[var(--color-text-primary)]">
                            {member.name}
                          </p>
                          <p className="max-w-[240px] truncate text-xs text-[var(--color-text-muted)]">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                        {member.status === "ACTIVE" ? "Active" : "Removed"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
                      {member.createdAt &&
                      !Number.isNaN(new Date(member.createdAt).getTime())
                        ? new Date(member.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {member.role === "owner" ? (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Workspace owner
                        </span>
                      ) : (
                        <div
                          className="relative inline-block text-left"
                          data-member-menu
                        >
                          <button
                            type="button"
                            aria-label={`Actions for ${member.name}`}
                            aria-expanded={openMenuId === member.userId}
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === member.userId
                                  ? null
                                  : member.userId,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] text-xl text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
                          >
                            <span aria-hidden="true">⋮</span>
                          </button>
                          {openMenuId === member.userId && (
                            <div className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-1 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  void openBoardDialog(member, "assign")
                                }
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
                              >
                                Assign to board
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void openBoardDialog(member, "remove-board")
                                }
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)]"
                              >
                                Remove from board
                              </button>
                              <button
                                type="button"
                                disabled={
                                  deactivatingMemberId === member.userId ||
                                  confirming
                                }
                                onClick={() => requestWorkspaceRemoval(member)}
                                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-priority-high)] hover:bg-[var(--color-tag-red-bg)] disabled:opacity-50"
                              >
                                Remove from workspace
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && members.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                setPage((current) => Math.max(current - 1, 1));
              }}
              disabled={page === 1}
              className={secondaryButtonClass}
            >
              Previous
            </button>

            <div className="text-center">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Page {page} of {totalPages}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {total} total members
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                setPage((current) => Math.min(current + 1, totalPages));
              }}
              disabled={page === totalPages}
              className={secondaryButtonClass}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ASSIGN / REMOVE BOARD DIALOG */}
      {activeMember && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBoardDialog();
            }
          }}
        >
          <section
            ref={boardDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="board-dialog-title"
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto outline-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
              <div>
                <h3
                  id="board-dialog-title"
                  className="text-lg font-medium text-[var(--color-text-primary)]"
                >
                  {menuAction === "assign"
                    ? "Assign member to a board"
                    : "Remove member from a board"}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {activeMember.name} · {activeMember.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBoardDialog}
                disabled={savingBoard || confirming}
                aria-label="Close dialog"
                className="rounded-lg px-2 py-1 text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-app-bg)] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              {loadingBoards ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Loading boards and membership...
                  </p>
                </div>
              ) : boardError && boards.length === 0 ? (
                <p
                  role="alert"
                  className="rounded-xl bg-[var(--color-tag-red-bg)] p-3 text-sm text-[var(--color-text-primary)]"
                >
                  {boardError}
                </p>
              ) : boards.length === 0 ? (
                <p className="rounded-xl bg-[var(--color-app-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
                  No boards were returned for this workspace. Check the
                  workspace boards endpoint and its access permissions.
                </p>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="member-board"
                      className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                    >
                      Select board
                    </label>

                    <select
                      id="member-board"
                      value={selectedBoardId}
                      onChange={(event) => {
                        setSelectedBoardId(event.target.value);
                        setBoardError("");
                        setBoardMessage("");
                      }}
                      className={fieldClass}
                    >
                      <option value="">Choose a board</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.boardName}
                          {boardMemberships[board.id]
                            ? " — Already assigned"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBoardId && (
                    <div className="rounded-xl bg-[var(--color-app-bg)] p-4">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {
                          boards.find((board) => board.id === selectedBoardId)
                            ?.boardName
                        }
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {boardMemberships[selectedBoardId]
                          ? `Currently assigned as ${boardMemberships[selectedBoardId]?.role}.`
                          : "No active membership was found for this member."}
                      </p>
                    </div>
                  )}

                  {menuAction === "assign" && (
                    <div>
                      <label
                        htmlFor="board-member-role"
                        className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                      >
                        Board role
                      </label>

                      <select
                        id="board-member-role"
                        value={selectedBoardRole}
                        onChange={(event) =>
                          setSelectedBoardRole(event.target.value as MemberRole)
                        }
                        className={fieldClass}
                      >
                        {boardRoles.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {boardError && boards.length > 0 && (
                <p
                  role="alert"
                  className="rounded-xl bg-[var(--color-tag-red-bg)] p-3 text-sm text-[var(--color-text-primary)]"
                >
                  {boardError}
                </p>
              )}

              {boardMessage && (
                <p
                  role="status"
                  className="rounded-xl bg-[var(--color-app-bg)] p-3 text-sm text-[var(--color-text-primary)]"
                >
                  {boardMessage}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={closeBoardDialog}
                  disabled={savingBoard || confirming}
                  className={secondaryButtonClass}
                >
                  Close
                </button>

                {menuAction === "assign" ? (
                  <button
                    type="button"
                    onClick={() => void handleAssignBoard()}
                    disabled={
                      savingBoard ||
                      loadingBoards ||
                      !selectedBoardId ||
                      Boolean(boardMemberships[selectedBoardId])
                    }
                    className={primaryButtonClass}
                  >
                    {savingBoard ? "Assigning..." : "Assign member"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={requestBoardRemoval}
                    disabled={
                      savingBoard ||
                      loadingBoards ||
                      !selectedBoardId ||
                      !boardMemberships[selectedBoardId]
                    }
                    className={dangerButtonClass}
                  >
                    Remove from board
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={Boolean(confirmation && confirmingMember)}
        title={
          confirmation?.type === "workspace"
            ? "Remove workspace member?"
            : "Remove member from board?"
        }
        description={
          confirmation?.type === "workspace" ? (
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {confirmingMember?.name}
              </span>{" "}
              from this workspace? Their workspace membership will be
              deactivated.
            </>
          ) : (
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {confirmingMember?.name}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {boards.find((board) => board.id === confirmation?.boardId)
                  ?.boardName ?? "this board"}
              </span>
              ? They will lose access through this board membership.
            </>
          )
        }
        confirmLabel={
          confirmation?.type === "workspace"
            ? "Remove member"
            : "Remove from board"
        }
        pendingLabel="Removing..."
        isPending={confirming}
        onConfirm={() => void handleConfirmRemoval()}
        onCancel={() => setConfirmation(null)}
      />
    </section>
  );
}
