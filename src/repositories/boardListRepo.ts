import { db } from "@/db";
import { boardList } from "@/db/boardSchema";
import { eq, max, and, asc } from "drizzle-orm";

export const BoardListRepo = {
  async create(boardId: string, listName: string, createdBy: string) {
    const [positionResult] = await db
      .select({
        maxPosition: max(boardList.position),
      })
      .from(boardList)
      .where(eq(boardList.boardId, boardId));

    const nextPosition = (positionResult.maxPosition ?? 0) + 1;

    const [boardLists] = await db
      .insert(boardList)
      .values({
        boardId,
        listName,
        position: nextPosition,
        createdBy,
      })
      .returning({
        id: boardList.id,
        boardId: boardList.boardId,
        listName: boardList.listName,
        position: boardList.position,
      });

    return boardLists;
  },

  async getListByBoardId(boardId: string) {
    return await db
      .select({
        id: boardList.id,
        listName: boardList.listName,
        position: boardList.position,
      })
      .from(boardList)
      .where(eq(boardList.boardId, boardId))
      .orderBy(asc(boardList.position));
  },
  async getListByListId(boardId: string, listId: string) {
    const List = await db
      .select({
        id: boardList.id,
        listName: boardList.listName,
        position: boardList.position,
      })
      .from(boardList)
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)));
    return List;
  },
  async updateListNameById(boardId: string, listId: string, listName: string) {
    const list = await db
      .update(boardList)
      .set({
        listName: listName,
      })
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
      .returning({
        id: boardList.id,
        listName: boardList.listName,
      });
    return list;
  },
  async DeleteList(boardId: string, listId: string) {
    const list = await db
      .delete(boardList)
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
      .returning({
        id: boardList.id,
        listName: boardList.listName,
      });
    return list;
  },
  async reorderLists(boardId: string, orderedIds: string[]) {
    return await db.transaction(async (tx) => {
      for (const [index, listId] of orderedIds.entries()) {
        await tx
          .update(boardList)
          .set({
            position: index + 1,
          })
          .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)));
      }

      return await tx
        .select({
          id: boardList.id,
          listName: boardList.listName,
          position: boardList.position,
        })
        .from(boardList)
        .where(eq(boardList.boardId, boardId))
        .orderBy(asc(boardList.position));
    });
  },
};
