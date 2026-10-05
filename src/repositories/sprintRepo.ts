import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { eq } from "drizzle-orm";
export const SprintRepo = {
  async create(
    boardId: string,
    sprintName: string,
    startDate: string,
    endDate: string,
    goal: string,
    createdBy: string,
  ) {
    const newSprint = await db
      .insert(sprint)
      .values({
        boardId,
        sprintName,
        startDate,
        endDate,
        goal,
        createdBy,
      })
      .returning({
        id: sprint.id,
        boardId: sprint.boardId,
        name: sprint.sprintName,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal,
        status: sprint.status,
        createdBy: sprint.createdBy,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt,
      });

    return newSprint[0];
  },
  async getByBoardId(boardId: string) {
    const sprints = await db
      .select({
        id: sprint.id,
        boardId: sprint.boardId,
        name: sprint.sprintName,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal,
        status: sprint.status,
        createdBy: sprint.createdBy,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt,
      })
      .from(sprint)
      .where(eq(sprint.boardId, boardId));

    return sprints;
  },
};
