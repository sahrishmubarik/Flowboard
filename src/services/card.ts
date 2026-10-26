import { getCurrentUser } from "@/lib/middleware/auth";
import { requireBoardRole } from "@/lib/middleware/boardPermission";
import { AppError } from "@/lib/errors/AppError";

import { BoardRepo } from "@/repositories/boardRepo";
import { SprintRepo } from "@/repositories/sprintRepo";
import { BoardListRepo } from "@/repositories/boardListRepo";
import { CardRepo } from "@/repositories/cardRepo";

import { updateCardDetailSchema } from "@/lib/validations/cardDetails";
import { NextResponse } from "next/server";

import { boardMemberRepo } from "@/repositories/boardMemberRepo";
import { db } from "@/db";
import { AuditLogService } from "@/services/auditLogService";

// async function updateCardFieldWithAudit(
//   boardId: string,
//   cardId: string,
//   performedBy: string,
//   workspaceId: string,
//   field: "title" | "description" | "startDate" | "dueDate",
//   action: string,
//   message: string,
//   previousValue: string | null,
//   newValue: string | null,
//   updates: Parameters<typeof CardRepo.updateCardFields>[2],
// ) {
//   return db.transaction(async (tx) => {
//     const updatedCard = await CardRepo.updateCardFields(
//       boardId,
//       cardId,
//       updates,
//       tx,
//     );

//     if (!updatedCard) {
//       throw new AppError("Card not found", 404);
//     }

//     if (previousValue !== newValue) {
//       await AuditLogService.record(
//         {
//           performedBy,
//           workspaceId,
//           boardId,
//           entityType: "card",
//           entityId: cardId,
//           action,
//           details: {
//             field,
//             previousValue,
//             newValue,
//           },
//         },
//         tx,
//       );
//     }

//     return NextResponse.json(
//       {
//         message,
//         card: updatedCard,
//       },
//       { status: 200 },
//     );
//   });
// }

export async function createCard(
  boardId: string,
  title: string,
  description: string,
  startDate: string,
  dueDate: string,
  priority: string,
  type: string,
  sprintId: string[],
  listId: string,
  assigneeId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  await requireBoardRole(user.userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  const user_id = user.userId;
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }
  /* check sprint exists */
  // const sprintDetails = await SprintRepo.getSprintById(sprintId);
  // if (sprintDetails.length === 0) {
  //   throw new Error("Sprint not found");
  // }
  for (const id of sprintId) {
    const sprintDetails = await SprintRepo.getSprintById(id);

    if (sprintDetails.length === 0) {
      throw new AppError("Sprint not found", 404);
    }

    // Confirm the sprint belongs to the current board.
    const belongsToBoard = sprintDetails.some(
      (item) => item.boardId === boardId,
    );

    if (!belongsToBoard) {
      throw new AppError("Sprint does not belong to this board", 400);
    }
  }
  /* check board list exists */
  const boardListDetails = await BoardListRepo.getListByListId(boardId, listId);
  if (boardListDetails.length === 0) {
    throw new Error("Board list not found");
  }

  if (assigneeId) {
    const assignee = await boardMemberRepo.findByUserAndBoard(
      assigneeId,
      boardId,
    );

    if (!assignee || assignee.status !== "ACTIVE") {
      throw new AppError(
        "Assignee must be an active member of this board",
        400,
      );
    }
  }

  /* now create card */
  const newCard = await CardRepo.createCard(
    boardId,
    title,
    description,
    startDate,
    dueDate,
    priority,
    type,
    sprintId,
    listId,
    assigneeId,
    user_id,
  );
  return NextResponse.json(
    {
      message: "Create card successfully! ",
      card: newCard,
    },
    {
      status: 201,
    },
  );
}

export async function getBoardCard(boardId: string, sprintId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  await requireBoardRole(user.userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);
  /* check board exist first */
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }
  /* check sprint exists */
  const sprintDetails = await SprintRepo.getSprintById(sprintId);
  if (sprintDetails.length === 0) {
    throw new Error("Sprint not found");
  }
  const boardCardDetails = await CardRepo.getBoardCardBySprintId(
    boardId,
    sprintId,
  );

  return NextResponse.json(
    {
      message: "Board cards retrieved successfully!",
      cards: boardCardDetails,
    },
    {
      status: 200,
    },
  );
}

/* get card by its id */
export async function getBoardCardDetail(boardId: string, cardId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  await requireBoardRole(user.userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  const boardDetails = await BoardRepo.getBoardById(boardId);
  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);
  if (cardDetails.length === 0) {
    throw new Error("Card not found");
  }
  console.log("cardDetails:", cardDetails);
  return NextResponse.json(
    {
      message: "Card details retrieved successfully!",
      card: cardDetails[0],
    },
    {
      status: 200,
    },
  );
}
export async function moveBoardCard(
  boardId: string,
  cardId: string,
  destinationListId: string,
  position: number,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  await requireBoardRole(user.userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  // 1. Check that the board exists.
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  // 2. Check that the card exists in this board.
  const cardDetails = await CardRepo.getCardForMove(boardId, cardId);

  if (!cardDetails) {
    throw new AppError("Card not found", 404);
  }

  // 3. Check that the destination list belongs to this board.
  const destinationList = await BoardListRepo.getListByListId(
    boardId,
    destinationListId,
  );

  if (destinationList.length === 0) {
    throw new AppError("Destination list not found", 404);
  }

  // 4. Move the card and recalculate affected positions.
  const movedCard = await CardRepo.moveCard(
    boardId,
    cardId,
    destinationListId,
    position,
    user.userId,
  );

  return NextResponse.json(
    {
      message: "Card moved successfully!",
      card: movedCard,
    },
    { status: 200 },
  );
}
/* Update card details */

export async function updateCardDetail(
  boardId: string,
  cardId: string,
  userId: string,
  body: unknown,
) {
  // 1. Validate request body.
  const parsed = updateCardDetailSchema.safeParse(body);

  if (!parsed.success) {
    throw new AppError(
      `Invalid card update data: ${parsed.error.message}`,
      400,
    );
  }

  const input = parsed.data;

  // 2. Authenticate user.
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  if (userId && userId !== user.userId) {
    throw new AppError("Unauthorized user", 401);
  }

  // Only board members can update cards.
  await requireBoardRole(user.userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  // 3. Verify board.
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  // 4. Verify card belongs to this board.
  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found in this board", 404);
  }

  const currentCard = cardDetails[0];
  const workspaceId = boardDetails[0].organizationId;

  // Reusable transaction for field updates + audit.
  async function updateFieldWithAudit(
    performedBy: string,
    field: string,
    action: string,
    message: string,
    previousValue: unknown,
    newValue: unknown,
    updates: Parameters<typeof CardRepo.updateCardFields>[2],
  ) {
    const updatedCard = await db.transaction(async (tx) => {
      const updated = await CardRepo.updateCardFields(
        boardId,
        cardId,
        updates,
        tx,
      );

      if (!updated) {
        throw new AppError("Card not found", 404);
      }

      if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
        await AuditLogService.record(
          {
            performedBy: performedBy,
            workspaceId,
            boardId,
            entityType: "card",
            entityId: cardId,
            action,
            details: {
              field,
              previousValue,
              newValue,
            },
          },
          tx,
        );
      }

      return updated;
    });

    return NextResponse.json(
      {
        message,
        card: updatedCard,
      },
      { status: 200 },
    );
  }
  console.log("Received card update:", {
    action: input.action,
    body,
  });

  // 5. Perform requested update.
  switch (input.action) {
    case "title": {
      return updateFieldWithAudit(
        user.userId,
        "title",
        "CARD_TITLE_UPDATED",
        "Card title updated successfully",
        currentCard.title,
        input.title,
        { title: input.title },
      );
    }

    case "description": {
      return updateFieldWithAudit(
        user.userId,
        "description",
        "CARD_DESCRIPTION_UPDATED",
        "Card description updated successfully",
        currentCard.description,
        input.description,
        { description: input.description },
      );
    }

    case "startDate": {
      const newDate = input.startDate ? new Date(input.startDate) : null;

      if (newDate && Number.isNaN(newDate.getTime())) {
        throw new AppError("Invalid start date", 400);
      }

      const oldDate = currentCard.startDate
        ? new Date(currentCard.startDate)
        : null;

      const oldValue =
        oldDate && !Number.isNaN(oldDate.getTime())
          ? oldDate.toISOString()
          : null;

      const newValue = newDate?.toISOString() ?? null;

      return updateFieldWithAudit(
        user.userId,
        "startDate",
        "CARD_START_DATE_UPDATED",
        "Card start date updated successfully",
        oldValue,
        newValue,
        { startDate: newDate },
      );
    }

    case "dueDate": {
      const newDate = input.dueDate ? new Date(input.dueDate) : null;

      if (newDate && Number.isNaN(newDate.getTime())) {
        throw new AppError("Invalid due date", 400);
      }

      const oldDate = currentCard.dueDate
        ? new Date(currentCard.dueDate)
        : null;

      const oldValue =
        oldDate && !Number.isNaN(oldDate.getTime())
          ? oldDate.toISOString()
          : null;

      const newValue = newDate?.toISOString() ?? null;

      return updateFieldWithAudit(
        user.userId,
        "dueDate",

        "CARD_DUE_DATE_UPDATED",
        "Card due date updated successfully",
        oldValue,
        newValue,
        { dueDate: newDate },
      );
    }

    case "taskType": {
      return updateFieldWithAudit(
        user.userId,
        "taskType",
        "CARD_TASK_TYPE_UPDATED",
        "Card type updated successfully",
        currentCard.type,
        input.type,
        { taskType: input.type },
      );
    }

    case "priority": {
      return updateFieldWithAudit(
        user.userId,
        "priority",
        "CARD_PRIORITY_UPDATED",
        "Card priority updated successfully",
        currentCard.priority,
        input.priority,
        { priority: input.priority },
      );
    }

    case "sprint": {
      const sprintIds = input.sprintId ?? [];

      // Validate each sprint and ensure it belongs to this board.
      for (const sprintId of sprintIds) {
        const sprintDetails = await SprintRepo.getSprintById(sprintId);

        if (sprintDetails.length === 0) {
          throw new AppError("Sprint not found", 404);
        }

        const belongsToBoard = sprintDetails.some(
          (item) => item.boardId === boardId,
        );

        if (!belongsToBoard) {
          throw new AppError("Sprint does not belong to this board", 400);
        }
      }

      const previousSprintIds: string[] = currentCard.sprintId ?? [];

      const updatedCard = await db.transaction(async (tx) => {
        const updated = sprintIds.length
          ? await CardRepo.updateCardSprint(boardId, cardId, sprintIds, tx)
          : await CardRepo.removeCardSprints(boardId, cardId, tx);

        if (!updated) {
          throw new AppError("Card not found", 404);
        }

        const newSprintIds: string[] = updated.sprintId ?? [];

        if (
          JSON.stringify([...previousSprintIds].sort()) !==
          JSON.stringify([...newSprintIds].sort())
        ) {
          await AuditLogService.record(
            {
              performedBy: user.userId,
              workspaceId,
              boardId,
              entityType: "card",
              entityId: cardId,
              action: "CARD_SPRINT_UPDATED",
              details: {
                previousValue: previousSprintIds,
                newValue: newSprintIds,
              },
            },
            tx,
          );
        }

        return updated;
      });

      return NextResponse.json(
        {
          message: "Card sprint updated successfully",
          card: updatedCard,
        },
        { status: 200 },
      );
    }

    case "estimateTime": {
      const newValue =
        input.estimateTime === null ? null : String(input.estimateTime);

      return updateFieldWithAudit(
        user.userId,
        "estimateTime",
        "CARD_ESTIMATE_TIME_UPDATED",
        "Card estimated time updated successfully",
        currentCard.estimateTime == null
          ? null
          : String(currentCard.estimateTime),
        newValue,
        { estimateTime: newValue },
      );
    }

    case "spentTime": {
      const newValue =
        input.spentTime === null ? null : String(input.spentTime);

      return updateFieldWithAudit(
        user.userId,
        "spentTime",
        "CARD_SPENT_TIME_UPDATED",
        "Card spent time updated successfully",
        currentCard.spentTime == null ? null : String(currentCard.spentTime),
        newValue,
        { spentTime: newValue },
      );
    }

    case "assignedTo": {
      const assignedTo = input.assignedTo;

      if (assignedTo !== null) {
        const members = await boardMemberRepo.getAllActiveBoardMember(boardId);

        const isActiveMember = members.some(
          (member) => member.userId === assignedTo,
        );

        if (!isActiveMember) {
          throw new AppError(
            "Selected user is not an active member of this board",
            400,
          );
        }
      }

      return updateFieldWithAudit(
        user.userId,
        "assignedTo",
        "CARD_ASSIGNEE_UPDATED",
        assignedTo === null
          ? "Card unassigned successfully"
          : "Card assigned successfully",
        currentCard.assignedTo ?? null,
        assignedTo,
        { assignedTo },
      );
    }

    default: {
      throw new AppError("Unsupported card update action", 400);
    }
  }
}

export async function deleteCardById(boardId: string, cardId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  await requireBoardRole(user.userId, boardId, ["owner", "admin", "manager"]);

  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  // 4. Verify that the card belongs to this board.

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found in this board", 404);
  }
  const deletedCard = await CardRepo.DeleteCard(boardId, cardId, user.userId);

  if (!deletedCard) {
    throw new AppError("Card not found", 404);
  }

  return NextResponse.json(
    {
      message: "Card deleted successfully",
      card: deletedCard,
    },
    { status: 200 },
  );
}
