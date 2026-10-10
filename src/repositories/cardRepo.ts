import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { card } from "@/db/cardSchema";

import { eq, and, max, asc, isNull } from "drizzle-orm";

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

        // Get the sprint name from the sprint table
        sprintName: sprint.sprintName,
      })
      .from(card)
      .leftJoin(sprint, eq(card.sprintId, sprint.id))
      .where(and(eq(card.boardId, boardId), eq(card.id, cardId)));

    return boardCardDetails;
  },

  /*
   * ============================================================
   * GET CARD FOR MOVING
   * ============================================================
   */

  async getCardForMove(boardId: string, cardId: string) {
    const [cardDetails] = await db
      .select({
        id: card.id,
        boardId: card.boardId,
        boardListId: card.boardListId,
        position: card.position,
      })
      .from(card)
      .where(
        and(
          eq(card.boardId, boardId),
          eq(card.id, cardId),
          isNull(card.deletedAt),
        ),
      )
      .limit(1);

    return cardDetails ?? null;
  },

  /*
   * ============================================================
   * MOVE CARD + UPDATE POSITIONS
   * ============================================================
   */

  async moveCard(
    boardId: string,
    cardId: string,
    destinationListId: string,
    requestedPosition: number,
  ) {
    return await db.transaction(async (tx) => {
      // 1. Find the card inside this board.
      const [movingCard] = await tx
        .select({
          id: card.id,
          boardListId: card.boardListId,
        })
        .from(card)
        .where(
          and(
            eq(card.id, cardId),
            eq(card.boardId, boardId),
            isNull(card.deletedAt),
          ),
        )
        .limit(1);

      if (!movingCard) {
        return null;
      }

      const sourceListId = movingCard.boardListId;

      // 2. Load the cards from the source list.
      const sourceCards = await tx
        .select({
          id: card.id,
          boardListId: card.boardListId,
          position: card.position,
        })
        .from(card)
        .where(
          and(
            eq(card.boardId, boardId),
            eq(card.boardListId, sourceListId),
            isNull(card.deletedAt),
          ),
        )
        .orderBy(asc(card.position));

      // 3. If moving within the same list, reorder that list.
      if (sourceListId === destinationListId) {
        const reorderedCards = sourceCards.filter((item) => item.id !== cardId);

        const targetIndex = Math.min(
          requestedPosition - 1,
          reorderedCards.length,
        );

        reorderedCards.splice(targetIndex, 0, {
          id: movingCard.id,
          boardListId: sourceListId,
          position: requestedPosition,
        });

        // 4. Save all positions in the reordered list.
        for (let index = 0; index < reorderedCards.length; index++) {
          const item = reorderedCards[index];

          await tx
            .update(card)
            .set({
              position: index + 1,
            })
            .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
        }
      } else {
        // 5. Remove the card from the source list.
        const remainingSourceCards = sourceCards.filter(
          (item) => item.id !== cardId,
        );

        // 6. Load the destination list's cards.
        const destinationCards = await tx
          .select({
            id: card.id,
            boardListId: card.boardListId,
            position: card.position,
          })
          .from(card)
          .where(
            and(
              eq(card.boardId, boardId),
              eq(card.boardListId, destinationListId),
              isNull(card.deletedAt),
            ),
          )
          .orderBy(asc(card.position));

        // 7. Insert the moving card at the requested position.
        const targetIndex = Math.min(
          requestedPosition - 1,
          destinationCards.length,
        );

        destinationCards.splice(targetIndex, 0, {
          id: movingCard.id,
          boardListId: destinationListId,
          position: requestedPosition,
        });

        // 8. Close the gap in the source list.
        for (let index = 0; index < remainingSourceCards.length; index++) {
          const item = remainingSourceCards[index];

          await tx
            .update(card)
            .set({
              position: index + 1,
            })
            .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
        }

        // 9. Save the destination list and the moving card.
        for (let index = 0; index < destinationCards.length; index++) {
          const item = destinationCards[index];

          await tx
            .update(card)
            .set({
              boardListId: destinationListId,
              position: index + 1,
            })
            .where(and(eq(card.id, item.id), eq(card.boardId, boardId)));
        }
      }

      // 10. Return the updated card.
      const [updatedCard] = await tx
        .select()
        .from(card)
        .where(and(eq(card.id, cardId), eq(card.boardId, boardId)))
        .limit(1);

      return updatedCard ?? null;
    });
  },
};
