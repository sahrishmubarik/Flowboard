"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  details: Record<string, unknown>;
  workspaceId: string;
  boardId: string;
  cardId: string | null;
  sprintId: string | null;
  readAt: string | null;
  createdAt: string;
  actorName: string | null;
};

type NotificationPage = {
  notifications: NotificationItem[];
  nextCursor: string | null;
  unreadCount: number;
};

type UnreadCount = { unreadCount: number };

const UNREAD_KEY = ["notifications", "unread-count"];
const LIST_KEY = ["notifications", "list"];

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Something went wrong.");
  }

  return data as T;
}

// Short, friendly text: "Ali moved #12 Login page to Testing".
function describe(notification: NotificationItem) {
  const details = notification.details;
  const actor = notification.actorName ?? "Someone";
  const title = typeof details.cardTitle === "string" ? details.cardTitle : "";
  const card = details.cardNumber
    ? `#${details.cardNumber} ${title}`.trim()
    : title || "a ticket";

  switch (notification.type) {
    case "CARD_ASSIGNED":
      return { actor, text: "assigned a new ticket to you", detail: card };
    case "COMMIT_CREATED":
      return { actor, text: `commented on ${card}` };
    case "SPRINT_CREATED":
      return {
        actor,
        text: "created a new sprint",
        detail:
          typeof details.sprintName === "string" ? details.sprintName : "",
      };
    case "CARD_MOVED":
      return {
        actor,
        text: `moved ${card} to ${
          typeof details.toListName === "string"
            ? details.toListName
            : "another list"
        }`,
      };
    default:
      return { actor, text: "sent you a notification" };
  }
}

function getLink(notification: NotificationItem) {
  const board = `/dashboard/workspace/${notification.workspaceId}/board/${notification.boardId}`;

  return notification.cardId ? `${board}/card/${notification.cardId}` : board;
}

export default function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Polled so new notifications appear within about 30 seconds.
  const unreadQuery = useQuery<UnreadCount>({
    queryKey: UNREAD_KEY,
    queryFn: () => request<UnreadCount>("/api/notifications/unread-count"),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const listQuery = useInfiniteQuery({
    queryKey: LIST_KEY,
    enabled: isOpen,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const page = await request<NotificationPage>(
        // Read notifications are not listed; the bell shows what's new.
        `/api/notifications?unread=true&limit=20${
          pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""
        }`,
      );

      // Keep the badge in sync with the freshly loaded list.
      queryClient.setQueryData<UnreadCount>(UNREAD_KEY, {
        unreadCount: page.unreadCount,
      });

      return page;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const notifications =
    listQuery.data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: UNREAD_KEY }),
      queryClient.invalidateQueries({ queryKey: LIST_KEY }),
    ]);

  // Read notifications leave the list right away; the server result
  // follows on refresh.
  const markLocallyAsRead = (ids: Set<string> | "all") => {
    let changed = 0;

    queryClient.setQueryData<InfiniteData<NotificationPage>>(
      LIST_KEY,
      (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            notifications: page.notifications.filter((item) => {
              if (item.readAt || (ids !== "all" && !ids.has(item.id))) {
                return true;
              }
              changed += 1;
              return false;
            }),
          })),
        },
    );

    queryClient.setQueryData<UnreadCount>(UNREAD_KEY, (data) =>
      data
        ? {
            unreadCount:
              ids === "all" ? 0 : Math.max(0, data.unreadCount - changed),
          }
        : data,
    );
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      request(`/api/notifications/${id}`, { method: "PATCH" }),
    onMutate: (id) => markLocallyAsRead(new Set([id])),
    onSettled: refresh,
  });

  const markAllMutation = useMutation({
    // `before` is the newest loaded notification's server time, so one that
    // arrives while the list is open is not marked as read unseen.
    mutationFn: (before: string) =>
      request("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ before }),
      }),
    onMutate: () => markLocallyAsRead("all"),
    onSettled: refresh,
  });

  // Close on outside click or Escape.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const openNotification = (notification: NotificationItem) => {
    if (!notification.readAt) markReadMutation.mutate(notification.id);
    setIsOpen(false);
    router.push(getLink(notification));
  };

  const hasUnread = notifications.some((item) => !item.readAt);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <Bell size={17} />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-priority-high)] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[var(--color-card-bg)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Notifications
            </h2>

            <button
              type="button"
              onClick={() => {
                if (notifications[0]) {
                  markAllMutation.mutate(notifications[0].createdAt);
                }
              }}
              disabled={!hasUnread || markAllMutation.isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {listQuery.isLoading ? (
              <ul aria-label="Loading notifications" className="space-y-3 p-4">
                {[0, 1, 2].map((row) => (
                  <li key={row} className="flex animate-pulse gap-3">
                    <span className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-column-bg)]" />
                    <span className="flex-1 space-y-2 pt-1">
                      <span className="block h-3 w-4/5 rounded bg-[var(--color-column-bg)]" />
                      <span className="block h-3 w-1/3 rounded bg-[var(--color-column-bg)]" />
                    </span>
                  </li>
                ))}
              </ul>
            ) : listQuery.isError ? (
              <div className="space-y-3 px-4 py-6 text-center text-sm">
                <p className="text-[var(--color-tag-red-text)]">
                  {listQuery.error.message}
                </p>
                <button
                  type="button"
                  onClick={() => listQuery.refetch()}
                  className="cursor-pointer rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-card-hover)]"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell size={22} className="text-[var(--color-text-muted)]" />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  You&apos;re all caught up
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  New activity on your boards will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {notifications.map((notification) => {
                  const { actor, text, detail } = describe(notification);
                  const isUnread = !notification.readAt;

                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-card-hover)] ${
                          isUnread ? "bg-[var(--color-primary-active-bg)]" : ""
                        }`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-tag-neutral-bg)] text-xs font-semibold text-[var(--color-tag-neutral-text)]">
                          {actor.charAt(0).toUpperCase()}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm leading-5 ${
                              isUnread
                                ? "text-[var(--color-text-primary)]"
                                : "text-[var(--color-text-secondary)]"
                            }`}
                          >
                            <strong className="font-semibold">{actor}</strong>{" "}
                            {text}
                          </span>

                          {detail && (
                            <span className="mt-0.5 block truncate text-xs text-[var(--color-text-secondary)]">
                              {detail}
                            </span>
                          )}

                          <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                            {formatDistanceToNowStrict(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </span>
                        </span>

                        {isUnread && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {listQuery.hasNextPage && (
              <div className="border-t border-[var(--color-border)] p-2">
                <button
                  type="button"
                  onClick={() => listQuery.fetchNextPage()}
                  disabled={listQuery.isFetchingNextPage}
                  className="w-full cursor-pointer rounded-md py-2 text-xs font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-active-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {listQuery.isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
