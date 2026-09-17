import { db } from "@/db";
import { organizationMembers } from "@/db/workspaceSchema";
import { eq, and } from "drizzle-orm";
import type { DbTransaction } from "@/db/types";
export const organizationMemberRepo = {
  async create(
   transaction: DbTransaction,
 { organizationId, userId, role, assignedBy },
  ) {
    const [row] = await transaction
      .insert(organizationMembers)
      .values({
        organizationId,
        userId,
        role,
        assignedBy,
      })
      .returning({
        id: organizationMembers.id,
      });

    return row;
  },
  /* Find existing member role or its workspace */
  async findByUserAndWorkspace(userId: string, workspaceId: string) {
    const [member] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, workspaceId),
        ),
      );

    return member;
  },
};
