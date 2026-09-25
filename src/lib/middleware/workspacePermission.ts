// src/lib/middleware/ownerAdmin.ts

import { AppError } from "@/lib/errors/AppError";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";
import type { organizationRoleEnum } from "@/db/workspaceSchema";

export async function requireWorkspaceRole(
  userId: string,
  workspaceId: string,
  allowedRoles: (typeof organizationRoleEnum.enumValues)[number][],
) {
 
  const membership = await organizationMemberRepo.findByUserAndWorkspace(
    userId,
    workspaceId,
  );
 
  if (!membership) {
    throw new AppError("You are not a member of this workspace.", 403);
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new AppError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return membership;
}
