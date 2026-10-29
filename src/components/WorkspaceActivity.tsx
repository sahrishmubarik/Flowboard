"use client";

import { useEffect, useState } from "react";

type Board = {
  id: string;
  boardName: string;
  organizationId: string;
  role?: string;
};

type BoardResponse = {
  message?: string;
  boards?: Board[];
};

type Activity = {
  id: string;
  performedBy: string | null;
  performerName: string | null;
  performerEmail: string | null;
  workspaceId: string;
  boardId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
};

type ActivityResponse = {
  message?: string;
  activities?: Activity[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Records per page the user can choose from.
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

type WorkspaceActivityProps = {
  workspaceId: string;
};

function formatAction(action: string) {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function WorkspaceActivity({
  workspaceId,
}: WorkspaceActivityProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [boardsLoading, setLoadingBoards] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [fetchError, setError] = useState("");

  // Without a workspace ID there is nothing to load, so derive that state
  // here instead of setting it synchronously inside the effect.
  const loadingBoards = workspaceId ? boardsLoading : false;
  const error = workspaceId ? fetchError : "Workspace ID is missing.";

  // Fetch boards belonging to this workspace.
  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;

    async function loadBoards() {
      setLoadingBoards(true);
      setError("");
      setBoards([]);
      setSelectedBoardId("");
      setActivities([]);
      setTotal(0);
      setTotalPages(0);

      try {
        const response = await fetch(`/api/workspace/${workspaceId}/board`, {
          cache: "no-store",
        });

        const data: BoardResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch boards.");
        }

        if (cancelled) return;

        const workspaceBoards = (data.boards ?? []).filter(
          (board) => board.organizationId === workspaceId,
        );

        setBoards(workspaceBoards);

        // Select the first available board by default.
        setSelectedBoardId(workspaceBoards[0]?.id ?? "");
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to fetch boards.",
        );
      } finally {
        if (!cancelled) setLoadingBoards(false);
      }
    }

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Fetch activity whenever the selected board or page changes.
  useEffect(() => {
    // Activities are cleared when the board list (re)loads, which is the only
    // time selectedBoardId becomes empty.
    if (!workspaceId || !selectedBoardId) return;

    let cancelled = false;

    async function loadActivities() {
      setLoadingActivities(true);
      setError("");

      try {
        const searchParams = new URLSearchParams({
          boardId: selectedBoardId,
          page: String(page),
          limit: String(limit),
        });

        const response = await fetch(
          `/api/workspace/${workspaceId}/activity?${searchParams.toString()}`,
          { cache: "no-store" },
        );

        const data: ActivityResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch activity.");
        }

        if (cancelled) return;

        setActivities(data.activities ?? []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 0);
      } catch (err) {
        if (cancelled) return;

        setActivities([]);
        setTotal(0);
        setTotalPages(0);
        setError(
          err instanceof Error ? err.message : "Failed to fetch activity.",
        );
      } finally {
        if (!cancelled) setLoadingActivities(false);
      }
    }

    void loadActivities();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, selectedBoardId, page, limit]);

  const fieldClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]";

  const buttonClass =
    "rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-app-bg)] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">

      <div className="space-y-5 p-6">
        {/* Board filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <label
              htmlFor="activity-board"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Filter by board
            </label>

            <select
              id="activity-board"
              value={selectedBoardId}
              disabled={loadingBoards || boards.length === 0}
              onChange={(event) => {
                setSelectedBoardId(event.target.value);
                setPage(1);
              }}
              className={fieldClass}
            >
              {boards.length === 0 && (
                <option value="">No boards available</option>
              )}

              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.boardName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {!loadingBoards && !loadingActivities && !error && (
              <p className="text-sm text-[var(--color-text-secondary)]">
                {total} {total === 1 ? "activity" : "activities"}
              </p>
            )}

            {/* Records per page */}
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              Show
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Activities per page"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              per page
            </label>
          </div>
        </div>

        {/* Loading boards */}
        {loadingBoards && (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            Loading boards...
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)]"
          >
            {error}
          </div>
        )}

        {/* No boards */}
        {!loadingBoards && !error && boards.length === 0 && (
          <div className="rounded-xl bg-[var(--color-app-bg)] px-4 py-10 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              No boards found
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              This workspace does not have any accessible boards.
            </p>
          </div>
        )}

        {/* Activity table */}
        {!loadingBoards && !error && boards.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-[var(--color-app-bg)]">
                <tr className="border-b border-[var(--color-border)]">
                  {["Activity", "Entity", "Performed by", "Date"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {loadingActivities ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]"
                    >
                      Loading activity...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]"
                    >
                      No activity recorded for this board yet.
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="align-top hover:bg-[var(--color-app-bg)]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {formatAction(activity.action)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[var(--color-tag-neutral-bg)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--color-tag-neutral-text)]">
                          {activity.entityType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {activity.performerName || "Unknown user"}
                        </p>
                        {activity.performerEmail && (
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {activity.performerEmail}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-text-muted)]">
                        {formatDate(activity.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loadingBoards &&
          !loadingActivities &&
          !error &&
          activities.length > 0 && (
            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className={buttonClass}
              >
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Page {page} of {totalPages}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {total} total activities
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className={buttonClass}
              >
                Next
              </button>
            </div>
          )}
      </div>
    </section>
  );
}
