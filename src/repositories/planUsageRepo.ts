import { and, count, eq, gt, sql } from "drizzle-orm";

import { db } from "@/db";
import { board } from "@/db/boardSchema";
import type { DbTransaction } from "@/db/types";
import { invitationSchema, organizationMembers } from "@/db/workspaceSchema";

type Executor = typeof db | DbTransaction;

// Advisory lock namespaces, so board and member checks never block each other.
const LOCK_BOARDS = 1;
const LOCK_MEMBERS = 2;

// What a workspace currently uses, for plan limits.
export const planUsageRepo = {
  async countBoards(workspaceId: string, executor: Executor = db) {
    const [result] = await executor
      .select({ total: count() })
      .from(board)
      .where(eq(board.organizationId, workspaceId));

    return Number(result?.total ?? 0);
  },

  async countActiveMembers(workspaceId: string, executor: Executor = db) {
    const [result] = await executor
      .select({ total: count() })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      );

    return Number(result?.total ?? 0);
  },

  // Invitations that can still be accepted.
  async countPendingInvitations(workspaceId: string, executor: Executor = db) {
    const [result] = await executor
      .select({ total: count() })
      .from(invitationSchema)
      .where(
        and(
          eq(invitationSchema.workspaceId, workspaceId),
          eq(invitationSchema.status, "PENDING"),
          gt(invitationSchema.expiresAt, new Date()),
        ),
      );

    return Number(result?.total ?? 0);
  },

  // Held until the transaction ends. Two requests for the same workspace
  // then count one after the other, so both cannot pass a limit of 3 at
  // the same moment and create a 4th board.
  async lockBoards(tx: DbTransaction, workspaceId: string) {
    await tx.execute(
      sql`select pg_advisory_xact_lock(${LOCK_BOARDS}, hashtext(${workspaceId}))`,
    );
  },

  async lockMembers(tx: DbTransaction, workspaceId: string) {
    await tx.execute(
      sql`select pg_advisory_xact_lock(${LOCK_MEMBERS}, hashtext(${workspaceId}))`,
    );
  },
};
