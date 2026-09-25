

import { AppError } from "@/lib/errors/AppError";
import type { boardMemberRoleEnum } from "@/db/boardSchema";
import { boardMemberRepo } from "@/repositories/boardMemberRepo";

export async function requireBoardRole(
  userId: string,
  boardId: string,
  allowedRoles: (typeof boardMemberRoleEnum.enumValues)[number][],
) {
 
  const membership = await boardMemberRepo.findByUserAndBoard(
    userId,
    boardId,
  );
 
  if (!membership) {
    throw new AppError("You are not a member of this board.", 403);
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new AppError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return membership;
}
