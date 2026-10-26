import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import { validateData, boardValidation } from "@/lib/validations/board";
import { BoardRepo } from "@/repositories/boardRepo";
import { requireBoardRole } from "@/lib/middleware/boardPermission";
import { db } from "@/db";
import { AuditLogService } from "@/services/auditLogService";
/* create board */

/* create board */
export async function createBoard(workspaceId: string, boardName: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const validation = validateData(boardValidation, { boardName });

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  await requireWorkspaceRole(user.userId, workspaceId, ["owner", "admin"]);

  const newBoard = await db.transaction(async (tx) => {
    const createdBoard = await BoardRepo.create(
      tx as unknown as typeof db,
      workspaceId,
      validation.data.boardName,
      user.userId,
    );

    await AuditLogService.record(
      {
        performedBy: user.userId,
        workspaceId,
        boardId: createdBoard.id,
        entityType: "board",
        entityId: createdBoard.id,
        action: "BOARD_CREATED",
        details: {
          boardName: createdBoard.boardName,
        },
      },
      tx,
    );

    return createdBoard;
  });

  return Response.json(
    {
      message: "Board created successfully",
      Board: newBoard,
    },
    { status: 201 },
  );
}

// export async function createBoard(workspaceId: string, boardName: string) {
//   const user = await getCurrentUser();
//   if (!user) {
//     throw new AppError("Unauthorized user", 401);
//   }
//   const validation = validateData(boardValidation, { boardName });

//   if (!validation.success) {
//     throw new AppError(validation.error, 400);
//   }

//   /* check user role if its owner or admin of that workspace then create board */
//   await requireWorkspaceRole(user.userId, workspaceId, ["owner", "admin"]);

//   const newBoard = await db.transaction(async (tx) => {
//     return BoardRepo.create(
//       tx as unknown as typeof db,
//       workspaceId,
//       validation.data.boardName,
//       user.userId,
//     );
//   });

//   return Response.json(
//     {
//       message: "Board created successfully",
//       Board: newBoard,
//     },
//     {
//       status: 201,
//     },
//   );
// }

/* get  all board according to its organization Id  */
export async function getBoardByWorkspaceId(workspaceId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }
  console.log(workspaceId);
  const user_id = user.userId;
  const boardDetails = await BoardRepo.getBoards(workspaceId, user_id);
  console.log("See here board response");
  console.log(boardDetails);
  return Response.json(
    {
      message: "Fetch boards successfully",
      ...boardDetails,
    },
    {
      status: 200,
    },
  );
}

/* GET BOARD THROUGH ITS ID */

export async function getBoardById(boardId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const boardData = await BoardRepo.getForUser(user.userId, boardId);

  if (!boardData) {
    throw new AppError("Board not found", 404);
  }

  return Response.json(
    {
      message: "Fetched board  successfully",
      board: boardData,
    },
    {
      status: 200,
    },
  );
}

// export async function updateBoardName(boardId: string, boardName: string) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user", 401);
//   }
//   const user_id = user.userId;
//   const validation = validateData(boardValidation, { boardName });

//   if (!validation.success) {
//     throw new AppError(validation.error, 400);
//   }

//   const { boardName: validateBoardName } = validation.data;

//   await requireBoardRole(user_id, boardId, ["owner", "admin"]);
//   const result = BoardRepo.updateBoardName(boardId, validateBoardName);
//   return Response.json(
//     {
//       message: "Board Name update successfully",
//       workspace: result,
//     },
//     {
//       status: 201,
//     },
//   );
// }

export async function updateBoardName(boardId: string, boardName: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const validation = validateData(boardValidation, { boardName });

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const validatedBoardName = validation.data.boardName;

  await requireBoardRole(user.userId, boardId, ["owner", "admin"]);

  const updatedBoard = await db.transaction(async (tx) => {
    const previousBoard = await BoardRepo.findById(boardId, tx);

    if (!previousBoard) {
      throw new AppError("Board not found", 404);
    }

    const result = await BoardRepo.updateBoardName(
      boardId,
      validatedBoardName,
      tx,
    );

    if (!result) {
      throw new AppError("Board could not be updated", 404);
    }

    if (previousBoard.boardName !== result.boardName) {
      await AuditLogService.record(
        {
          performedBy: user.userId,
          workspaceId: previousBoard.organizationId,
          boardId,
          entityType: "board",
          entityId: boardId,
          action: "BOARD_UPDATED",
          details: {
            field: "boardName",
            previousValue: previousBoard.boardName,
            newValue: result.boardName,
          },
        },
        tx,
      );
    }

    return result;
  });

  return Response.json(
    {
      message: "Board Name update successfully",
      workspace: updatedBoard,
    },
    { status: 201 },
  );
}

// export async function deleteBoard(boardId: string) {
//   const user = await getCurrentUser();
//   if (!user) {
//     throw new AppError("Unauthorized user", 401);
//   }
//   const user_id = user.userId;
//   await requireBoardRole(user_id, boardId, ["owner"]);
//   const result = BoardRepo.deleteBoard(boardId);
//   return Response.json(
//     {
//       message: "Delete board successfully!",
//       board: result,
//     },
//     {
//       status: 201,
//     },
//   );
// }

export async function deleteBoard(boardId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  await requireBoardRole(user.userId, boardId, ["owner"]);

  const deletedBoard = await db.transaction(async (tx) => {
    const existingBoard = await BoardRepo.findById(boardId, tx);

    if (!existingBoard) {
      throw new AppError("Board not found", 404);
    }

    await AuditLogService.record(
      {
        performedBy: user.userId,
        workspaceId: existingBoard.organizationId,
        boardId,
        entityType: "board",
        entityId: boardId,
        action: "BOARD_DELETED",
        details: {
          boardName: existingBoard.boardName,
          createdBy: existingBoard.createdBy,
        },
      },
      tx,
    );

    const result = await BoardRepo.deleteBoard(boardId, tx);

    if (!result) {
      throw new AppError("Board could not be deleted", 404);
    }

    return result;
  });

  return Response.json(
    {
      message: "Delete board successfully!",
      board: deletedBoard,
    },
    { status: 201 },
  );
}
