import { db } from "@/db";
import { card } from "@/db/cardSchema";

import { eq, and, max } from "drizzle-orm";

export const CardRepo = {
  async createCard(
    boardId: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string,
    priority: string,
    sprintId: string,
    listId: string,
    user_id: string,
  ) {
    /*
     * ========================================================
     * GET NEXT CARD NUMBER
     * ========================================================
     */

    const result = await db
      .select({
        maxCardNumber: max(card.cardNumber),
      })
      .from(card)
      .where(eq(card.boardId, boardId));

    const maxCardNumber = result[0]?.maxCardNumber ?? 0;

    const nextCardNumber = Number(maxCardNumber) + 1;

    /*
     * ========================================================
     * GET NEXT POSITION
     * ========================================================
     */

    const positionResult = await db
      .select({
        maxPosition: max(card.position),
      })
      .from(card)
      .where(eq(card.boardListId, listId));

    const maxPosition = positionResult[0]?.maxPosition ?? 0;

    const nextPosition = Number(maxPosition) + 1;

    /*
     * ========================================================
     * CREATE CARD
     * ========================================================
     */

    const [newCard] = await db
      .insert(card)
      .values({
        boardId,

        boardListId: listId,

        sprintId,

        cardNumber: nextCardNumber,

        title,

        description,

        priority: priority as
          | "normal"
          | "show stopper"
          | "critical"
          | "major"
          | "minor",

        position: nextPosition,

        reporterId: user_id,

        startDate: startDate ? new Date(startDate) : null,

        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    return newCard;
  },

  async getBoardCardBySprintId(boardId: string, sprintId: string) {
    const boardCardDetails = await db
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

        isArchived: card.isArchived,

        createdAt: card.createdAt,

        updatedAt: card.updatedAt,

        deletedAt: card.deletedAt,
      })
      .from(card)
      .where(and(eq(card.boardId, boardId), eq(card.sprintId, sprintId)));

    return boardCardDetails;
  },
  async getBoardCardDetail(boardId: string, cardId: string) {
    const boardCardDetails = await db
      .select({
        id: card.id,
        cardNumber: card.cardNumber,
        title: card.title,
        description: card.description,
        priority: card.priority,
        startDate: card.startDate,
        dueDate: card.dueDate,
        completedAt: card.completedAt,
        boardListId: card.boardListId,
        sprintId: card.sprintId,
      })
      .from(card)
      .where(and(eq(card.boardId, boardId), eq(card.id, cardId)));

    return boardCardDetails;
  },
};
