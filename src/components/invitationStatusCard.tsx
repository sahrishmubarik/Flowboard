
// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// type InvitationStatus =
//   | "PENDING"
//   | "ACCEPTED"
//   | "REVOKED";

// type Invitation = {
//   id: string;
//   email: string;
//   role: string;
//   status: InvitationStatus;
//   expiresAt: string;
//   createdAt: string;
// };

// type InvitationResponse = {
//   message: string;
//   invitations: Invitation[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// };

// export default function InvitationStatusCard() {
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   const [invitations, setInvitations] = useState<Invitation[]>(
//     [],
//   );

//   const [page, setPage] = useState(1);

//   // User can change this from dropdown
//   const [limit, setLimit] = useState(5);

//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);

//   const [isLoading, setIsLoading] = useState(true);

//   const [revokingId, setRevokingId] = useState<string | null>(
//     null,
//   );

//   const [error, setError] = useState("");

//   const fetchInvitations = async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       const response = await fetch(
//         `/api/workspace/${workspaceId}/invitation?page=${page}&limit=${limit}`,
//         {
//           method: "GET",
//         },
//       );

//       const data: InvitationResponse = await response.json();

//       console.log("INVITATION API RESPONSE:", data);

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to fetch invitations",
//         );
//       }

//       setInvitations(data.invitations);
//       setTotalPages(data.pagination.totalPages);
//       setTotal(data.pagination.total);
//     } catch (error) {
//       console.error(
//         "FETCH_INVITATIONS_ERROR:",
//         error,
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch invitations",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!workspaceId) return;

//     fetchInvitations();
//   }, [workspaceId, page, limit]);

//   const handleLimitChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     const newLimit = Number(event.target.value);

//     setLimit(newLimit);

//     // Jab limit change ho to first page par wapis
//     setPage(1);
//   };

//   const handlePrevious = () => {
//     setPage((currentPage) =>
//       Math.max(currentPage - 1, 1),
//     );
//   };

//   const handleNext = () => {
//     setPage((currentPage) =>
//       Math.min(currentPage + 1, totalPages),
//     );
//   };

//   const handleRevoke = async (
//     email: string,
//     invitationId: string,
//   ) => {
//     try {
//       setRevokingId(invitationId);
//       setError("");

//       const response = await fetch(
//         `/api/workspace/${workspaceId}/invitation`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to revoke invitation",
//         );
//       }

//       setInvitations((currentInvitations) =>
//         currentInvitations.map((invitation) =>
//           invitation.id === invitationId
//             ? {
//                 ...invitation,
//                 status: "REVOKED",
//               }
//             : invitation,
//         ),
//       );
//     } catch (error) {
//       console.error(
//         "REVOKE_INVITATION_ERROR:",
//         error,
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to revoke invitation",
//       );
//     } finally {
//       setRevokingId(null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="rounded-lg border p-6">
//         Loading invitations...
//       </div>
//     );
//   }

//   return (
//   <div className="rounded-lg border p-6">
//     {/* Header */}
//     <div className="mb-6 flex items-start justify-between">
//       <div>
//         <h2 className="text-xl font-semibold">
//           Invitations
//         </h2>

//         <p className="mt-1 text-sm text-gray-500">
//           View workspace invitations and their current status.
//         </p>
//       </div>

//       {/* Records dropdown - TOP RIGHT */}
//       <div className="flex items-center gap-2">
//         <span className="text-sm text-gray-500">
//           Show
//         </span>

//         <select
//           value={limit}
//           onChange={(event) => {
//             setLimit(Number(event.target.value));
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 text-sm outline-none"
//         >
//           <option value={5}>5</option>
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//         </select>
//       </div>
//     </div>

//     {/* Error */}
//     {error && (
//       <div className="mb-4 rounded-md border border-red-200 p-3 text-sm text-red-600">
//         {error}
//       </div>
//     )}

//     {/* Invitations */}
//     {invitations.length === 0 ? (
//       <p className="text-sm text-gray-500">
//         No invitations found.
//       </p>
//     ) : (
//       <div className="space-y-3">
//         {invitations.map((invitation) => (
//           <div
//             key={invitation.id}
//             className="flex items-center justify-between rounded-lg border p-4"
//           >
//             <div>
//               <p className="font-medium">
//                 {invitation.email}
//               </p>

//               <p className="text-sm text-gray-500">
//                 Role: {invitation.role}
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <span
//                 className={`rounded-full px-3 py-1 text-xs font-medium ${
//                   invitation.status === "PENDING"
//                     ? "bg-yellow-100 text-yellow-700"
//                     : invitation.status === "ACCEPTED"
//                       ? "bg-green-100 text-green-700"
//                       : "bg-gray-100 text-gray-600"
//                 }`}
//               >
//                 {invitation.status}
//               </span>

//               {invitation.status === "PENDING" && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     handleRevoke(
//                       invitation.email,
//                       invitation.id,
//                     )
//                   }
//                   disabled={revokingId === invitation.id}
//                   className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
//                 >
//                   {revokingId === invitation.id
//                     ? "Revoking..."
//                     : "REVOKED"}
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     )}

//     {/* Pagination - BOTTOM OF CARD */}
//     {totalPages > 1 && (
//       <div className="mt-6 flex items-center justify-between border-t pt-4">
//         <button
//           type="button"
//           onClick={() =>
//             setPage((currentPage) =>
//               Math.max(currentPage - 1, 1),
//             )
//           }
//           disabled={page === 1}
//           className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           Previous
//         </button>

//         <span className="text-sm text-gray-500">
//           Page {page} of {totalPages}
//         </span>

//         <button
//           type="button"
//           onClick={() =>
//             setPage((currentPage) =>
//               Math.min(
//                 currentPage + 1,
//                 totalPages,
//               ),
//             )
//           }
//           disabled={page === totalPages}
//           className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     )}
//   </div>
// );
// }



"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type InvitationStatus =
| "PENDING"
| "ACCEPTED"
| "REVOKED";

type Invitation = {
id: string;
email: string;
role: string;
status: InvitationStatus;
expiresAt: string;
createdAt: string;
};

type InvitationResponse = {
message: string;
invitations: Invitation[];
pagination: {
page: number;
limit: number;
total: number;
totalPages: number;
};
};

export default function InvitationStatusCard() {
const params = useParams();

const workspaceId = params.workspaceId as string;

const [invitations, setInvitations] = useState<Invitation[]>(
[],
);

const [page, setPage] = useState(1);
const [limit, setLimit] = useState(5);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);

const [isLoading, setIsLoading] = useState(true);
const [revokingId, setRevokingId] = useState<string | null>(
null,
);

const [error, setError] = useState("");

const fetchInvitations = async () => {
if (!workspaceId) return;


try {
  setIsLoading(true);
  setError("");

  const response = await fetch(
    `/api/workspace/${workspaceId}/invitation?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
  );

  const data: InvitationResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch invitations.",
    );
  }

  setInvitations(data.invitations);
  setTotalPages(data.pagination.totalPages);
  setTotal(data.pagination.total);
} catch (error) {
  console.error(
    "FETCH_INVITATIONS_ERROR:",
    error,
  );

  setError(
    error instanceof Error
      ? error.message
      : "Failed to fetch invitations.",
  );
} finally {
  setIsLoading(false);
}


};

useEffect(() => {
fetchInvitations();
}, [workspaceId, page, limit]);

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

const handleRevoke = async (
email: string,
invitationId: string,
) => {
try {
setRevokingId(invitationId);
setError("");

  const response = await fetch(
    `/api/workspace/${workspaceId}/invitation`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to revoke invitation.",
    );
  }

  setInvitations((currentInvitations) =>
    currentInvitations.map((invitation) =>
      invitation.id === invitationId
        ? {
            ...invitation,
            status: "REVOKED",
          }
        : invitation,
    ),
  );
} catch (error) {
  console.error(
    "REVOKE_INVITATION_ERROR:",
    error,
  );

  setError(
    error instanceof Error
      ? error.message
      : "Failed to revoke invitation.",
  );
} finally {
  setRevokingId(null);
}


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
         > <path d="M4 4h16v16H4z" /> <path d="m4 7 8 5 8-5" /> </svg> </div>


      <div>
        <h2
          className="text-xl font-medium tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Invitation status
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          View workspace invitations and manage their current status.
        </p>
      </div>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-6 p-6">
    {/* Top Controls */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">
          Invitations
        </p>

        {!isLoading && !error && (
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {total} invitation{total === 1 ? "" : "s"} in total
          </p>
        )}
      </div>

      <div className="w-full sm:w-32">
        <label
          htmlFor="invitation-limit"
          className="mb-2 block text-sm font-medium text-[var(--ink)]"
        >
          Per page
        </label>

        <select
          id="invitation-limit"
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

    {/* Loading */}
    {isLoading && (
      <div className="flex items-center justify-center rounded-xl bg-[var(--paper)] py-10">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mist)] border-t-[var(--indigo)]" />

          <p className="text-sm text-[var(--ink-soft)]">
            Loading invitations...
          </p>
        </div>
      </div>
    )}

    {/* Error */}
    {!isLoading && error && (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
        <span className="mt-0.5 text-[var(--coral)]">!</span>

        <p className="text-sm text-[var(--ink)]">
          {error}
        </p>
      </div>
    )}

    {/* Empty */}
    {!isLoading &&
      !error &&
      invitations.length === 0 && (
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
              <path d="M4 4h16v16H4z" />
              <path d="m4 7 8 5 8-5" />
            </svg>
          </div>

          <p className="mt-3 text-sm font-medium text-[var(--ink)]">
            No invitations found
          </p>

          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Invitations sent from this workspace will appear here.
          </p>
        </div>
      )}

    {/* Invitations */}
    {!isLoading &&
      !error &&
      invitations.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--mist)]">
          <div className="divide-y divide-[var(--mist)]">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-[var(--paper)] sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Invitation Details */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
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
                      <path d="M4 4h16v16H4z" />
                      <path d="m4 7 8 5 8-5" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">
                      {invitation.email}
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-[var(--ink-soft)]">
                      Role: {invitation.role}
                    </p>
                  </div>
                </div>

                {/* Status + Action */}
                <div className="flex items-center gap-3 sm:shrink-0">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      invitation.status === "PENDING"
                        ? "bg-[var(--amber)]/[0.12] text-[var(--amber-deep)]"
                        : invitation.status === "ACCEPTED"
                          ? "bg-[var(--sage)]/[0.12] text-[var(--sage)]"
                          : "bg-[var(--paper)] text-[var(--ink-soft)]"
                    }`}
                  >
                    {invitation.status}
                  </span>

                  {invitation.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRevoke(
                          invitation.email,
                          invitation.id,
                        )
                      }
                      disabled={
                        revokingId === invitation.id
                      }
                      className="rounded-xl border border-[var(--coral)]/40 px-3 py-1.5 text-xs font-medium text-[var(--coral)] transition-all hover:bg-[var(--coral)]/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {revokingId === invitation.id
                        ? "Revoking..."
                        : "Revoke"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* Pagination */}
    {!isLoading &&
      !error &&
      invitations.length > 0 &&
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
              {total} total invitation
              {total === 1 ? "" : "s"}
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
