import {
  AuditLogRepo,
  type AuditLogTransaction,
  type CreateAuditLogInput,
} from "@/repositories/auditLogRepo";
import { AppError } from "@/lib/errors/AppError";

export const AuditLogService = {
  async record(input: CreateAuditLogInput, tx?: AuditLogTransaction) {
    if (!input.entityType.trim()) {
      throw new AppError("Audit entityType is required", 400);
    }

    if (!input.entityId) {
      throw new AppError("Audit entityId is required", 400);
    }

    if (!input.action.trim()) {
      throw new AppError("Audit action is required", 400);
    }

    return AuditLogRepo.create(input, tx);
  },
  async getByWorkspaceAndBoard(
    workspaceId: string,
    boardId: string,
    page = 1,
    limit = 7,
  ) {
    return AuditLogRepo.getByWorkspaceAndBoard(
      workspaceId,
      boardId,
      page,
      limit,
    );
  },
};
