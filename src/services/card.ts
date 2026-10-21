import { getCurrentUser } from "@/lib/middleware/auth";
import { AppError } from "@/lib/errors/AppError";

import { BoardRepo } from "@/repositories/boardRepo";
import { SprintRepo } from "@/repositories/sprintRepo";
import { BoardListRepo } from "@/repositories/boardListRepo";
import { CardRepo } from "@/repositories/cardRepo";

import { updateCardDetailSchema } from "@/lib/validations/cardDetails";
import { NextResponse } from "next/server";

import { boardMemberRepo } from "@/repositories/boardMemberRepo";

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
  // 1. Validate request data.
  const parsed = updateCardDetailSchema.safeParse(body);

  if (!parsed.success) {
    throw new AppError(
      `Invalid card update data: ${parsed.error.message}`,
      400,
    );
  }

  const input = parsed.data;

  // 2. Authenticate the current user.
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  if (userId && userId !== user.userId) {
    throw new AppError("Unauthorized user", 401);
  }

  // 3. Verify that the board exists.
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  // 4. Verify that the card belongs to this board.

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found in this board", 404);
  }

  // 5. Perform the requested update.
  switch (input.action) {
    case "taskType": {
      const updatedCard = await CardRepo.updateCardFields(boardId, cardId, {
        taskType: input.type,
      });

      return NextResponse.json(
        {
          message: "Card type updated successfully",
          card: updatedCard,
        },
        { status: 200 },
      );
    }

    case "priority": {
      const updatedCard = await CardRepo.updateCardFields(boardId, cardId, {
        priority: input.priority,
      });

      return NextResponse.json(
        {
          message: "Card priority updated successfully",
          card: updatedCard,
        },
        { status: 200 },
      );
    }

    case "sprint": {
      const sprintIds = input.sprintId ?? [];

      for (const sprintId of sprintIds) {
        const sprint = await SprintRepo.getSprintById(sprintId);

        if (!sprint) {
          throw new AppError("Sprint not found", 404);
        }

        // Also verify that this sprint belongs to the card's board.
      }

      const updatedCard = sprintIds.length
        ? await CardRepo.updateCardSprint(boardId, cardId, sprintIds)
        : await CardRepo.removeCardSprints(boardId, cardId);

      if (!updatedCard) {
        throw new AppError("Card not found", 404);
      }

      return updatedCard;
    }
    case "estimateTime": {
      const updatedCard = await CardRepo.updateCardFields(boardId, cardId, {
        estimateTime:
          input.estimateTime === null ? null : String(input.estimateTime),
      });

      return NextResponse.json(
        {
          message: "Card estimated time updated successfully",
          card: updatedCard,
        },
        { status: 200 },
      );
    }

    case "spentTime": {
      const updatedCard = await CardRepo.updateCardFields(boardId, cardId, {
        spentTime: input.spentTime === null ? null : String(input.spentTime),
      });

      return NextResponse.json(
        {
          message: "Card spent time updated successfully",
          card: updatedCard,
        },
        { status: 200 },
      );
    }

    // case "spentTime": {
    //   const updatedCard = await CardRepo.updateCardFields(boardId, cardId, {
    //     spentTime: input.spentTime === null ? null : String(input.spentTime),
    //   });

    //   return NextResponse.json(
    //     {
    //       message: "Card spent time updated successfully",
    //       card: updatedCard,
    //     },
    //     { status: 200 },
    //   );
    // }

    // TODO: Implement assignedTo when card assignment is supported.

    case "assignedTo": {
      const assignedTo = input.assignedTo;

      // Check that the selected user is an active board member.
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

      const updatedCard = await CardRepo.assignCardToMember(
        boardId,
        cardId,
        assignedTo,
      );

      if (!updatedCard) {
        throw new AppError("Card not found", 404);
      }

      return NextResponse.json(
        {
          message:
            assignedTo === null
              ? "Card unassigned successfully"
              : "Card assigned successfully",
          card: updatedCard,
        },
        { status: 200 },
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

  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  // 4. Verify that the card belongs to this board.

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found in this board", 404);
  }
  const deletedCard = await CardRepo.DeleteCard(boardId, cardId);
  if (deletedCard.length === 0) {
    throw new AppError("Card not found in this board", 404);
  }

  return {
    message: "Card deleted successfully",
    card: deletedCard[0],
  };
}
