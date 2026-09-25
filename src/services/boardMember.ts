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
  role: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }
  const user_id = user.userId;
  await requireBoardRole(user_id, boardId, ["owner", "admin", "manager"]);
  /* first check add person  already part of  member of that board */
  const existingBoardMember = await boardMemberRepo.findByUserAndBoard(
    userId,
    boardId,
  );
  if (existingBoardMember) {
    throw new AppError("Member already exist in that board ", 404);
  }
  /*get board name and organization name for that pass to email for user to know in which board add you */
  const [workspaceData, boardData] = await Promise.all([
    workspaceRepo.findById(workspaceId),
    BoardRepo.getBoardById(boardId),
  ]);

  const details = {
    organizationName: workspaceData?.workspaceName,
    boardName: boardData?.[0]?.boardName,
  };
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
  const currentUserId = user_id;
  /* add member to your board member table */
  const newBoardMember = await boardMemberRepo.create(
    userId, // invited user's ID
    boardId,
    role,
    currentUserId, // admin/owner who is assigning them
  );
  return Response.json(
    {
      message: "Add member in Board successfully",
      Board: newBoardMember,
    },
    {
      status: 201,
    },
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
