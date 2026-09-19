import { db } from "@/db";
import { organizationMembers } from "@/db/workspaceSchema";
import { users } from "@/db/authSchema";
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
async getByWorkspaceId(workspaceId: string) {
  return db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      name: users.name,
      email: users.email,
      role: organizationMembers.role,
      createdAt: organizationMembers.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(
      users,
      eq(organizationMembers.userId, users.id),
    )
    .where(
      eq(
        organizationMembers.organizationId,
        workspaceId,
      ),
    );
},
async getByWorkspaceIdAndRole(
  workspaceId: string,
  role: WorkspaceMemberRole,
) {
  return db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      name: users.name,
      email: users.email,
      role: organizationMembers.role,
      createdAt: organizationMembers.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(
      users,
      eq(organizationMembers.userId, users.id),
    )
    .where(
      and(
        eq(
          organizationMembers.organizationId,
          workspaceId,
        ),
        eq(organizationMembers.role, role),
      ),
    );
}
};
