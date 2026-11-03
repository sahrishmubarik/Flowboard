import { NextResponse } from "next/server";

import type { DbTransaction } from "@/db/types";
import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { validateData } from "@/lib/validations/workspace";
import {
  listNotificationsValidation,
  markAllNotificationsReadValidation,
  notificationIdValidation,
} from "@/lib/validations/notification";
import { boardMemberRepo } from "@/repositories/boardMemberRepo";
import {
  NotificationRepo,
  type NotificationCursor,
} from "@/repositories/notificationRepo";

export const NOTIFICATION_TYPES = [
  "CARD_ASSIGNED",
  "COMMIT_CREATED",
  "SPRINT_CREATED",
  "CARD_MOVED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationEvent = {
  type: NotificationType;
  actorId: string;
  workspaceId: string;
  boardId: string;
  cardId?: string | null;
  sprintId?: string | null;
  commitId?: string | null;
  // The audit_logs entry for the same action (prevents duplicates).
  sourceEventId?: string | null;
  // Snapshot used for the message text, e.g. { cardTitle, toListName }.
  details: Record<string, unknown>;
};

// Creates one notification per recipient. Only active board members are
// notified, never the person who performed the action.
async function createForRecipients(
  event: NotificationEvent,
  candidateIds: (string | null | undefined)[],
  activeMemberIds: string[],
  tx: DbTransaction,
) {
  const active = new Set(activeMemberIds);

  const recipientIds = [...new Set(candidateIds)].filter(
    (id): id is string => !!id && id !== event.actorId && active.has(id),
  );

  return NotificationRepo.createMany(
    recipientIds.map((recipientId) => ({
      recipientId,
      actorId: event.actorId,
      type: event.type,
      workspaceId: event.workspaceId,
      boardId: event.boardId,
      cardId: event.cardId ?? null,
      sprintId: event.sprintId ?? null,
      commitId: event.commitId ?? null,
      sourceEventId: event.sourceEventId ?? null,
      details: event.details,
    })),
    tx,
  );
}

export const NotificationService = {
  // Notify specific users, e.g. a card's assignee.
  async notifyUsers(
    event: NotificationEvent,
    userIds: (string | null | undefined)[],
    tx: DbTransaction,
  ) {
    const activeMemberIds = await boardMemberRepo.getActiveMemberIds(
      event.boardId,
      tx,
    );

    return createForRecipients(event, userIds, activeMemberIds, tx);
  },

  // Notify every active member of the board, e.g. new sprint or card move.
  async notifyBoardMembers(event: NotificationEvent, tx: DbTransaction) {
    const memberIds = await boardMemberRepo.getActiveMemberIds(
      event.boardId,
      tx,
    );

    return createForRecipients(event, memberIds, memberIds, tx);
  },
};

/* ---------------------------------------------------------------------- */
/* API: the signed-in user's own notifications                            */
/* ---------------------------------------------------------------------- */

async function requireUserId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  return user.userId;
}

// The page marker is "<createdAt ISO>|<id>", base64url-encoded.
function encodeCursor(cursor: NotificationCursor) {
  return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`).toString(
    "base64url",
  );
}

function decodeCursor(value: string): NotificationCursor {
  const [createdAt, id] = Buffer.from(value, "base64url")
    .toString("utf8")
    .split("|");
  const date = new Date(createdAt ?? "");

  if (
    Number.isNaN(date.getTime()) ||
    !notificationIdValidation.safeParse(id).success
  ) {
    throw new AppError("Invalid cursor.", 400);
  }

  return { createdAt: date, id };
}

export async function getMyNotifications(searchParams: URLSearchParams) {
  const userId = await requireUserId();

  const validation = validateData(listNotificationsValidation, {
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    unread: searchParams.get("unread") ?? undefined,
  });

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { limit, cursor, unread } = validation.data;

  const [page, unreadCount] = await Promise.all([
    NotificationRepo.listForUser(
      userId,
      limit,
      cursor ? decodeCursor(cursor) : undefined,
      unread,
    ),
    NotificationRepo.countUnread(userId),
  ]);

  return NextResponse.json(
    {
      message: "Notifications fetched successfully",
      notifications: page.notifications,
      nextCursor: page.nextCursor ? encodeCursor(page.nextCursor) : null,
      unreadCount,
    },
    { status: 200 },
  );
}

export async function getMyUnreadCount() {
  const userId = await requireUserId();
  const unreadCount = await NotificationRepo.countUnread(userId);

  return NextResponse.json({ unreadCount }, { status: 200 });
}

export async function markNotificationRead(notificationId: string) {
  const userId = await requireUserId();

  const validation = validateData(notificationIdValidation, notificationId);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const notification = await NotificationRepo.markRead(validation.data, userId);

  // Someone else's notification looks the same as a missing one.
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return NextResponse.json(
    { message: "Notification marked as read", notification },
    { status: 200 },
  );
}

export async function markAllNotificationsRead(body: unknown) {
  const userId = await requireUserId();

  const validation = validateData(markAllNotificationsReadValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const updated = await NotificationRepo.markAllRead(
    userId,
    new Date(validation.data.before),
  );

  return NextResponse.json(
    { message: "Notifications marked as read", updated },
    { status: 200 },
  );
}
