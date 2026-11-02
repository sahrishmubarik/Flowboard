"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Columns3,
  GitCommitHorizontal,
  History,
  KanbanSquare,
  Mail,
  StickyNote,
  Users,
} from "lucide-react";

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

type BoardList = {
  id: string;
  listName: string;
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
  details: Record<string, unknown> | null;
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

/* -------------------------------------------------------------------------- */
/* Describing an activity                                                     */
/* -------------------------------------------------------------------------- */

type Description = {
  // "created card", "moved a card"…
  text: string;
  // Name shown in bold after the text, e.g. the card title.
  target?: string;
  // Old and new value, shown as "from → to".
  from?: string;
  to?: string;
};

function formatAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}

function readString(details: Activity["details"], key: string) {
  const value = details?.[key];

  return typeof value === "string" && value.trim() ? value : undefined;
}

// Turns a stored old/new value into short readable text. `asLabel` is for
// fixed choices (priority, type, status): "in_progress" -> "In progress".
// Names people typed are shown as they are, so "Task" -> "task" stays visible.
function formatValue(value: unknown, asLabel = false): string {
  if (value === null || value === undefined || value === "") return "none";

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value !== "string") return "updated";

  // Dates are stored as ISO strings.
  if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(value)) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { dateStyle: "medium" });
    }
  }

  if (asLabel) {
    const words = value.replaceAll("_", " ").toLowerCase();

    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  return value.length > 40 ? `${value.slice(0, 40)}…` : value;
}

function change(details: Activity["details"], asLabel = false) {
  return {
    from: formatValue(details?.previousValue, asLabel),
    to: formatValue(details?.newValue, asLabel),
  };
}

// Card field changes: label in the sentence, and whether the values are
// fixed choices.
const CARD_FIELDS: Record<string, { label: string; asLabel: boolean }> = {
  CARD_PRIORITY_UPDATED: { label: "priority", asLabel: true },
  CARD_TASK_TYPE_UPDATED: { label: "type", asLabel: true },
  CARD_START_DATE_UPDATED: { label: "start date", asLabel: false },
  CARD_DUE_DATE_UPDATED: { label: "due date", asLabel: false },
  CARD_ESTIMATE_TIME_UPDATED: { label: "estimated time", asLabel: false },
  CARD_SPENT_TIME_UPDATED: { label: "spent time", asLabel: false },
};

function describe(
  activity: Activity,
  listNames: Map<string, string>,
): Description {
  const { action, details } = activity;
  const listName = (key: string) => {
    const id = readString(details, key);

    return id ? listNames.get(id) ?? "a deleted list" : undefined;
  };

  switch (action) {
    case "CARD_CREATED":
      return { text: "created card", target: readString(details, "title") };
    case "CARD_DELETED":
      return { text: "deleted card", target: readString(details, "title") };
    case "CARD_MOVED": {
      const from = listName("previousListId");
      const to = listName("newListId");

      return from && to && from === to
        ? { text: "reordered a card in", target: to }
        : { text: "moved a card", from, to };
    }
    case "CARD_TITLE_UPDATED":
      return { text: "renamed a card", ...change(details) };
    case "CARD_DESCRIPTION_UPDATED":
      return { text: "updated a card's description" };
    case "CARD_ASSIGNED":
    case "CARD_ASSIGNEE_UPDATED":
      return { text: "changed a card's assignee" };
    case "CARD_SPRINT_UPDATED":
      return { text: "moved a card to another sprint" };
    case "SPRINT_CREATED":
      return { text: "created sprint", target: readString(details, "sprintName") };
    case "SPRINT_DELETED":
      return { text: "deleted sprint", target: readString(details, "sprintName") };
    case "SPRINT_STATUS_UPDATED":
      return {
        text: "changed the status of sprint",
        target: readString(details, "sprintName"),
        from: formatValue(details?.previousStatus, true),
        to: formatValue(details?.newStatus, true),
      };
    case "SPRINT_UPDATED":
      return { text: "updated a sprint" };
    case "BOARD_LIST_CREATED":
      return { text: "added list", target: readString(details, "listName") };
    case "BOARD_LIST_DELETED":
      return { text: "deleted list", target: readString(details, "listName") };
    case "BOARD_LIST_UPDATED":
      return { text: "renamed a list", ...change(details) };
    case "BOARD_CREATED":
      return { text: "created board", target: readString(details, "boardName") };
    case "BOARD_DELETED":
      return { text: "deleted board", target: readString(details, "boardName") };
    case "BOARD_UPDATED":
      return { text: "renamed the board", ...change(details) };
    case "COMMIT_CREATED":
      return { text: "added a commit" };
    case "COMMIT_UPDATED":
      return { text: "edited a commit" };
    case "COMMIT_DELETED":
      return { text: "deleted a commit" };
  }

  const field = CARD_FIELDS[action];

  if (field) {
    return {
      text: `changed a card's ${field.label}`,
      ...change(details, field.asLabel),
    };
  }

  return { text: formatAction(action) };
}

/* -------------------------------------------------------------------------- */
/* Look                                                                       */
/* -------------------------------------------------------------------------- */

const ENTITY_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  card: StickyNote,
  board_list: Columns3,
  sprint: CalendarRange,
  commit: GitCommitHorizontal,
  board: KanbanSquare,
  workspace: Building2,
  workspace_invitation: Mail,
  workspace_member: Users,
};

// Colour of the timeline dot by what happened.
function toneFor(action: string) {
  if (action.endsWith("_CREATED") || action.endsWith("_ACCEPTED")) {
    return "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]";
  }

  if (
    action.endsWith("_DELETED") ||
    action.endsWith("_REVOKED") ||
    action.endsWith("_REMOVED")
  ) {
    return "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]";
  }

  if (action.endsWith("_MOVED")) {
    return "bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]";
  }

  return "bg-[var(--color-tag-purple-bg)] text-[var(--color-tag-purple-text)]";
}

const AVATAR_TONES = [
  "bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)]",
  "bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)]",
  "bg-[var(--color-tag-purple-bg)] text-[var(--color-tag-purple-text)]",
  "bg-[var(--color-tag-yellow-bg)] text-[var(--color-tag-yellow-text)]",
  "bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)]",
];

// The same person always gets the same avatar colour.
function avatarTone(key: string) {
  let hash = 0;

  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(time: number) {
  const date = new Date(time);

  date.setHours(0, 0, 0, 0);

  return date.getTime();
}

function dayLabel(date: Date, now: number) {
  const days = Math.round((startOfDay(now) - startOfDay(date.getTime())) / DAY_MS);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(new Date(now).getFullYear() !== date.getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}

function relativeTime(date: Date, now: number) {
  const minutes = Math.floor((now - date.getTime()) / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ago`;

  return date.toLocaleTimeString(undefined, { timeStyle: "short" });
}

// Splits the page into days, newest first, keeping the API order.
function groupByDay(activities: Activity[], now: number) {
  const groups: { label: string; items: Activity[] }[] = [];

  for (const activity of activities) {
    const date = new Date(activity.createdAt);
    const label = Number.isNaN(date.getTime()) ? "Unknown date" : dayLabel(date, now);
    const last = groups[groups.length - 1];

    if (last?.label === label) last.items.push(activity);
    else groups.push({ label, items: [activity] });
  }

  return groups;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

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

  // When the page was loaded; relative times ("5m ago") count from here.
  const [loadedAt, setLoadedAt] = useState(0);

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
        setLoadedAt(Date.now());
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

  // List names, so a move reads "To Do → Done" instead of two ids. Same query
  // as the card page, so it is shared from the cache.
  const { data: boardLists = [] } = useQuery<BoardList[]>({
    queryKey: ["board-lists", workspaceId, selectedBoardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${selectedBoardId}/boardList`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to fetch board lists.");
      }

      return result.boardLists ?? result.lists ?? [];
    },
    enabled: Boolean(workspaceId && selectedBoardId),
  });

  const listNames = new Map(boardLists.map((list) => [list.id, list.listName]));
  const selectedBoard = boards.find((board) => board.id === selectedBoardId);
  const firstShown = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastShown = Math.min(page * limit, total);

  const selectClass =
    "cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] text-sm text-[var(--color-text-primary)] outline-none transition-colors hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60";

  const pageButtonClass =
    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-primary)]";

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          >
            <KanbanSquare size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <label
              htmlFor="activity-board"
              className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              Board
            </label>
            <select
              id="activity-board"
              value={selectedBoardId}
              disabled={loadingBoards || boards.length === 0}
              onChange={(event) => {
                setSelectedBoardId(event.target.value);
                setPage(1);
              }}
              className={`${selectClass} mt-1 w-full max-w-xs px-3 py-2 font-medium`}
            >
              {boards.length === 0 && (
                <option value="">
                  {loadingBoards ? "Loading boards…" : "No boards available"}
                </option>
              )}

              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.boardName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!loadingBoards && !error && boards.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-app-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
              <History size={13} aria-hidden="true" />
              {total} {total === 1 ? "event" : "events"}
            </span>
          )}

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            Show
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Activities per page"
              className={`${selectClass} px-2.5 py-1.5`}
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

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-xl)] bg-[var(--color-tag-red-bg)] px-5 py-4 text-sm text-[var(--color-text-primary)]"
        >
          {error}
        </div>
      )}

      {/* Timeline */}
      {!error && (
        <section
          aria-labelledby="activity-feed-heading"
          className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2
                id="activity-feed-heading"
                className="text-base font-semibold text-[var(--color-text-primary)]"
              >
                Timeline
              </h2>
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                {selectedBoard
                  ? `Everything that happened on ${selectedBoard.boardName}, newest first.`
                  : "Everything that happened on your boards, newest first."}
              </p>
            </div>
          </div>

          {loadingBoards || loadingActivities ? (
            <TimelineSkeleton rows={Math.min(limit, 5)} />
          ) : boards.length === 0 ? (
            <EmptyState
              title="No boards yet"
              text="Create a board in this workspace and its activity will appear here."
            />
          ) : activities.length === 0 ? (
            <EmptyState
              title="Nothing has happened yet"
              text="Create cards, lists or sprints on this board and every change will show up here."
            />
          ) : (
            <div className="px-5 py-5 sm:px-6">
              {groupByDay(activities, loadedAt).map((group) => (
                <div key={group.label} className="mb-6 last:mb-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {group.label}
                  </p>

                  <ol className="relative">
                    {group.items.map((activity, index) => (
                      <TimelineItem
                        key={activity.id}
                        activity={activity}
                        description={describe(activity, listNames)}
                        isLast={index === group.items.length - 1}
                        now={loadedAt}
                      />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loadingBoards && !loadingActivities && activities.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-app-bg)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Showing{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {firstShown}–{lastShown}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {total}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className={pageButtonClass}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                <span className="min-w-[96px] text-center text-sm font-medium text-[var(--color-text-primary)]">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className={pageButtonClass}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TimelineItem({
  activity,
  description,
  isLast,
  now,
}: {
  activity: Activity;
  description: Description;
  isLast: boolean;
  now: number;
}) {
  const Icon = ENTITY_ICONS[activity.entityType] ?? History;
  const name = activity.performerName || "Unknown user";
  const date = new Date(activity.createdAt);
  const validDate = !Number.isNaN(date.getTime());
  const hasChange = Boolean(description.from || description.to);

  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {/* Line connecting the dots */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-10 bottom-0 w-px bg-[var(--color-border)]"
        />
      )}

      <span
        aria-hidden="true"
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-[var(--color-card-bg)] ${toneFor(activity.action)}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1 rounded-[var(--radius-lg)] px-3 py-2 transition-colors hover:bg-[var(--color-app-bg)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="min-w-0 text-sm leading-6 text-[var(--color-text-secondary)]">
            <span
              aria-hidden="true"
              className={`mr-2 inline-flex h-6 w-6 translate-y-[-1px] items-center justify-center rounded-full align-middle text-[11px] font-semibold ${avatarTone(
                activity.performedBy ?? name,
              )}`}
            >
              {name.charAt(0).toUpperCase()}
            </span>
            <span
              className="font-semibold text-[var(--color-text-primary)]"
              title={activity.performerEmail ?? undefined}
            >
              {name}
            </span>{" "}
            {description.text}
            {description.target && (
              <>
                {" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {description.target}
                </span>
              </>
            )}
          </p>

          {validDate && (
            <time
              dateTime={activity.createdAt}
              title={date.toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
              className="shrink-0 whitespace-nowrap text-xs text-[var(--color-text-muted)] sm:pt-1"
            >
              {relativeTime(date, now)}
            </time>
          )}
        </div>

        {hasChange && (
          <div className="mt-2 flex flex-wrap items-center gap-2 pl-8 text-xs">
            <span className="max-w-[220px] truncate rounded-md bg-[var(--color-tag-neutral-bg)] px-2 py-1 text-[var(--color-tag-neutral-text)] line-through decoration-1">
              {description.from ?? "none"}
            </span>
            <ArrowRight
              size={13}
              aria-hidden="true"
              className="shrink-0 text-[var(--color-text-muted)]"
            />
            <span className="max-w-[220px] truncate rounded-md bg-[var(--color-primary-soft)] px-2 py-1 font-medium text-[var(--color-primary)]">
              {description.to ?? "none"}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

function TimelineSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-busy="true" aria-label="Loading activity" className="space-y-5 px-5 py-6 sm:px-6">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse gap-4">
          <span className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-border)]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-2/3 rounded bg-[var(--color-border)]" />
            <div className="h-3 w-1/4 rounded bg-[var(--color-border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-app-bg)] text-[var(--color-text-muted)]"
      >
        <History size={22} />
      </span>
      <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {text}
      </p>
    </div>
  );
}
