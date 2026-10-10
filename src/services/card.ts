import { getCurrentUser } from "@/lib/middleware/auth";
import { AppError } from "@/lib/errors/AppError";

import { BoardRepo } from "@/repositories/boardRepo";
import { SprintRepo } from "@/repositories/sprintRepo";
import { BoardListRepo } from "@/repositories/boardListRepo";
import { CardRepo } from "@/repositories/cardRepo";
import { NextResponse } from "next/server";
export async function createCard(
  boardId: string,
  title: string,
  description: string,
  startDate: string,
  dueDate: string,
  priority: string,
  sprintId: string,
  listId: string,
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
  const sprintDetails = await SprintRepo.getSprintById(sprintId);
  if (sprintDetails.length === 0) {
    throw new Error("Sprint not found");
  }
  /* check board list exists */
  const boardListDetails = await BoardListRepo.getListByListId(boardId, listId);
  if (boardListDetails.length === 0) {
    throw new Error("Board list not found");
  }
  /* now create card */
  const newCard = await CardRepo.createCard(
    boardId,
    title,
    description,
    startDate,
    dueDate,
    priority,
    sprintId,
    listId,
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
