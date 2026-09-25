import { db } from "@/db";
import { boardMembers } from "@/db/boardSchema";
import { eq, and, count } from "drizzle-orm";
import { users } from "@/db/authSchema";

export const boardMemberRepo = {
  async findByUserAndBoard(userId: string, boardId: string) {
    const [BoardMember] = await db
      .select()
      .from(boardMembers)
      .where(
        and(eq(boardMembers.userId, userId), eq(boardMembers.boardId, boardId)),
      );

    return BoardMember;
  },

  async getBoardMembers(boardId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const members = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: boardMembers.role,
      })
      .from(boardMembers)
      .innerJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, boardId))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(boardMembers)
      .innerJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, boardId));

    const total = Number(totalResult[0]?.count ?? 0);

    return {
      members,
      total,
    };
  },
  async create(
    memberUserId: string,
    boardId: string,
    role: "owner" | "admin" | "manager" | "member",
    assignedBy: string,
  ) {
    const [boardMember] = await db
      .insert(boardMembers)
      .values({
        userId: memberUserId,
        boardId,
        assignedBy,
        role,
      })
      .returning({
        id: boardMembers.id,
        boardId: boardMembers.boardId,
      });

    return boardMember;
  },
  async removeMember(userId: string, boardId: string) {
    const [deletedMember] = await db
      .update(boardMembers)
      .set({
        status: "DEACTIVATED",
      })
      .where(
        and(eq(boardMembers.userId, userId), eq(boardMembers.boardId, boardId)),
      )
      .returning({
        id: boardMembers.id,
        userId: boardMembers.userId,
        boardId: boardMembers.boardId,
      });

    return deletedMember;
  },
};
