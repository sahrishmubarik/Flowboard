import { db } from "@/db";
import { users } from "@/db/authSchema";
import { organizationMembers } from "@/db/workspaceSchema";
import { eq, and, count } from "drizzle-orm";
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
          eq(organizationMembers.status, "ACTIVE"),
        ),
      );

    return member;
  },
  // async getByWorkspaceId(workspaceId: string,
  //   page:number,
  //   limit:number,
  // ) {
  //   const offset=(page-1)*limit;
  //   const members=await db
  //     .select({
  //       id: organizationMembers.id,
  //       userId: organizationMembers.userId,
  //       name: users.name,
  //       email: users.email,
  //       role: organizationMembers.role,
  //       createdAt: organizationMembers.createdAt,
  //     })
  //     .from(organizationMembers)
  //     .innerJoin(
  //       users,
  //       eq(organizationMembers.userId, users.id),
  //     )
  //     .where(
  //       eq(
  //         organizationMembers.organizationId,
  //         workspaceId,
  //       ),
  //     ).limit(limit).offset(offset);
  //     const totalResult=await db
  //     .select({
  //       count:count(),
  //     }).from(organizationMembers)
  //     .innerJoin(
  //       users,
  //       eq(organizationMembers.organizationId,
  //         workspaceId)
  //   );
  //   const total=Number(totalResult[0]?.count ?? 0);
  //   return{
  //     members,total,
  //   };
  // },
  async getByWorkspaceId(workspaceId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const members = await db
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
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      )
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      );

    const total = Number(totalResult[0]?.count ?? 0);

    return {
      members,
      total,
    };
  },

  // async getByWorkspaceIdAndRole(
  //   workspaceId: string,
  //   role: WorkspaceMemberRole,
  // ) {
  //   return db
  //     .select({
  //       id: organizationMembers.id,
  //       userId: organizationMembers.userId,
  //       name: users.name,
  //       email: users.email,
  //       role: organizationMembers.role,
  //       createdAt: organizationMembers.createdAt,
  //     })
  //     .from(organizationMembers)
  //     .innerJoin(
  //       users,
  //       eq(organizationMembers.userId, users.id),
  //     )
  //     .where(
  //       and(
  //         eq(
  //           organizationMembers.organizationId,
  //           workspaceId,
  //         ),
  //         eq(organizationMembers.role, role),
  //       ),
  //     );
  // }
  async getByWorkspaceIdAndRole(
    workspaceId: string,
    role: WorkspaceMemberRole,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    const members = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        name: users.name,
        email: users.email,
        role: organizationMembers.role,
        createdAt: organizationMembers.createdAt,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.role, role),
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      )
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({
        count: count(),
      })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, workspaceId),
          eq(organizationMembers.role, role),
        ),
      );

    const total = Number(totalResult[0]?.count ?? 0);

    return {
      members,
      total,
    };
  },
  /* update status from active to Deactivated then no more user to your organization */
  async updatedStatus(userId: string, workspaceId: string) {
    const DeactivatedStatus = await db
      .update(organizationMembers)
      .set({
        status: "DEACTIVATED",
      })
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, workspaceId),
        ),
      )
      .returning({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        organizationId: organizationMembers.organizationId,
      });
    return DeactivatedStatus;
  },
};
