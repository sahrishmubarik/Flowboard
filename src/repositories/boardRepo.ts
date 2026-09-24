import { db } from "@/db";
import { board ,  boardMembers} from "@/db/boardSchema";

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
      role: "owner",
    });

    return boardDetails;
  },

  async getBoards(
  workspaceId: string,
  userId: string,
) {
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
  .innerJoin(
    boardMembers,
    eq(boardMembers.boardId, board.id),
  )
  .where(
    and(
      eq(board.organizationId, workspaceId),
      eq(boardMembers.userId, userId),
    ),
  );

console.log("BOARDS FROM DB:", boards);

return { boards };

},
};