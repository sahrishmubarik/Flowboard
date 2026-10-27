import { db } from "@/db";
import { sprint } from "@/db/boardSchema";
import { card } from "@/db/cardSchema";
import { eq, and, ne, isNull, sql } from "drizzle-orm";
import { BoardRepo } from "@/repositories/boardRepo";
import { AuditLogService } from "@/services/auditLogService";
import { NotificationService } from "@/services/notificationService";
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
      const boardDetails = await BoardRepo.findById(boardId, tx);

      if (!boardDetails) {
        throw new Error("Board not found");
      }

      const auditLog = await AuditLogService.record(
        {
          performedBy: createdBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "sprint",
          entityId: newSprint.id,
          action: "SPRINT_CREATED",
          details: {
            sprintName: newSprint.sprintName,
            startDate: newSprint.startDate,
            endDate: newSprint.endDate,
            goal: newSprint.goal,
            carryUnresolvedTickets: newSprint.carryUnresolvedTickets,
          },
        },
        tx,
      );

      // "Ali created a new sprint" — tell everyone on the board.
      await NotificationService.notifyBoardMembers(
        {
          type: "SPRINT_CREATED",
          actorId: createdBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          sprintId: newSprint.id,
          sourceEventId: auditLog.id,
          details: { sprintName: newSprint.sprintName },
        },
        tx,
      );

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

  async updateStatus(sprintId: string, boardId: string, performedBy: string) {
    return await db.transaction(async (tx) => {
      // 1. Verify the destination sprint belongs to this board.
      const [destinationSprint] = await tx
        .select({
          id: sprint.id,
          boardId: sprint.boardId,
          name: sprint.sprintName,
          status: sprint.status,
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
          sprintName: sprint.sprintName,
          status: sprint.status,
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

      const boardDetails = await BoardRepo.findById(boardId, tx);

      if (!boardDetails) {
        throw new Error("Board not found");
      }

      // Audit the outgoing sprint transition.
      if (outgoingSprint) {
        await AuditLogService.record(
          {
            performedBy, // Is value ko neeche correct karna hai.
            workspaceId: boardDetails.organizationId,
            boardId,
            entityType: "sprint",
            entityId: outgoingSprint.id,
            action: "SPRINT_STATUS_UPDATED",
            details: {
              sprintName: outgoingSprint.sprintName,
              previousStatus: "ACTIVE",
              newStatus: "COMPLETED",
            },
          },
          tx,
        );
      }

      // Audit the selected sprint transition.
      await AuditLogService.record(
        {
          performedBy, // Is value ko neeche correct karna hai.
          workspaceId: boardDetails.organizationId,
          boardId,

          entityType: "sprint",
          entityId: updatedSprint.id,
          action: "SPRINT_STATUS_UPDATED",
          details: {
            sprintName: updatedSprint.name,
            previousStatus: destinationSprint.status,
            newStatus: "ACTIVE",
          },
        },
        tx,
      );
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

  async updateDetails(
    sprintId: string,
    boardId: string,
    performedBy: string,
    input: {
      sprintName: string;
      goal: string;
      startDate: string;
      endDate: string;
      carryUnresolvedTickets: boolean;
    },
  ) {
    return db.transaction(async (tx) => {
      const [previousSprint] = await tx
        .select()
        .from(sprint)
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)))
        .limit(1);

      if (!previousSprint) {
        throw new Error("Sprint not found");
      }

      const [updatedSprint] = await tx
        .update(sprint)
        .set({
          sprintName: input.sprintName,
          goal: input.goal,
          startDate: input.startDate,
          endDate: input.endDate,
          carryUnresolvedTickets: input.carryUnresolvedTickets,
          updatedAt: new Date(),
        })
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)))
        .returning();

      const boardDetails = await BoardRepo.findById(boardId, tx);

      if (!boardDetails) {
        throw new Error("Board not found");
      }

      await AuditLogService.record(
        {
          performedBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "sprint",
          entityId: sprintId,
          action: "SPRINT_UPDATED",
          details: {
            previousValue: {
              sprintName: previousSprint.sprintName,
              goal: previousSprint.goal,
              startDate: previousSprint.startDate,
              endDate: previousSprint.endDate,
              carryUnresolvedTickets: previousSprint.carryUnresolvedTickets,
            },
            newValue: {
              sprintName: updatedSprint.sprintName,
              goal: updatedSprint.goal,
              startDate: updatedSprint.startDate,
              endDate: updatedSprint.endDate,
              carryUnresolvedTickets: updatedSprint.carryUnresolvedTickets,
            },
          },
        },
        tx,
      );

      return updatedSprint;
    });
  },

  async deleteSprint(sprintId: string, boardId: string, performedBy: string) {
    return db.transaction(async (tx) => {
      const [existingSprint] = await tx
        .select()
        .from(sprint)
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)))
        .limit(1);

      if (!existingSprint) {
        throw new Error("Sprint not found");
      }

      const boardDetails = await BoardRepo.findById(boardId, tx);

      if (!boardDetails) {
        throw new Error("Board not found");
      }

      await AuditLogService.record(
        {
          performedBy,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "sprint",
          entityId: sprintId,
          action: "SPRINT_DELETED",
          details: {
            sprintName: existingSprint.sprintName,
            goal: existingSprint.goal,
            startDate: existingSprint.startDate,
            endDate: existingSprint.endDate,
            status: existingSprint.status,
            carryUnresolvedTickets: existingSprint.carryUnresolvedTickets,
          },
        },
        tx,
      );

      await tx
        .delete(sprint)
        .where(and(eq(sprint.id, sprintId), eq(sprint.boardId, boardId)));

      return existingSprint;
    });
  },
};
