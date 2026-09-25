import { db } from "@/db";
import { board, boardMembers } from "@/db/boardSchema";

import { eq, and } from "drizzle-orm";
export const BoardRepo = {
  async create(
    tx: typeof db,
    workspaceId: string,
    boardName: string,
    createdBy: string,
  ) {
    // 1. Create board
    const [boardDetails] = await tx
      .insert(board)
      .values({
        organizationId: workspaceId,
        boardName,
        createdBy,
      })
      .returning({
        id: board.id,
        boardName: board.boardName,
        organizationId: board.organizationId,
        createdBy: board.createdBy,
        createdAt: board.createdAt,
      });

    // 2. Add creator as board owner
    await tx.insert(boardMembers).values({
      boardId: boardDetails.id,
      userId: createdBy,
      assignedBy:createdBy,
      role: "owner",
    });

    return boardDetails;
  },

  async getBoards(workspaceId: string, userId: string) {
    console.log("Workspace Id in getBoards:", workspaceId);
    console.log("User Id in getBoards:", userId);
    const boards = await db
      .select({
        id: board.id,
        boardName: board.boardName,
        organizationId: board.organizationId,
        createdBy: board.createdBy,
        createdAt: board.createdAt,
        role: boardMembers.role,
      })
      .from(board)
      .innerJoin(boardMembers, eq(boardMembers.boardId, board.id))
      .where(
        and(
          eq(board.organizationId, workspaceId),
          eq(boardMembers.userId, userId),
        ),
      );

    console.log("BOARDS FROM DB:", boards);

    return { boards };
  },
  async getForUser(userId: string, boardId: string) {
    const [boardData] = await db
      .select({
        boardId: board.id,
        boardName: board.boardName,
        role: boardMembers.role,
        createdAt: board.createdAt,
      })
      .from(boardMembers)
      .innerJoin(board, eq(boardMembers.boardId, board.id))
      .where(and(eq(boardMembers.userId, userId), eq(board.id, boardId)));

    return boardData;
  },

  async updateBoardName(boardId: string, boardName: string) {
    const updateBoard = await db
      .update(board)
      .set({
        boardName: boardName,
      })
      .where(eq(board.id, boardId));
    return updateBoard;
  },
  
  async getBoardById(boardId:string){
       const boardDetails=await db.select({
        id:board.id,
        boardName:board.boardName,
        organizationId:board.organizationId,
       }).from(board)
       .where(eq(board.id,boardId));
       return boardDetails;

  },
     async deleteBoard(boardId: string) {
    const [deletedBoard] = await db
      .delete(board)
      .where(eq(board.id, boardId))
      .returning({
        id: board.id,
        boardName: board.boardName,
      });
  
    return deletedBoard;
  
    },
};
