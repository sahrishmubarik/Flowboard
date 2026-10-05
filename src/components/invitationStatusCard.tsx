"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED";

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

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;

    async function loadInvitations() {
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/invitation?page=${page}&limit=${limit}`,
          {
            method: "GET",
          },
        );

        const data: InvitationResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch invitations.");
        }

        if (cancelled) return;

        setInvitations(data.invitations);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
        setError("");
      } catch (error) {
        if (cancelled) return;

        console.error("FETCH_INVITATIONS_ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch invitations.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, page, limit]);
  // const fetchInvitations = async () => {
  //   if (!workspaceId) return;

  //   try {
  //     setIsLoading(true);
  //     setError("");

  //     const response = await fetch(
  //       `/api/workspace/${workspaceId}/invitation?page=${page}&limit=${limit}`,
  //       {
  //         method: "GET",
  //       },
  //     );

  //     const data: InvitationResponse = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to fetch invitations.");
  //     }

  //     setInvitations(data.invitations);
  //     setTotalPages(data.pagination.totalPages);
  //     setTotal(data.pagination.total);
  //   } catch (error) {
  //     console.error("FETCH_INVITATIONS_ERROR:", error);

  //     setError(
  //       error instanceof Error ? error.message : "Failed to fetch invitations.",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchInvitations();
  // }, [workspaceId, page, limit]);

  // const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setLimit(Number(event.target.value));
  //   setPage(1);
  // };
  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoading(true);
    setError("");
    setLimit(Number(event.target.value));
    setPage(1);
  };

  // const handlePrevious = () => {
  //   setPage((currentPage) => Math.max(currentPage - 1, 1));
  // };
  const handlePrevious = () => {
    setIsLoading(true);
    setError("");

    setPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  // const handleNext = () => {
  //   setPage((currentPage) => Math.min(currentPage + 1, totalPages));
  // };
  const handleNext = () => {
    setIsLoading(true);
    setError("");

    setPage((currentPage) => Math.min(currentPage + 1, totalPages));
  };

  const handleRevoke = async (email: string, invitationId: string) => {
    try {
      setRevokingId(invitationId);
      setError("");

      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to revoke invitation.");
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
      console.error("REVOKE_INVITATION_ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Failed to revoke invitation.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusStyle = (status: InvitationStatus) => {
    if (status === "ACCEPTED") {
      return {
        backgroundColor: "var(--color-tag-green-bg)",
        color: "var(--color-tag-green-text)",
      };
    }

    if (status === "REVOKED") {
      return {
        backgroundColor: "var(--color-tag-red-bg)",
        color: "var(--color-tag-red-text)",
      };
    }

    return {
      backgroundColor: "var(--color-tag-neutral-bg)",
      color: "var(--color-tag-neutral-text)",
    };
  };

  return (
    <section
      className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-sm"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-card-bg)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "var(--color-primary-active-bg)",
              color: "var(--color-primary)",
            }}
          >
            <svg
              width="20"
              height="20"
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

          <div>
            <h2
              className="text-xl font-medium tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Invitation status
            </h2>

            <p
              className="mt-1 text-sm leading-6"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
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
            <p
              className="text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              Invitations
            </p>

            {!isLoading && !error && (
              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                {total} invitation{total === 1 ? "" : "s"} in total
              </p>
            )}
          </div>

          <div className="w-full sm:w-32">
            <label
              htmlFor="invitation-limit"
              className="mb-2 block text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              Per page
            </label>

            <select
              id="invitation-limit"
              value={limit}
              onChange={handleLimitChange}
              className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-app-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="flex items-center justify-center rounded-xl py-10"
            style={{
              backgroundColor: "var(--color-app-bg)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2"
                style={{
                  borderColor: "var(--color-border)",
                  borderTopColor: "var(--color-primary)",
                }}
              />

              <p
                className="text-sm"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                Loading invitations...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              border: "1px solid var(--color-tag-red-text)",
              backgroundColor: "var(--color-tag-red-bg)",
            }}
          >
            <span
              className="mt-0.5"
              style={{
                color: "var(--color-priority-high)",
              }}
            >
              !
            </span>

            <p
              className="text-sm"
              style={{
                color: "var(--color-tag-red-text)",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && invitations.length === 0 && (
          <div
            className="rounded-xl px-4 py-10 text-center"
            style={{
              backgroundColor: "var(--color-app-bg)",
            }}
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--color-tag-neutral-bg)",
                color: "var(--color-text-muted)",
              }}
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
                <path d="M4 4h16v16H4z" />
                <path d="m4 7 8 5 8-5" />
              </svg>
            </div>

            <p
              className="mt-3 text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              No invitations found
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--color-text-muted)",
              }}
            >
              Invitations sent from this workspace will appear here.
            </p>
          </div>
        )}

        {/* Invitations */}
        {!isLoading && !error && invitations.length > 0 && (
          <div
            className="overflow-hidden rounded-xl"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="divide-y"
              style={{
                borderColor: "var(--color-border)",
              }}
            >
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-4 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    borderColor: "var(--color-border)",
                  }}
                >
                  {/* Invitation Details */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "var(--color-primary-active-bg)",
                        color: "var(--color-primary)",
                      }}
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
                        <path d="M4 4h16v16H4z" />
                        <path d="m4 7 8 5 8-5" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium"
                        style={{
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {invitation.email}
                      </p>

                      <p
                        className="mt-0.5 text-xs capitalize"
                        style={{
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Role: {invitation.role}
                      </p>
                    </div>
                  </div>

                  {/* Status + Action */}
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-medium"
                      style={getStatusStyle(invitation.status)}
                    >
                      {invitation.status}
                    </span>

                    {invitation.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRevoke(invitation.email, invitation.id)
                        }
                        disabled={revokingId === invitation.id}
                        className="rounded-xl px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          border: "1px solid var(--color-tag-red-text)",
                          backgroundColor: "var(--color-card-bg)",
                          color: "var(--color-tag-red-text)",
                        }}
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
        {!isLoading && !error && invitations.length > 0 && totalPages > 1 && (
          <div
            className="flex items-center justify-between gap-4 pt-5"
            style={{
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <button
              type="button"
              onClick={handlePrevious}
              disabled={page === 1}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              Previous
            </button>

            <div className="text-center">
              <p
                className="text-sm font-medium"
                style={{
                  color: "var(--color-text-primary)",
                }}
              >
                Page {page} of {totalPages}
              </p>

              <p
                className="mt-0.5 text-xs"
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                {total} total invitation
                {total === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={page === totalPages}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-card-bg)",
                color: "var(--color-text-primary)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
