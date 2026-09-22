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
//   pagination:{
//     page:number;
//     limit:number;
//     total:number;
//     totalPages:number;
//   }
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
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [page,setPages]=useState(1);
//   const [limit ,setLimit]=useState(5);
//   const [totalPages, setTotalPages]=useState(1);
//   const [total, setTotal]=useState(0);
//   const fetchMembers = async (role = "") => {
//     if (!workspaceId) return;

//     try {
//       setLoading(true);
//       setError("");

//       const url = role
//         ? `/api/workspace/${workspaceId}/members?role=${role}`
//         : `/api/workspace/${workspaceId}/members`;

//       const response = await fetch(url);

//       const data: MembersResponse = await response.json();
// console.log("Member API RESPONSE:", data);
//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to fetch members",
//         );
//       }

//       setMembers(data.members);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);

//     } catch (error) {
//       console.error("FETCH_MEMBERS_ERROR:", error);

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch members",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

// //   useEffect(() => {
// //     fetchMembers();
// //   }, [workspaceId, page ,limit]);

// //   const handleRoleChange = (
// //     event: React.ChangeEvent<HTMLSelectElement>,
// //   ) => {
// //     const role = event.target.value;

// //     setSelectedRole(role);
// //     fetchMembers(role);
// //   };

// //   return (
// //     <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
// //       {/* Header */}
// //       <div className="mb-6 flex items-center justify-between">
// //         <div>
// //           <h2 className="text-xl font-semibold text-gray-900">
// //             Workspace Members
// //           </h2>

// //           <p className="mt-1 text-sm text-gray-500">
// //             Manage members and view their roles.
// //           </p>
// //         </div>

// //         {/* Role Filter */}
// //         <select
// //           value={selectedRole}
// //           onChange={handleRoleChange}
// //           className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
// //         >
// //           {roles.map((role) => (
// //             <option
// //               key={role.value}
// //               value={role.value}
// //             >
// //               {role.label}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       {/* Loading */}
// //       {loading && (
// //         <div className="py-8 text-center text-sm text-gray-500">
// //           Loading members...
// //         </div>
// //       )}

// //       {/* Error */}
// //       {!loading && error && (
// //         <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
// //           {error}
// //         </div>
// //       )}

// //       {/* Empty */}
// //       {!loading && !error && members.length === 0 && (
// //         <div className="py-8 text-center text-sm text-gray-500">
// //           No members found.
// //         </div>
// //       )}

// //       {/* Members */}
// //       {!loading && !error && members.length > 0 && (
// //         <div className="divide-y divide-gray-200">
// //           {members.map((member) => (
// //             <div
// //               key={member.id}
// //               className="flex items-center justify-between py-4"
// //             >
// //               {/* User */}
// //               <div>
// //                 <p className="font-medium text-gray-900">
// //                   {member.name}
// //                 </p>

// //                 <p className="text-sm text-gray-500">
// //                   {member.email}
// //                 </p>
// //               </div>

// //               {/* Role */}
// //               <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
// //                 {member.role}
// //               </span>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

// type MemberRole =
//   | "owner"
//   | "admin"
//   | "manager"
//   | "member";

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

//   const [selectedRole, setSelectedRole] =
//     useState("");

//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(5);

//   const [totalPages, setTotalPages] =
//     useState(1);

//   const [total, setTotal] = useState(0);

//   const [loading, setLoading] =
//     useState(false);

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
//         searchParams.set(
//           "role",
//           selectedRole,
//         );
//       }

//       const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

//       const response = await fetch(url);

//       const data: MembersResponse =
//         await response.json();

//       console.log(
//         "MEMBER API RESPONSE:",
//         data,
//       );

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Failed to fetch members",
//         );
//       }

//       setMembers(data.members);

//       setTotalPages(
//         data.pagination.totalPages,
//       );

//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error(
//         "FETCH_MEMBERS_ERROR:",
//         error,
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch members",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMembers();
//   }, [
//     workspaceId,
//     page,
//     limit,
//     selectedRole,
//   ]);

//   const handleRoleChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     setSelectedRole(event.target.value);

//     // Role change hone par first page
//     setPage(1);
//   };

//   const handleLimitChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     setLimit(Number(event.target.value));

//     // Limit change hone par first page
//     setPage(1);
//   };

//   const handlePrevious = () => {
//     setPage((currentPage) =>
//       Math.max(currentPage - 1, 1),
//     );
//   };

//   const handleNext = () => {
//     setPage((currentPage) =>
//       Math.min(
//         currentPage + 1,
//         totalPages,
//       ),
//     );
//   };

//   return (
//     <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

//       {/* Header */}
//       <div className="mb-6 flex items-start justify-between">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-900">
//             Workspace Members
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage members and view their roles.
//           </p>
//         </div>

//         {/* Top Right Filters */}
//         <div className="flex items-center gap-3">

//           {/* Role Filter */}
//           <select
//             value={selectedRole}
//             onChange={handleRoleChange}
//             className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
//           >
//             {roles.map((role) => (
//               <option
//                 key={role.value}
//                 value={role.value}
//               >
//                 {role.label}
//               </option>
//             ))}
//           </select>

//           {/* Records Per Page */}
//           <select
//             value={limit}
//             onChange={handleLimitChange}
//             className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//           </select>

//         </div>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="py-8 text-center text-sm text-gray-500">
//           Loading members...
//         </div>
//       )}

//       {/* Error */}
//       {!loading && error && (
//         <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
//           {error}
//         </div>
//       )}

//       {/* Empty */}
//       {!loading &&
//         !error &&
//         members.length === 0 && (
//           <div className="py-8 text-center text-sm text-gray-500">
//             No members found.
//           </div>
//         )}

//       {/* Members */}
//       {!loading &&
//         !error &&
//         members.length > 0 && (
//           <>
//             <div className="divide-y divide-gray-200">
//               {members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex items-center justify-between py-4"
//                 >
//                   {/* User */}
//                   <div>
//                     <p className="font-medium text-gray-900">
//                       {member.name}
//                     </p>

//                     <p className="text-sm text-gray-500">
//                       {member.email}
//                     </p>
//                   </div>

//                   {/* Role */}
//                   <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
//                     {member.role}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination - Bottom of Card */}
//             {totalPages > 1 && (
//               <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">

//                 <button
//                   type="button"
//                   onClick={handlePrevious}
//                   disabled={page === 1}
//                   className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Previous
//                 </button>

//                 <span className="text-sm text-gray-500">
//                   Page {page} of {totalPages}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={handleNext}
//                   disabled={
//                     page === totalPages
//                   }
//                   className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Next
//                 </button>

//               </div>
//             )}
//           </>
//         )}

//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type MemberRole =
| "owner"
| "admin"
| "manager"
| "member";

type Member = {
id: string;
userId: string;
name: string;
email: string;
role: MemberRole;
createdAt: string;
};

type MembersResponse = {
message: string;
members: Member[];
pagination: {
page: number;
limit: number;
total: number;
totalPages: number;
};
};

const roles = [
{ label: "All Members", value: "" },
{ label: "Owner", value: "owner" },
{ label: "Admin", value: "admin" },
{ label: "Manager", value: "manager" },
{ label: "Member", value: "member" },
];

export default function WorkspaceMemberCard() {
const params = useParams();

const workspaceId = params.workspaceId as string;

const [members, setMembers] = useState<Member[]>([]);
const [selectedRole, setSelectedRole] = useState("");
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(5);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const fetchMembers = async () => {
if (!workspaceId) return;


try {
  setLoading(true);
  setError("");

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (selectedRole) {
    searchParams.set("role", selectedRole);
  }

  const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

  const response = await fetch(url);

  const data: MembersResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch members.",
    );
  }

  setMembers(data.members);
  setTotalPages(data.pagination.totalPages);
  setTotal(data.pagination.total);
} catch (error) {
  console.error("FETCH_MEMBERS_ERROR:", error);

  setError(
    error instanceof Error
      ? error.message
      : "Failed to fetch members.",
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchMembers();
}, [workspaceId, page, limit, selectedRole]);

const handleRoleChange = (
event: React.ChangeEvent<HTMLSelectElement>,
) => {
setSelectedRole(event.target.value);
setPage(1);
};

const handleLimitChange = (
event: React.ChangeEvent<HTMLSelectElement>,
) => {
setLimit(Number(event.target.value));
setPage(1);
};

const handlePrevious = () => {
setPage((currentPage) =>
Math.max(currentPage - 1, 1),
);
};

const handleNext = () => {
setPage((currentPage) =>
Math.min(currentPage + 1, totalPages),
);
};

return ( <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
{/* Header */} <div className="border-b border-[var(--mist)] px-6 py-5"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]"> <svg
           width="20"
           height="20"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeWidth="1.8"
           strokeLinecap="round"
           strokeLinejoin="round"
         > <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" /> </svg> </div>


      <div>
        <h2
          className="text-xl font-medium tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Workspace members
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          View workspace members and manage their organization roles.
        </p>
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-6 p-6">
    {/* Filters */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* Role */}
      <div className="flex-1">
        <label
          htmlFor="member-role"
          className="mb-2 block text-sm font-medium text-[var(--ink)]"
        >
          Filter by role
        </label>

        <select
          id="member-role"
          value={selectedRole}
          onChange={handleRoleChange}
          className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
        >
          {roles.map((role) => (
            <option
              key={role.value}
              value={role.value}
            >
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Limit */}
      <div className="w-full sm:w-32">
        <label
          htmlFor="member-limit"
          className="mb-2 block text-sm font-medium text-[var(--ink)]"
        >
          Per page
        </label>

        <select
          id="member-limit"
          value={limit}
          onChange={handleLimitChange}
          className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>

    {/* Member Count */}
    {!loading && !error && (
      <div className="rounded-xl bg-[var(--paper)] px-4 py-3">
        <p className="text-xs text-[var(--ink-soft)]">
          Showing{" "}
          <span className="font-medium text-[var(--ink)]">
            {members.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-[var(--ink)]">
            {total}
          </span>{" "}
          member{total === 1 ? "" : "s"}
        </p>
      </div>
    )}

    {/* Loading */}
    {loading && (
      <div className="flex items-center justify-center rounded-xl bg-[var(--paper)] py-10">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mist)] border-t-[var(--indigo)]" />

          <p className="text-sm text-[var(--ink-soft)]">
            Loading members...
          </p>
        </div>
      </div>
    )}

    {/* Error */}
    {!loading && error && (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
        <span className="mt-0.5 text-[var(--coral)]">!</span>

        <p className="text-sm text-[var(--ink)]">
          {error}
        </p>
      </div>
    )}

    {/* Empty */}
    {!loading &&
      !error &&
      members.length === 0 && (
        <div className="rounded-xl bg-[var(--paper)] px-4 py-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mist)] text-[var(--ink-soft)]">
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>

          <p className="mt-3 text-sm font-medium text-[var(--ink)]">
            No members found
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Try changing the role filter.
          </p>
        </div>
      )}

    {/* Members */}
    {!loading &&
      !error &&
      members.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--mist)]">
          <div className="divide-y divide-[var(--mist)]">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--paper)]"
              >
                {/* User */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--indigo)]/[0.08] text-sm font-medium text-[var(--indigo)]">
                    {member.name
                      ? member.name
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {member.name}
                    </p>

                    <p className="truncate text-xs text-[var(--ink-soft)]">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <span className="shrink-0 rounded-full bg-[var(--paper)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--ink-soft)]">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* Pagination */}
    {!loading &&
      !error &&
      members.length > 0 &&
      totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-[var(--mist)] pt-5">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={page === 1}
            className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm font-medium text-[var(--ink)]">
              Page {page} of {totalPages}
            </p>

            <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
              {total} total member{total === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={page === totalPages}
            className="rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-all hover:border-[var(--indigo)] hover:bg-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
  </div>
</section>


);
}
