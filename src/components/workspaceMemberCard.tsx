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

//   useEffect(() => {
//     fetchMembers();
//   }, [workspaceId, page ,limit]);

//   const handleRoleChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     const role = event.target.value;

//     setSelectedRole(role);
//     fetchMembers(role);
//   };

//   return (
//     <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-900">
//             Workspace Members
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage members and view their roles.
//           </p>
//         </div>

//         {/* Role Filter */}
//         <select
//           value={selectedRole}
//           onChange={handleRoleChange}
//           className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
//         >
//           {roles.map((role) => (
//             <option
//               key={role.value}
//               value={role.value}
//             >
//               {role.label}
//             </option>
//           ))}
//         </select>
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
//       {!loading && !error && members.length === 0 && (
//         <div className="py-8 text-center text-sm text-gray-500">
//           No members found.
//         </div>
//       )}

//       {/* Members */}
//       {!loading && !error && members.length > 0 && (
//         <div className="divide-y divide-gray-200">
//           {members.map((member) => (
//             <div
//               key={member.id}
//               className="flex items-center justify-between py-4"
//             >
//               {/* User */}
//               <div>
//                 <p className="font-medium text-gray-900">
//                   {member.name}
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   {member.email}
//                 </p>
//               </div>

//               {/* Role */}
//               <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
//                 {member.role}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
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

  const [selectedRole, setSelectedRole] =
    useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] =
    useState(false);

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
        searchParams.set(
          "role",
          selectedRole,
        );
      }

      const url = `/api/workspace/${workspaceId}/members?${searchParams.toString()}`;

      const response = await fetch(url);

      const data: MembersResponse =
        await response.json();

      console.log(
        "MEMBER API RESPONSE:",
        data,
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch members",
        );
      }

      setMembers(data.members);

      setTotalPages(
        data.pagination.totalPages,
      );

      setTotal(data.pagination.total);
    } catch (error) {
      console.error(
        "FETCH_MEMBERS_ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch members",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [
    workspaceId,
    page,
    limit,
    selectedRole,
  ]);

  const handleRoleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedRole(event.target.value);

    // Role change hone par first page
    setPage(1);
  };

  const handleLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setLimit(Number(event.target.value));

    // Limit change hone par first page
    setPage(1);
  };

  const handlePrevious = () => {
    setPage((currentPage) =>
      Math.max(currentPage - 1, 1),
    );
  };

  const handleNext = () => {
    setPage((currentPage) =>
      Math.min(
        currentPage + 1,
        totalPages,
      ),
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Workspace Members
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage members and view their roles.
          </p>
        </div>

        {/* Top Right Filters */}
        <div className="flex items-center gap-3">

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
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

          {/* Records Per Page */}
          <select
            value={limit}
            onChange={handleLimitChange}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading members...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        members.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No members found.
          </div>
        )}

      {/* Members */}
      {!loading &&
        !error &&
        members.length > 0 && (
          <>
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-4"
                >
                  {/* User */}
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {member.email}
                    </p>
                  </div>

                  {/* Role */}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination - Bottom of Card */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">

                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    page === totalPages
                  }
                  className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>

              </div>
            )}
          </>
        )}

    </div>
  );
}