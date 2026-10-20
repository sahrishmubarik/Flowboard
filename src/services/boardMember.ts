import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { BoardRepo } from "@/repositories/boardRepo";
import { boardMemberRepo } from "@/repositories/boardMemberRepo";
import { workspaceRepo } from "@/repositories/organizationRepo";
import { sendBoardInvitationEmail } from "@/lib/email/verificationEmail";
import { requireBoardRole } from "@/lib/middleware/boardPermission";

export async function getBoardMembers(
  boardId: string,
  page: number,
  limit: number,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  // Check whether current user belongs to this board
  const boardMember = await BoardRepo.getForUser(user.userId, boardId);

  if (!boardMember) {
    throw new AppError("You do not have access to this board", 403);
  }

  const result = await boardMemberRepo.getBoardMembers(boardId, page, limit);

  return Response.json({
    message: "Board members fetched successfully",
    data: result,
  });
}

/* INVITE MEMBER IN BOARD */
export async function inviteMemberInBoard(
  workspaceId: string,
  boardId: string,
  userId: string,
  email: string,
  role: "owner" | "admin" | "manager" | "member",
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const currentUserId = user.userId;

  // 1. Check whether the current user can manage this board.
  await requireBoardRole(currentUserId, boardId, ["owner", "admin", "manager"]);

  // 2. Check whether the target user already has a membership record.
  const existingMember = await boardMemberRepo.findByUserAndBoard(
    userId,
    boardId,
  );

  // 3. If the membership exists but was deactivated, reactivate it.
  if (existingMember) {
    if (existingMember.status === "DEACTIVATED") {
      const reactivatedMember = await boardMemberRepo.reactivateMember(
        userId,
        boardId,
        role,
        currentUserId,
      );

      return Response.json(
        {
          message: "Board membership reactivated successfully",
          Board: reactivatedMember,
        },
        { status: 200 },
      );
    }

    // 4. If already active, return a conflict.
    throw new AppError("Member already exists in that board", 409);
  }

  // 5. Get workspace and board details for the invitation email.
  const [workspaceData, boardData] = await Promise.all([
    workspaceRepo.findById(workspaceId),
    BoardRepo.getBoardById(boardId),
  ]);

  const details = {
    organizationName: workspaceData?.workspaceName,
    boardName: boardData?.[0]?.boardName,
  };

  // 6. Send the invitation email for a new board membership.
  const boardInviteUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}` +
    `/dashboard/workspace/${workspaceId}/board`;

  await sendBoardInvitationEmail({
    email,
    organizationName: details.organizationName,
    boardName: details.boardName,
    role,
    boardInviteUrl,
  });

  // 7. Create the new board membership.
  const newBoardMember = await boardMemberRepo.create(
    userId,
    boardId,
    role,
    currentUserId,
  );

  return Response.json(
    {
      message: "Board member added successfully",
      Board: newBoardMember,
    },
    { status: 201 },
  );
}

/* delete board member from board  */
export async function deleteMemberFormBoard(userId: string, boardId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("User not found", 401);
  }
  const user_id = user.userId;
  await requireBoardRole(user_id, boardId, ["owner", "admin"]);
  const deleteMember = await boardMemberRepo.removeMember(userId, boardId);
  return Response.json(
    {
      message: "Remove member from board successfully!",
      Board: deleteMember,
    },
    {
      status: 200,
    },
  );
}

/* get all board member without pagination  */
export async function getAllActiveBoardMembers(
  workspaceId: string,
  boardId: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  // Check whether current user belongs to this board
  const boardMember = await BoardRepo.getForUser(user.userId, boardId);

  if (!boardMember) {
    throw new AppError("You do not have access to this board", 403);
  }

  const result = await boardMemberRepo.getAllActiveBoardMember(boardId);

  return Response.json({
    message: "Board members fetched successfully",
    data: result,
  });
}
