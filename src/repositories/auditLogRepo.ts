import { db } from "@/db";
import { auditLogs } from "@/db/auditLogSchema";
import { users } from "@/db/authSchema";
import { and, count, desc, eq } from "drizzle-orm";

export type AuditLogTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

export type CreateAuditLogInput = typeof auditLogs.$inferInsert;

export const AuditLogRepo = {
  async create(input: CreateAuditLogInput, tx?: AuditLogTransaction) {
    const [createdLog] = tx
      ? await tx.insert(auditLogs).values(input).returning()
      : await db.insert(auditLogs).values(input).returning();

    return createdLog;
  },

  async getByWorkspace(workspaceId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.workspaceId, workspaceId))
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(safeLimit)
      .offset((safePage - 1) * safeLimit);
  },

  async getByBoard(boardId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.boardId, boardId))
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(safeLimit)
      .offset((safePage - 1) * safeLimit);
  },

  async getByWorkspaceAndBoard(
    workspaceId: string,
    boardId: string,
    page = 1,
    limit = 7,
  ) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const filters = and(
      eq(auditLogs.workspaceId, workspaceId),
      eq(auditLogs.boardId, boardId),
    );

    const [rows, [totalResult]] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          performedBy: auditLogs.performedBy,
          performerName: users.name,
          performerEmail: users.email,
          workspaceId: auditLogs.workspaceId,
          boardId: auditLogs.boardId,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          action: auditLogs.action,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.performedBy, users.id))
        .where(filters)
        .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit),

      db.select({ total: count() }).from(auditLogs).where(filters),
    ]);

    const total = Number(totalResult?.total ?? 0);

    return {
      activities: rows.map(({ action, entityType, ...activity }) => ({
        ...activity,
        action,
        entityType,
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },
};
