
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

  // User can change this from dropdown
  const [limit, setLimit] = useState(5);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [revokingId, setRevokingId] = useState<string | null>(
    null,
  );

  const [error, setError] = useState("");

  const fetchInvitations = async () => {
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

      console.log("INVITATION API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch invitations",
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
          : "Failed to fetch invitations",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;

    fetchInvitations();
  }, [workspaceId, page, limit]);

  const handleLimitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newLimit = Number(event.target.value);

    setLimit(newLimit);

    // Jab limit change ho to first page par wapis
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
          data.message || "Failed to revoke invitation",
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
          : "Failed to revoke invitation",
      );
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6">
        Loading invitations...
      </div>
    );
  }

  return (
  <div className="rounded-lg border p-6">
    {/* Header */}
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-semibold">
          Invitations
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View workspace invitations and their current status.
        </p>
      </div>

      {/* Records dropdown - TOP RIGHT */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          Show
        </span>

        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 text-sm outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="mb-4 rounded-md border border-red-200 p-3 text-sm text-red-600">
        {error}
      </div>
    )}

    {/* Invitations */}
    {invitations.length === 0 ? (
      <p className="text-sm text-gray-500">
        No invitations found.
      </p>
    ) : (
      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-medium">
                {invitation.email}
              </p>

              <p className="text-sm text-gray-500">
                Role: {invitation.role}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  invitation.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : invitation.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
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
                  disabled={revokingId === invitation.id}
                  className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
                >
                  {revokingId === invitation.id
                    ? "Revoking..."
                    : "REVOKED"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Pagination - BOTTOM OF CARD */}
    {totalPages > 1 && (
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <button
          type="button"
          onClick={() =>
            setPage((currentPage) =>
              Math.max(currentPage - 1, 1),
            )
          }
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
          onClick={() =>
            setPage((currentPage) =>
              Math.min(
                currentPage + 1,
                totalPages,
              ),
            )
          }
          disabled={page === totalPages}
          className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);
}