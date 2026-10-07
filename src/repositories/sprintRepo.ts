import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { eq, and, ne } from "drizzle-orm";
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

  async updateStatus(sprintId: string, boardId: string) {
    return await db.transaction(async (tx) => {
      // 1. Get the sprint being activated
      const currentSprint = await tx
        .select({
          id: sprint.id,
          boardId: sprint.boardId,
        })
        .from(sprint)
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)))
        .limit(1);

      if (!currentSprint[0]) {
        throw new Error("Sprint not found");
      }

      const currentBoardId = currentSprint[0].boardId;

      // 2. Complete the current ACTIVE sprint on this board
      await tx
        .update(sprint)
        .set({
          status: "COMPLETED",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sprint.boardId, currentBoardId),
            eq(sprint.status, "ACTIVE"),
            ne(sprint.id, sprintId),
          ),
        );

      // 3. Activate the selected sprint
      const updatedSprint = await tx
        .update(sprint)
        .set({
          status: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(eq(sprint.id, sprintId))
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

      return updatedSprint[0];
    });
  },
};
