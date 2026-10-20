import { db } from "@/db";
import { commit } from "@/db/cardSchema";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/authSchema";
export const CommitRepo = {
  async createCardCommit(
    cardId: string,
    title: string,
    description: string,
    user_id: string,
  ) {
    const [newCommit] = await db
      .insert(commit)
      .values({
        cardId,
        title,
        description,
        createdBy: user_id,
      })
      .returning();

    return newCommit;
  },

  async getCommitByCardId(cardId: string) {
    return db
      .select({
        id: commit.id,
        cardId: commit.cardId,
        title: commit.title,
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
        title: commit.title,
        description: commit.description,
        createdBy: commit.createdBy,
        createdByName: users.name,
        createdAt: commit.createdAt,
      })
      .from(commit)
      .innerJoin(users, eq(commit.createdBy, users.id))
      .where(and(eq(commit.cardId, cardId), eq(commit.id, commitId)));
  },
  async deleteCommitById(cardId: string, commitId: string) {
    const deletedCommit = await db
      .delete(commit)
      .where(and(eq(commit.cardId, cardId), eq(commit.id, commitId)))
      .returning();

    return deletedCommit[0] ?? null;
  },
};
