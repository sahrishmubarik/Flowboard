import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { card } from "@/db/cardSchema";
import { eq, and, ne, isNull, sql } from "drizzle-orm";
export const SprintRepo = {
  // async create(
  //   boardId: string,
  //   sprintName: string,
  //   startDate: string,
  //   endDate: string,
  //   goal: string,
  //   createdBy: string,
  //   carryUnresolvedTickets: boolean,
  // ) {
  //   const newSprint = await db
  //     .insert(sprint)
  //     .values({
  //       boardId,
  //       sprintName,
  //       startDate,
  //       endDate,
  //       goal,
  //       createdBy,
  //       carryUnresolvedTickets,
  //     })
  //     .returning({
  //       id: sprint.id,
  //       boardId: sprint.boardId,
  //       name: sprint.sprintName,
  //       startDate: sprint.startDate,
  //       endDate: sprint.endDate,
  //       goal: sprint.goal,
  //       status: sprint.status,
  //       createdBy: sprint.createdBy,
  //       createdAt: sprint.createdAt,
  //       updatedAt: sprint.updatedAt,
  //       carryUnresolvedTickets: sprint.carryUnresolvedTickets,
  //     });

  //   return newSprint[0];
  // },
  async create(
    boardId: string,
    sprintName: string,
    startDate: string,
    endDate: string,
    goal: string,
    createdBy: string,
    carryUnresolvedTickets: boolean,
  ) {
    return db.transaction(async (tx) => {
      // 1. Create the new sprint as PLANNED.
      const [newSprint] = await tx
        .insert(sprint)
        .values({
          boardId,
          sprintName: sprintName,
          startDate,
          endDate,
          goal,
          createdBy,
          carryUnresolvedTickets,
        })
        .returning();

      // 2. Carry unresolved tickets into the new sprint.
      if (carryUnresolvedTickets) {
        const unresolvedCards = await tx
          .select({
            id: card.id,
            sprintId: card.sprintId,
          })
          .from(card)
          .where(
            and(
              eq(card.boardId, boardId),
              isNull(card.completedAt),
              eq(card.isArchived, false),
              isNull(card.deletedAt),
            ),
          );

        // 3. MERGE the new sprint ID without removing old sprint IDs.
        for (const ticket of unresolvedCards) {
          const mergedSprintIds = [
            ...new Set([...(ticket.sprintId ?? []), newSprint.id]),
          ];

          await tx
            .update(card)
            .set({
              sprintId: mergedSprintIds,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(card.id, ticket.id),
                eq(card.boardId, boardId),
                isNull(card.deletedAt),
              ),
            );
        }
      }

      return newSprint;
    });
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
      // 1. Verify the destination sprint belongs to this board.
      const [destinationSprint] = await tx
        .select({
          id: sprint.id,
          boardId: sprint.boardId,
        })
        .from(sprint)
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)))
        .limit(1);

      if (!destinationSprint) {
        throw new Error("Sprint not found");
      }

      // 2. Find the outgoing active sprint and its carry-forward setting.
      const [outgoingSprint] = await tx
        .select({
          id: sprint.id,
          carryUnresolvedTickets: sprint.carryUnresolvedTickets,
        })
        .from(sprint)
        .where(
          and(
            eq(sprint.boardId, boardId),
            eq(sprint.status, "ACTIVE"),
            ne(sprint.id, sprintId),
          ),
        )
        .limit(1);

      // 3. Carry unresolved cards forward by MERGING sprint IDs.
      // Existing sprint assignments are preserved.
      if (outgoingSprint?.carryUnresolvedTickets) {
        const unresolvedCards = await tx
          .select({
            id: card.id,
            sprintId: card.sprintId,
          })
          .from(card)
          .where(
            and(
              eq(card.boardId, boardId),
              sql`${outgoingSprint.id}::uuid = ANY(${card.sprintId})`,
              isNull(card.completedAt),
              eq(card.isArchived, false),
              isNull(card.deletedAt),
            ),
          );

        for (const unresolvedCard of unresolvedCards) {
          const mergedSprintIds = [
            ...new Set([
              ...(unresolvedCard.sprintId ?? []),
              destinationSprint.id,
            ]),
          ];

          await tx
            .update(card)
            .set({
              sprintId: mergedSprintIds,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(card.id, unresolvedCard.id),
                eq(card.boardId, boardId),
                isNull(card.deletedAt),
              ),
            );
        }
      }

      // 4. Complete the outgoing sprint, if one exists.
      if (outgoingSprint) {
        await tx
          .update(sprint)
          .set({
            status: "COMPLETED",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sprint.id, outgoingSprint.id),
              eq(sprint.boardId, boardId),
              eq(sprint.status, "ACTIVE"),
            ),
          );
      }

      // 5. Activate the destination sprint.
      const [updatedSprint] = await tx
        .update(sprint)
        .set({
          status: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(
          and(eq(sprint.id, destinationSprint.id), eq(sprint.boardId, boardId)),
        )
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
          carryUnresolvedTickets: sprint.carryUnresolvedTickets,
        });

      return updatedSprint;
    });
  },

  async getSprintById(sprintId: string) {
    const sprintDetails = await db
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
      .where(eq(sprint.id, sprintId));

    return sprintDetails;
  },
};
