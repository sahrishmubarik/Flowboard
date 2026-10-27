import { db } from "@/db";
import { notifications } from "@/db/notificationSchema";
import { boardMembers } from "@/db/boardSchema";
import { users } from "@/db/authSchema";
import type { DbTransaction } from "@/db/types";
import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";

export type CreateNotificationInput = typeof notifications.$inferInsert;

export type NotificationCursor = {
  createdAt: Date;
  id: string;
};

// Only show notifications for boards the user is still an active member of.
const activeMembershipJoin = and(
  eq(boardMembers.boardId, notifications.boardId),
  eq(boardMembers.userId, notifications.recipientId),
  eq(boardMembers.status, "ACTIVE"),
);

export const NotificationRepo = {
  async createMany(inputs: CreateNotificationInput[], tx?: DbTransaction) {
    if (inputs.length === 0) return [];

    const executor = tx ?? db;

    // The unique (source_event_id, recipient_id) index makes a repeated
    // event a no-op instead of a duplicate notification.
    return executor
      .insert(notifications)
      .values(inputs)
      .onConflictDoNothing({
        target: [notifications.sourceEventId, notifications.recipientId],
      })
      .returning();
  },

  async listForUser(
    userId: string,
    limit: number,
    cursor?: NotificationCursor,
  ) {
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        details: notifications.details,
        workspaceId: notifications.workspaceId,
        boardId: notifications.boardId,
        cardId: notifications.cardId,
        sprintId: notifications.sprintId,
        commitId: notifications.commitId,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
        actorName: users.name,
      })
      .from(notifications)
      .innerJoin(boardMembers, activeMembershipJoin)
      .leftJoin(users, eq(users.id, notifications.actorId))
      .where(
        and(
          eq(notifications.recipientId, userId),
          cursor
            ? or(
                lt(notifications.createdAt, cursor.createdAt),
                and(
                  eq(notifications.createdAt, cursor.createdAt),
                  lt(notifications.id, cursor.id),
                ),
              )
            : undefined,
        ),
      )
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const last = items[items.length - 1];

    return {
      notifications: items,
      nextCursor:
        hasMore && last ? { createdAt: last.createdAt, id: last.id } : null,
    };
  },

  async countUnread(userId: string) {
    const [result] = await db
      .select({ unread: count() })
      .from(notifications)
      .innerJoin(boardMembers, activeMembershipJoin)
      .where(
        and(
          eq(notifications.recipientId, userId),
          isNull(notifications.readAt),
        ),
      );

    return Number(result?.unread ?? 0);
  },

  // Returns null when the notification does not belong to the user.
  async markRead(notificationId: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ readAt: sql`coalesce(${notifications.readAt}, now())` })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, userId),
        ),
      )
      .returning({
        id: notifications.id,
        readAt: notifications.readAt,
      });

    return updated ?? null;
  },

  // `before` stops notifications that arrived after the list was loaded
  // from being marked as read unseen. Like the list and count, only
  // boards the user is still an active member of are affected.
  async markAllRead(userId: string, before: Date) {
    const activeBoardIds = db
      .select({ boardId: boardMembers.boardId })
      .from(boardMembers)
      .where(
        and(
          eq(boardMembers.userId, userId),
          eq(boardMembers.status, "ACTIVE"),
        ),
      );

    const updated = await db
      .update(notifications)
      .set({ readAt: sql`now()` })
      .where(
        and(
          eq(notifications.recipientId, userId),
          isNull(notifications.readAt),
          lte(notifications.createdAt, before),
          inArray(notifications.boardId, activeBoardIds),
        ),
      )
      .returning({ id: notifications.id });

    return updated.length;
  },
};
