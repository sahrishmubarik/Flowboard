import { db } from "@/db";
import { boardList } from "@/db/boardSchema";
import { eq, max, and, asc } from "drizzle-orm";
import type { DbTransaction } from "@/db/types";
export const BoardListRepo = {
  // async create(boardId: string, listName: string, createdBy: string) {
  //   const [positionResult] = await db
  //     .select({
  //       maxPosition: max(boardList.position),
  //     })
  //     .from(boardList)
  //     .where(eq(boardList.boardId, boardId));

  //   const nextPosition = (positionResult.maxPosition ?? 0) + 1;

  //   const [boardLists] = await db
  //     .insert(boardList)
  //     .values({
  //       boardId,
  //       listName,
  //       position: nextPosition,
  //       createdBy,
  //     })
  //     .returning({
  //       id: boardList.id,
  //       boardId: boardList.boardId,
  //       listName: boardList.listName,
  //       position: boardList.position,
  //     });

  //   return boardLists;
  // },

  async create(
    boardId: string,
    listName: string,
    createdBy: string,
    tx?: DbTransaction,
  ) {
    const executor = tx ?? db;

    const [positionResult] = await executor
      .select({
        maxPosition: max(boardList.position),
      })
      .from(boardList)
      .where(eq(boardList.boardId, boardId));

    const nextPosition = (positionResult.maxPosition ?? 0) + 1;

    const [createdList] = await executor
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

    return createdList;
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
  async findById(boardId: string, listId: string, tx?: DbTransaction) {
    const executor = tx ?? db;

    const [list] = await executor
      .select({
        id: boardList.id,
        boardId: boardList.boardId,
        listName: boardList.listName,
        position: boardList.position,
      })
      .from(boardList)
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)));

    return list;
  },
  // async updateListNameById(boardId: string, listId: string, listName: string) {
  //   const list = await db
  //     .update(boardList)
  //     .set({
  //       listName: listName,
  //     })
  //     .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
  //     .returning({
  //       id: boardList.id,
  //       listName: boardList.listName,
  //     });
  //   return list;
  // },

  async updateListNameById(
    boardId: string,
    listId: string,
    listName: string,
    tx?: DbTransaction,
  ) {
    const executor = tx ?? db;

    return await executor
      .update(boardList)
      .set({ listName })
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
      .returning({
        id: boardList.id,
        listName: boardList.listName,
      });
  },
  // async DeleteList(boardId: string, listId: string) {
  //   const list = await db
  //     .delete(boardList)
  //     .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
  //     .returning({
  //       id: boardList.id,
  //       listName: boardList.listName,
  //     });
  //   return list;
  // },

  async DeleteList(boardId: string, listId: string, tx?: DbTransaction) {
    const executor = tx ?? db;

    return await executor
      .delete(boardList)
      .where(and(eq(boardList.boardId, boardId), eq(boardList.id, listId)))
      .returning({
        id: boardList.id,
        listName: boardList.listName,
      });
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
