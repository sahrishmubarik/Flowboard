import { db } from "@/db";
import { invitationSchema } from "@/db/workspaceSchema";
import { eq, and ,count} from "drizzle-orm";
import type { DbTransaction } from "@/db/types";
export const invitationRepo = {
  async findPendingByEmailAndWorkspace(email: string, workspaceId: string) {
    const [invitation] = await db
      .select()
      .from(invitationSchema)
      .where(
        and(
          eq(invitationSchema.email, email),
          eq(invitationSchema.workspaceId, workspaceId),
          eq(invitationSchema.status, "PENDING"),
        ),
      );

    return invitation;
  },
  async findByToken(tokenHash: string) {
    const [invitation] = await db
      .select()
      .from(invitationSchema)
      .where(eq(invitationSchema.token, tokenHash));
    return invitation;
  },
  async updateStatus(transaction: DbTransaction, invitationId: string) {
    const [invitation] = await transaction
      .update(invitationSchema)
      .set({ status: "ACCEPTED" })
      .where(eq(invitationSchema.id, invitationId))
      .returning();
    return invitation;
  },

  async create(data: {
    workspaceId: string;
    email: string;
    role: "admin" | "manager" | "member";
    token: string;
    expiresAt: Date;
    createdBy: string;
  }) {
    const [invitation] = await db
      .insert(invitationSchema)
      .values({
        workspaceId: data.workspaceId,
        email: data.email,
        role: data.role, // ✅ saves selected role
        token: data.token,
        expiresAt: data.expiresAt,
        createdBy: data.createdBy,
      })
      .returning();

    return invitation;
  },
async revokeInvitation(
  workspaceId: string,
  email: string,
) {
  const [invitationRevoke] = await db
    .update(invitationSchema)
    .set({
      status: "REVOKED",
    })
    .where(
      and(
        eq(invitationSchema.workspaceId, workspaceId),
        eq(invitationSchema.email, email),
      ),
    )
    .returning();

  return invitationRevoke;
},
// async getInvitationByWorkspaceId(workspaceId: string) {
//   return db
//     .select({
//       id: invitationSchema.id,
//       email: invitationSchema.email,
//       role: invitationSchema.role,
//       status: invitationSchema.status,
//       expiresAt: invitationSchema.expiresAt,
//       createdAt: invitationSchema.createdAt,
//     })
//     .from(invitationSchema)
//     .where(
//       eq(invitationSchema.workspaceId, workspaceId),
//     );
// },
async getInvitationByWorkspaceId(
  workspaceId: string,
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit;

  const invitations = await db
    .select()
    .from(invitationSchema)
    .where(
      eq(invitationSchema.workspaceId, workspaceId),
    )
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({
      count: count(),
    })
    .from(invitationSchema)
    .where(
      eq(invitationSchema.workspaceId, workspaceId),
    );

  const total = Number(totalResult[0]?.count ?? 0);

  return {
    invitations,
    total,
  };
}
};
