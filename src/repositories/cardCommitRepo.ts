import { db } from "@/db";
import { commit } from "@/db/cardSchema";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/authSchema";
import { BoardRepo } from "@/repositories/boardRepo";
import { AuditLogService } from "@/services/auditLogService";
export const CommitRepo = {
  // async createCardCommit(
  //   cardId: string,

  //   description: string,
  //   user_id: string,
  // ) {
  //   const [newCommit] = await db
  //     .insert(commit)
  //     .values({
  //       cardId,
  //       description,
  //       createdBy: user_id,
  //     })
  //     .returning();

  //   return newCommit;
  // },

  async createCardCommit(
    boardId: string,
    cardId: string,
    description: string,
    userId: string,
  ) {
    return db.transaction(async (tx) => {
      const [newCommit] = await tx
        .insert(commit)
        .values({
          cardId,
          description,
          createdBy: userId,
        })
        .returning();

      const boardDetails = await BoardRepo.findById(boardId, tx);

      if (!boardDetails) {
        throw new Error("Board not found");
      }

      await AuditLogService.record(
        {
          performedBy: userId,
          workspaceId: boardDetails.organizationId,
          boardId,
          entityType: "commit",
          entityId: newCommit.id,
          action: "COMMIT_CREATED",
          details: { description: newCommit.description },
        },
        tx,
      );

      return newCommit;
    });
  },
  async getCommitByCardId(cardId: string) {
    return db
      .select({
        id: commit.id,
        cardId: commit.cardId,
        description: commit.description,
        createdBy: commit.createdBy,
        createdByName: users.name,
        createdAt: commit.createdAt,
      })
      .from(commit)
      .innerJoin(users, eq(commit.createdBy, users.id))
      .where(eq(commit.cardId, cardId));
  },

  async getCardCommitDetail(cardId: string, commitId: string) {
    return db
      .select({
        id: commit.id,
        cardId: commit.cardId,

        description: commit.description,
        createdBy: commit.createdBy,
        createdByName: users.name,
        createdAt: commit.createdAt,
      })
      .from(commit)
      .innerJoin(users, eq(commit.createdBy, users.id))
      .where(and(eq(commit.cardId, cardId), eq(commit.id, commitId)));
  },
  // async deleteCommitById(cardId: string, commitId: string) {
  //   const deletedCommit = await db
  //     .delete(commit)
  //     .where(and(eq(commit.cardId, cardId), eq(commit.id, commitId)))
  //     .returning();

  //   return deletedCommit[0] ?? null;
  // },

  async deleteCommitById(
    boardId: string,
    cardId: string,
    commitId: string,
    performedBy: string,
  ) {
    return db.transaction(async (tx) => {
      const [existingCommit] = await tx
        .select()
        .from(commit)
        .where(and(eq(commit.id, commitId), eq(commit.cardId, cardId)))
        .limit(1);

      if (!existingCommit) {
        throw new Error("Commit not found");
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
          entityType: "commit",
          entityId: commitId,
          action: "COMMIT_DELETED",
          details: {
            description: existingCommit.description,
            createdBy: existingCommit.createdBy,
          },
        },
        tx,
      );

      await tx
        .delete(commit)
        .where(and(eq(commit.id, commitId), eq(commit.cardId, cardId)));

      return existingCommit;
    });
  },
  async updateCommitById(
    boardId: string,
    cardId: string,
    commitId: string,
    description: string,
    performedBy: string,
  ) {
    return db.transaction(async (tx) => {
      const [previousCommit] = await tx
        .select()
        .from(commit)
        .where(and(eq(commit.id, commitId), eq(commit.cardId, cardId)))
        .limit(1);

      if (!previousCommit) {
        throw new Error("Commit not found");
      }

      const [updatedCommit] = await tx
        .update(commit)
        .set({ description })
        .where(and(eq(commit.id, commitId), eq(commit.cardId, cardId)))
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
          entityType: "commit",
          entityId: commitId,
          action: "COMMIT_UPDATED",
          details: {
            previousValue: {
              description: previousCommit.description,
            },
            newValue: {
              description: updatedCommit.description,
            },
          },
        },
        tx,
      );

      return updatedCommit;
    });
  },
};
