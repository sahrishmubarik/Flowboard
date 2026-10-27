import type { DbTransaction } from "@/db/types";
import { boardMemberRepo } from "@/repositories/boardMemberRepo";
import { NotificationRepo } from "@/repositories/notificationRepo";

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

