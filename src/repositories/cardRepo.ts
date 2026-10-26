// import { db } from "@/db";
// import { sprint } from "@/db/boardSchema";
// import { card } from "@/db/cardSchema";
// import { users } from "@/db/authSchema";
// import { BoardRepo } from "@/repositories/boardRepo";
// import { AuditLogService } from "@/services/auditLogService";
// import { eq, and, max, asc, isNull, sql } from "drizzle-orm";
// import type { AuditLogTransaction } from "@/repositories/auditLogRepo";
// type CardDetailUpdate = {
//   title?: string;
//   description?: string | null;
//   taskType?: "bug" | "feature" | "task" | "tbd";
//   priority?: "normal" | "show stopper" | "critical" | "major" | "minor";
//   sprintId?: string[] | null;
//   estimateTime?: string | null;
//   spentTime?: string | null;
//   startDate?: Date | null;
//   dueDate?: Date | null;
//   assignedTo?: string | null;
//   updatedAt?: Date;
// };
// export const CardRepo = {
//   async createCard(
//     boardId: string,
//     title: string,
//     description: string,
//     startDate: string,
//     dueDate: string,
//     priority: string,
//     type: string,
//     sprintId: string[],
//     listId: string,
//     assigneeId: string,
//     user_id: string,
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const [numberResult] = await executor
//       .select({ maxCardNumber: max(card.cardNumber) })
//       .from(card)
//       .where(eq(card.boardId, boardId));

//     const nextCardNumber = Number(numberResult?.maxCardNumber ?? 0) + 1;

//     const [positionResult] = await executor
//       .select({ maxPosition: max(card.position) })
//       .from(card)
//       .where(eq(card.boardListId, listId));

//     const nextPosition = Number(positionResult?.maxPosition ?? 0) + 1;

//     const [newCard] = await executor
//       .insert(card)
//       .values({
//         boardId,
//         boardListId: listId,
//         sprintId,
//         cardNumber: nextCardNumber,
//         title,
//         description,
//         priority: priority as CardDetailUpdate["priority"],
//         taskType: type as CardDetailUpdate["taskType"],
//         position: nextPosition,
//         reporterId: user_id,
//         startDate: startDate ? new Date(startDate) : null,
//         dueDate: dueDate ? new Date(dueDate) : null,
//         assignedTo: assigneeId || null,
//       })
//       .returning();

//     return newCard;
//   },

//   async getBoardCardBySprintId(boardId: string, sprintId: string) {
//     return db
//       .select({
//         id: card.id,
//         boardId: card.boardId,
//         boardListId: card.boardListId,
//         sprintId: card.sprintId,
//         cardNumber: card.cardNumber,
//         title: card.title,
//         description: card.description,
//         startDate: card.startDate,
//         dueDate: card.dueDate,
//         priority: card.priority,
//         position: card.position,
//         reporterId: card.reporterId,
//         completedAt: card.completedAt,
//         assignedTo: card.assignedTo,
//         isArchived: card.isArchived,
//         createdAt: card.createdAt,
//         updatedAt: card.updatedAt,
//         deletedAt: card.deletedAt,
//       })
//       .from(card)
//       .where(
//         and(
//           eq(card.boardId, boardId),
//           sql`${sprintId}::uuid = ANY(${card.sprintId})`,
//         ),
//       );
//   },
//   async getCardSnapshot(
//     boardId: string,
//     cardId: string,
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const [cardSnapshot] = await executor
//       .select()
//       .from(card)
//       .where(
//         and(
//           eq(card.id, cardId),
//           eq(card.boardId, boardId),
//           isNull(card.deletedAt),
//         ),
//       )
//       .limit(1);

//     return cardSnapshot ?? null;
//   },
//   async getBoardCardDetail(boardId: string, cardId: string) {
//     const boardCardDetails = await db
//       .select({
//         id: card.id,
//         cardNumber: card.cardNumber,
//         title: card.title,
//         description: card.description,
//         priority: card.priority,
//         type: card.taskType,
//         startDate: card.startDate,
//         dueDate: card.dueDate,
//         completedAt: card.completedAt,
//         boardListId: card.boardListId,
//         sprintId: card.sprintId,
//         assignedTo: card.assignedTo,
//         sprintName: sprint.sprintName,
//         assigneeName: users.name,
//         estimateTime: card.estimateTime,
//         spentTime: card.spentTime,
//       })
//       .from(card)
//       .leftJoin(sprint, sql`${sprint.id} = ANY(${card.sprintId})`)
//       .leftJoin(users, eq(card.assignedTo, users.id))
//       .where(and(eq(card.boardId, boardId), eq(card.id, cardId)));

//     return boardCardDetails;
//   },

//   async getCardForMove(boardId: string, cardId: string) {
//     const [cardDetails] = await db
//       .select({
//         id: card.id,
//         boardId: card.boardId,
//         boardListId: card.boardListId,
//         position: card.position,
//       })
//       .from(card)
//       .where(
//         and(
//           eq(card.boardId, boardId),
//           eq(card.id, cardId),
//           isNull(card.deletedAt),
//         ),
//       )
//       .limit(1);

//     return cardDetails ?? null;
//   },

//   async moveCard(
//     boardId: string,
//     cardId: string,
//     destinationListId: string,
//     requestedPosition: number,
//     performedBy: string,
//   ) {
//     return db.transaction(async (tx) => {
//       const [movingCard] = await tx
//         .select({
//           id: card.id,
//           boardListId: card.boardListId,
//           position: card.position,
//         })
//         .from(card)
//         .where(
//           and(
//             eq(card.id, cardId),
//             eq(card.boardId, boardId),
//             isNull(card.deletedAt),
//           ),
//         )
//         .limit(1);

//       if (!movingCard) {
//         return null;
//       }

//       const sourceListId = movingCard.boardListId;
//       const sourcePosition = movingCard.position;
//       const sourceCards = await tx
//         .select({
//           id: card.id,
//           boardListId: card.boardListId,
//           position: card.position,
//         })
//         .from(card)
//         .where(
//           and(
//             eq(card.boardId, boardId),
//             eq(card.boardListId, sourceListId),
//             isNull(card.deletedAt),
//           ),
//         )
//         .orderBy(asc(card.position));

//       if (sourceListId === destinationListId) {
//         const reorderedCards = sourceCards.filter((item) => item.id !== cardId);

//         const targetIndex = Math.max(
//           0,
//           Math.min(requestedPosition - 1, reorderedCards.length),
//         );

//         reorderedCards.splice(targetIndex, 0, {
//           id: movingCard.id,
//           boardListId: sourceListId,
//           position: requestedPosition,
//         });

//         for (let index = 0; index < reorderedCards.length; index++) {
//           const item = reorderedCards[index];

//           await tx
//             .update(card)
//             .set({ position: index + 1 })
//             .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
//         }
//       } else {
//         const remainingSourceCards = sourceCards.filter(
//           (item) => item.id !== cardId,
//         );

//         const destinationCards = await tx
//           .select({
//             id: card.id,
//             boardListId: card.boardListId,
//             position: card.position,
//           })
//           .from(card)
//           .where(
//             and(
//               eq(card.boardId, boardId),
//               eq(card.boardListId, destinationListId),
//               isNull(card.deletedAt),
//             ),
//           )
//           .orderBy(asc(card.position));

//         const targetIndex = Math.max(
//           0,
//           Math.min(requestedPosition - 1, destinationCards.length),
//         );

//         destinationCards.splice(targetIndex, 0, {
//           id: movingCard.id,
//           boardListId: destinationListId,
//           position: requestedPosition,
//         });

//         for (let index = 0; index < remainingSourceCards.length; index++) {
//           const item = remainingSourceCards[index];

//           await tx
//             .update(card)
//             .set({ position: index + 1 })
//             .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
//         }

//         for (let index = 0; index < destinationCards.length; index++) {
//           const item = destinationCards[index];

//           await tx
//             .update(card)
//             .set({
//               boardListId: destinationListId,
//               position: index + 1,
//             })
//             .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
//         }
//       }

//       // const [updatedCard] = await tx
//       //   .select()
//       //   .from(card)
//       //   .where(and(eq(card.id, cardId), eq(card.boardId, boardId)))
//       //   .limit(1);

//       // return updatedCard ?? null;
//       const [updatedCard] = await tx
//         .select()
//         .from(card)
//         .where(and(eq(card.id, cardId), eq(card.boardId, boardId)))
//         .limit(1);

//       if (!updatedCard) {
//         return null;
//       }

//       const positionChanged =
//         sourceListId !== updatedCard.boardListId ||
//         sourcePosition !== updatedCard.position;

//       if (positionChanged) {
//         const boardDetails = await BoardRepo.findById(boardId, tx);

//         if (!boardDetails) {
//           throw new Error("Board not found while recording card movement");
//         }

//         await AuditLogService.record(
//           {
//             performedBy,
//             workspaceId: boardDetails.organizationId,
//             boardId,
//             entityType: "card",
//             entityId: cardId,
//             action: "CARD_MOVED",
//             details: {
//               previousListId: sourceListId,
//               newListId: updatedCard.boardListId,
//               previousPosition: sourcePosition,
//               newPosition: updatedCard.position,
//             },
//           },
//           tx,
//         );
//       }

//       return updatedCard;
//       // if (
//       //         updatedCard &&
//       //         (sourceListId !== destinationListId ||
//       //           sourcePosition !== updatedCard.position)
//       //       ) {
//       //         const boardDetails = await BoardRepo.findById(boardId, tx);

//       //         await AuditLogService.record(
//       //           {
//       //             performedBy,
//       //             workspaceId: boardDetails.organizationId,
//       //             boardId,
//       //             entityType: "card",
//       //             entityId: cardId,
//       //             action: "CARD_MOVED",
//       //             details: {
//       //               previousListId: sourceListId,
//       //               newListId: updatedCard.boardListId,
//       //               previousPosition: sourcePosition,
//       //               newPosition: updatedCard.position,
//       //             },
//       //           },
//       //           tx,
//       //         );
//       //       }
//     });
//   },

//   // async updateCardFields(
//   //   boardId: string,
//   //   cardId: string,
//   //   updates: CardDetailUpdate,
//   // ) {
//   //   const [updatedCard] = await db
//   //     .update(card)
//   //     .set(updates)
//   //     .where(
//   //       and(
//   //         eq(card.id, cardId),
//   //         eq(card.boardId, boardId),
//   //         isNull(card.deletedAt),
//   //       ),
//   //     )
//   //     .returning();

//   //   return updatedCard ?? null;
//   // },

//   async updateCardFields(
//     boardId: string,
//     cardId: string,
//     updates: CardDetailUpdate,
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const [updatedCard] = await executor
//       .update(card)
//       .set(updates)
//       .where(
//         and(
//           eq(card.id, cardId),
//           eq(card.boardId, boardId),
//           isNull(card.deletedAt),
//         ),
//       )
//       .returning();

//     return updatedCard ?? null;
//   },

//   // async updateCardSprint(boardId: string, cardId: string, sprintIds: string[]) {
//   //   const conditions = and(
//   //     eq(card.id, cardId),
//   //     eq(card.boardId, boardId),
//   //     isNull(card.deletedAt),
//   //   );

//   //   // 1. Read existing sprint assignments.
//   //   const [existingCard] = await db
//   //     .select({ sprintId: card.sprintId })
//   //     .from(card)
//   //     .where(conditions)
//   //     .limit(1);

//   //   if (!existingCard) {
//   //     return null;
//   //   }

//   //   // 2. Merge existing sprint IDs with the new sprint IDs.
//   //   const mergedSprintIds = [
//   //     ...new Set([...(existingCard.sprintId ?? []), ...sprintIds]),
//   //   ];

//   //   // 3. Save all sprint assignments.
//   //   const [updatedCard] = await db
//   //     .update(card)
//   //     .set({
//   //       sprintId: mergedSprintIds,
//   //       updatedAt: new Date(),
//   //     })
//   //     .where(conditions)
//   //     .returning();

//   //   return updatedCard ?? null;
//   // },

//   async updateCardSprint(
//     boardId: string,
//     cardId: string,
//     sprintIds: string[],
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const conditions = and(
//       eq(card.id, cardId),
//       eq(card.boardId, boardId),
//       isNull(card.deletedAt),
//     );

//     const [existingCard] = await executor
//       .select({ sprintId: card.sprintId })
//       .from(card)
//       .where(conditions)
//       .limit(1);

//     if (!existingCard) return null;

//     const mergedSprintIds = [
//       ...new Set([...(existingCard.sprintId ?? []), ...sprintIds]),
//     ];

//     const [updatedCard] = await executor
//       .update(card)
//       .set({
//         sprintId: mergedSprintIds,
//         updatedAt: new Date(),
//       })
//       .where(conditions)
//       .returning();

//     return updatedCard ?? null;
//   },
//   // async removeCardSprints(boardId: string, cardId: string) {
//   async removeCardSprints(
//     boardId: string,
//     cardId: string,
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const [updatedCard] = await executor
//       .update(card)
//       .set({
//         sprintId: [],
//         updatedAt: new Date(),
//       })
//       .where(
//         and(
//           eq(card.id, cardId),
//           eq(card.boardId, boardId),
//           isNull(card.deletedAt),
//         ),
//       )
//       .returning();

//     return updatedCard ?? null;
//   },
//   // async assignCardToMember(
//   //   boardId: string,
//   //   cardId: string,
//   //   assignedTo: string | null,
//   // ) {
//   //   const [updatedCard] = await db
//   //     .update(card)
//   //     .set({
//   //       assignedTo,
//   //       updatedAt: new Date(),
//   //     })
//   //     .where(
//   //       and(
//   //         eq(card.id, cardId),
//   //         eq(card.boardId, boardId),
//   //         isNull(card.deletedAt),
//   //       ),
//   //     )
//   //     .returning();

//   //   return updatedCard ?? null;
//   // },

//   async assignCardToMember(
//     boardId: string,
//     cardId: string,
//     assignedTo: string | null,
//     tx?: AuditLogTransaction,
//   ) {
//     const executor = tx ?? db;

//     const [updatedCard] = await executor
//       .update(card)
//       .set({
//         assignedTo,
//         updatedAt: new Date(),
//       })
//       .where(
//         and(
//           eq(card.id, cardId),
//           eq(card.boardId, boardId),
//           isNull(card.deletedAt),
//         ),
//       )
//       .returning();

//     return updatedCard ?? null;
//   },
//   // async DeleteCard(boardId: string, cardId: string) {
//   //   const deletedCard = await db
//   //     .delete(card)
//   //     .where(
//   //       and(
//   //         eq(card.id, cardId),
//   //         eq(card.boardId, boardId),
//   //         isNull(card.deletedAt),
//   //       ),
//   //     )
//   //     .returning();

//   //   return deletedCard;
//   // },
//   async DeleteCard(boardId: string, cardId: string, performedBy: string) {
//     return db.transaction(async (tx) => {
//       const existingCard = await CardRepo.getCardSnapshot(boardId, cardId, tx);

//       if (!existingCard) return null;

//       const boardDetails = await BoardRepo.findById(boardId, tx);

//       if (!boardDetails) {
//         throw new Error("Board not found while recording card deletion");
//       }

//       await AuditLogService.record(
//         {
//           performedBy,
//           workspaceId: boardDetails.organizationId,
//           boardId,
//           entityType: "card",
//           entityId: cardId,
//           action: "CARD_DELETED",
//           details: {
//             cardNumber: existingCard.cardNumber,
//             title: existingCard.title,
//             description: existingCard.description,
//             previousListId: existingCard.boardListId,
//             previousSprintIds: existingCard.sprintId,
//             previousAssigneeId: existingCard.assignedTo,
//             previousTaskType: existingCard.taskType,
//             previousPriority: existingCard.priority,
//             previousEstimateTime: existingCard.estimateTime,
//             previousSpentTime: existingCard.spentTime,
//           },
//         },
//         tx,
//       );

//       const deletedCards = await tx
//         .delete(card)
//         .where(
//           and(
//             eq(card.id, cardId),
//             eq(card.boardId, boardId),
//             isNull(card.deletedAt),
//           ),
//         )
//         .returning();

//       return deletedCards[0] ?? null;
//     });
//   },
// };

import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { card } from "@/db/cardSchema";
import { users } from "@/db/authSchema";
import { BoardRepo } from "@/repositories/boardRepo";
import { AuditLogService } from "@/services/auditLogService";
import { and, asc, eq, isNull, max, sql } from "drizzle-orm";
import type { AuditLogTransaction } from "@/repositories/auditLogRepo";
import { AuditLogRepo } from "@/repositories/auditLogRepo";
import { board } from "@/db/boardSchema";
type CardDetailUpdate = {
  title?: string;
  description?: string | null;
  taskType?: "bug" | "feature" | "task" | "tbd";
  priority?: "normal" | "show stopper" | "critical" | "major" | "minor";
  sprintId?: string[] | null;
  estimateTime?: string | null;
  spentTime?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  assignedTo?: string | null;
  updatedAt?: Date;
};

const priorities = [
  "normal",
  "show stopper",
  "critical",
  "major",
  "minor",
] as const;
const taskTypes = ["bug", "feature", "task", "tbd"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parsePriority(
  value: string,
): NonNullable<CardDetailUpdate["priority"]> {
  if (!priorities.some((p) => p === value))
    throw new Error("Invalid card priority");
  return value as NonNullable<CardDetailUpdate["priority"]>;
}

function parseTaskType(
  value: string,
): NonNullable<CardDetailUpdate["taskType"]> {
  if (!taskTypes.some((t) => t === value))
    throw new Error("Invalid card task type");
  return value as NonNullable<CardDetailUpdate["taskType"]>;
}

function ensureUuid(value: string, field: string): void {
  if (!uuidPattern.test(value)) throw new Error(`Invalid ${field}`);
}

function parseOptionalDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid card date");
  return parsed;
}

/**
 * Serialize card creation and reordering within the same board.
 * Every write path that changes ordering must take this lock FIRST.
 * This is a transaction-scoped PostgreSQL advisory lock, NOT a row lock.
 * Hash collisions only reduce concurrency; they don't compromise correctness.
 */
async function lockCardOrdering(tx: AuditLogTransaction, boardId: string) {
  await tx.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${boardId})::bigint)`,
  );
}

const activeCardConditions = (boardId: string, cardId: string) =>
  and(eq(card.id, cardId), eq(card.boardId, boardId), isNull(card.deletedAt));

export const CardRepo = {
  async createCard(
    boardId: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string,
    priority: string,
    type: string,
    sprintId: string[],
    listId: string,
    assigneeId: string,
    user_id: string,
    tx?: AuditLogTransaction,
  ) {
    const safePriority = parsePriority(priority);
    const safeType = parseTaskType(type);
    const safeStart = parseOptionalDate(startDate);
    const safeDue = parseOptionalDate(dueDate);
    if (!Array.isArray(sprintId)) throw new Error("sprintId must be an array");
    for (const id of sprintId) ensureUuid(id, "sprint ID");

    const insert = async (executor: AuditLogTransaction) => {
      await lockCardOrdering(executor, boardId);

      const [numberResult] = await executor
        .select({ maxCardNumber: max(card.cardNumber) })
        .from(card)
        .where(eq(card.boardId, boardId));

      const [positionResult] = await executor
        .select({ maxPosition: max(card.position) })
        .from(card)
        .where(
          and(
            eq(card.boardId, boardId),
            eq(card.boardListId, listId),
            isNull(card.deletedAt),
          ),
        );
      const [boardData] = await executor
        .select({
          workspaceId: board.organizationId,
        })
        .from(board)
        .where(eq(board.id, boardId))
        .limit(1);

      if (!boardData) {
        throw new Error("Board not found");
      }

      const workspaceId = boardData.workspaceId;
      const [newCard] = await executor
        .insert(card)
        .values({
          boardId,
          boardListId: listId,
          sprintId: [...new Set(sprintId)],
          cardNumber: Number(numberResult?.maxCardNumber ?? 0) + 1,
          title,
          description,
          priority: safePriority,
          taskType: safeType,
          position: Number(positionResult?.maxPosition ?? 0) + 1,
          reporterId: user_id,
          startDate: safeStart,
          dueDate: safeDue,
          assignedTo: assigneeId || null,
        })
        .returning();
      if (!newCard) {
        throw new Error("Card creation failed");
      }

      // Audit log must use the same transaction.
      await AuditLogRepo.create(
        {
          performedBy: user_id,
          workspaceId,
          boardId,
          entityType: "card",
          entityId: newCard.id,
          action: "CARD_CREATED",
          details: {
            title: newCard.title,
            description: newCard.description,
            priority: newCard.priority,
            taskType: newCard.taskType,
            boardListId: newCard.boardListId,
            sprintId: newCard.sprintId,
            assignedTo: newCard.assignedTo,
          },
        },
        executor,
      );

      return newCard;
    };

    return tx ? insert(tx) : db.transaction(insert);
  },

  async getBoardCardBySprintId(boardId: string, sprintId: string) {
    ensureUuid(sprintId, "sprint ID");
    return db
      .select({
        id: card.id,
        boardId: card.boardId,
        boardListId: card.boardListId,
        sprintId: card.sprintId,
        cardNumber: card.cardNumber,
        title: card.title,
        description: card.description,
        startDate: card.startDate,
        dueDate: card.dueDate,
        priority: card.priority,
        position: card.position,
        reporterId: card.reporterId,
        completedAt: card.completedAt,
        assignedTo: card.assignedTo,
        isArchived: card.isArchived,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        deletedAt: card.deletedAt,
      })
      .from(card)
      .where(
        and(
          eq(card.boardId, boardId),
          isNull(card.deletedAt),
          sql`${sprintId}::uuid = ANY(${card.sprintId})`,
        ),
      )
      .orderBy(asc(card.position));
  },

  async getCardSnapshot(
    boardId: string,
    cardId: string,
    tx?: AuditLogTransaction,
  ) {
    const executor = tx ?? db;
    const [snapshot] = await executor
      .select()
      .from(card)
      .where(activeCardConditions(boardId, cardId))
      .limit(1);
    return snapshot ?? null;
  },

  async getBoardCardDetail(boardId: string, cardId: string) {
    // Preserve the existing array return shape, but make it one row per card.
    // Multiple sprint names are returned as a comma-separated string.
    return db
      .select({
        id: card.id,
        cardNumber: card.cardNumber,
        title: card.title,
        description: card.description,
        priority: card.priority,
        type: card.taskType,
        startDate: card.startDate,
        dueDate: card.dueDate,
        completedAt: card.completedAt,
        boardListId: card.boardListId,
        sprintId: card.sprintId,
        assignedTo: card.assignedTo,
        sprintName: sql<string | null>`(
          SELECT string_agg(${sprint.sprintName}, ', ' ORDER BY ${sprint.sprintName})
          FROM ${sprint}
          WHERE ${sprint.id} = ANY(${card.sprintId})
        )`,
        assigneeName: users.name,
        estimateTime: card.estimateTime,
        spentTime: card.spentTime,
      })
      .from(card)
      .leftJoin(users, eq(card.assignedTo, users.id))
      .where(activeCardConditions(boardId, cardId));
  },

  async getCardForMove(boardId: string, cardId: string) {
    const [details] = await db
      .select({
        id: card.id,
        boardId: card.boardId,
        boardListId: card.boardListId,
        position: card.position,
      })
      .from(card)
      .where(activeCardConditions(boardId, cardId))
      .limit(1);
    return details ?? null;
  },

  async moveCard(
    boardId: string,
    cardId: string,
    destinationListId: string,
    requestedPosition: number,
    performedBy: string,
  ) {
    if (!Number.isInteger(requestedPosition) || requestedPosition < 1) {
      throw new Error("requestedPosition must be a positive integer");
    }

    return db.transaction(async (tx) => {
      await lockCardOrdering(tx, boardId);

      const [movingCard] = await tx
        .select({
          id: card.id,
          boardListId: card.boardListId,
          position: card.position,
        })
        .from(card)
        .where(activeCardConditions(boardId, cardId))
        .limit(1);
      if (!movingCard) return null;

      const sourceListId = movingCard.boardListId;
      const sourcePosition = movingCard.position;

      // IMPORTANT: The calling service must verify destinationListId is a list
      // inside boardId before calling this method (see integration notes).
      const sourceCards = await tx
        .select({ id: card.id, position: card.position })
        .from(card)
        .where(
          and(
            eq(card.boardId, boardId),
            eq(card.boardListId, sourceListId),
            isNull(card.deletedAt),
          ),
        )
        .orderBy(asc(card.position), asc(card.id));

      const sameList = sourceListId === destinationListId;
      const destinationCards = sameList
        ? sourceCards
        : await tx
            .select({ id: card.id, position: card.position })
            .from(card)
            .where(
              and(
                eq(card.boardId, boardId),
                eq(card.boardListId, destinationListId),
                isNull(card.deletedAt),
              ),
            )
            .orderBy(asc(card.position), asc(card.id));

      const targetCards = destinationCards.filter((item) => item.id !== cardId);
      const index = Math.min(requestedPosition - 1, targetCards.length);
      targetCards.splice(index, 0, { id: cardId, position: index + 1 });

      const remainingSource = sameList
        ? []
        : sourceCards.filter((item) => item.id !== cardId);

      const newPosition = index + 1;
      const changed = !sameList || sourcePosition !== newPosition;
      if (!changed) {
        return CardRepo.getCardSnapshot(boardId, cardId, tx);
      }

      for (let i = 0; i < remainingSource.length; i++) {
        await tx
          .update(card)
          .set({ position: i + 1, updatedAt: new Date() })
          .where(activeCardConditions(boardId, remainingSource[i].id));
      }

      for (let i = 0; i < targetCards.length; i++) {
        await tx
          .update(card)
          .set({
            boardListId: destinationListId,
            position: i + 1,
            updatedAt: new Date(),
          })
          .where(activeCardConditions(boardId, targetCards[i].id));
      }

      const updatedCard = await CardRepo.getCardSnapshot(boardId, cardId, tx);
      if (!updatedCard) throw new Error("Card disappeared during movement");

      const boardDetails = await BoardRepo.findById(boardId, tx);
      if (!boardDetails)
        throw new Error("Board not found while recording card movement");

      await AuditLogService.record(
        {
          performedBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "card",
          entityId: cardId,
          action: "CARD_MOVED",
          details: {
            previousListId: sourceListId,
            newListId: updatedCard.boardListId,
            previousPosition: sourcePosition,
            newPosition: updatedCard.position,
          },
        },
        tx,
      );

      return updatedCard;
    });
  },

  async updateCardFields(
    boardId: string,
    cardId: string,
    updates: CardDetailUpdate,
    tx?: AuditLogTransaction,
  ) {
    const executor = tx ?? db;
    const [updatedCard] = await executor
      .update(card)
      .set({ ...updates, updatedAt: new Date() })
      .where(activeCardConditions(boardId, cardId))
      .returning();
    return updatedCard ?? null;
  },

  async updateCardSprint(
    boardId: string,
    cardId: string,
    sprintIds: string[],
    tx?: AuditLogTransaction,
  ) {
    if (!Array.isArray(sprintIds))
      throw new Error("sprintIds must be an array");
    for (const id of sprintIds) ensureUuid(id, "sprint ID");
    if (sprintIds.length === 0)
      return CardRepo.getCardSnapshot(boardId, cardId, tx);

    const executor = tx ?? db;
    // Atomic SQL update avoids the read-merge-write lost-update race.
    const incoming = sql`ARRAY[${sql.join(
      [...new Set(sprintIds)].map((id) => sql`${id}::uuid`),
      sql`, `,
    )}]::uuid[]`;

    const merged = sql<string[]>`ARRAY(
      SELECT DISTINCT sprint_id
      FROM unnest(COALESCE(${card.sprintId}, ARRAY[]::uuid[]) || ${incoming})
      AS sprint_id
      ORDER BY sprint_id
    )`;

    const [updatedCard] = await executor
      .update(card)
      .set({ sprintId: merged, updatedAt: new Date() })
      .where(activeCardConditions(boardId, cardId))
      .returning();
    return updatedCard ?? null;
  },

  async removeCardSprints(
    boardId: string,
    cardId: string,
    tx?: AuditLogTransaction,
  ) {
    const executor = tx ?? db;
    const [updatedCard] = await executor
      .update(card)
      .set({ sprintId: [], updatedAt: new Date() })
      .where(activeCardConditions(boardId, cardId))
      .returning();
    return updatedCard ?? null;
  },

  async assignCardToMember(
    boardId: string,
    cardId: string,
    assignedTo: string | null,
    tx?: AuditLogTransaction,
  ) {
    const executor = tx ?? db;
    const [updatedCard] = await executor
      .update(card)
      .set({ assignedTo, updatedAt: new Date() })
      .where(activeCardConditions(boardId, cardId))
      .returning();
    return updatedCard ?? null;
  },

  async DeleteCard(boardId: string, cardId: string, performedBy: string) {
    return db.transaction(async (tx) => {
      await lockCardOrdering(tx, boardId);
      const existingCard = await CardRepo.getCardSnapshot(boardId, cardId, tx);
      if (!existingCard) return null;

      const boardDetails = await BoardRepo.findById(boardId, tx);
      if (!boardDetails)
        throw new Error("Board not found while recording card deletion");

      const [deletedCard] = await tx
        .update(card)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(activeCardConditions(boardId, cardId))
        .returning();
      if (!deletedCard) return null;

      // Recompact remaining cards, so active positions are always 1..N.
      const remaining = await tx
        .select({ id: card.id })
        .from(card)
        .where(
          and(
            eq(card.boardId, boardId),
            eq(card.boardListId, existingCard.boardListId),
            isNull(card.deletedAt),
          ),
        )
        .orderBy(asc(card.position), asc(card.id));

      for (let i = 0; i < remaining.length; i++) {
        await tx
          .update(card)
          .set({ position: i + 1 })
          .where(activeCardConditions(boardId, remaining[i].id));
      }

      await AuditLogService.record(
        {
          performedBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "card",
          entityId: cardId,
          action: "CARD_DELETED",
          details: {
            cardNumber: existingCard.cardNumber,
            title: existingCard.title,
            description: existingCard.description,
            previousListId: existingCard.boardListId,
            previousSprintIds: existingCard.sprintId,
            previousAssigneeId: existingCard.assignedTo,
            previousTaskType: existingCard.taskType,
            previousPriority: existingCard.priority,
            previousEstimateTime: existingCard.estimateTime,
            previousSpentTime: existingCard.spentTime,
          },
        },
        tx,
      );

      return deletedCard;
    });
  },
};
