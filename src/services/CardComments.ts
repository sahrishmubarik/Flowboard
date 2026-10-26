import { getCurrentUser } from "@/lib/middleware/auth";
import { AppError } from "@/lib/errors/AppError";
import { BoardRepo } from "@/repositories/boardRepo";

import { CardRepo } from "@/repositories/cardRepo";
import { CommitRepo } from "@/repositories/cardCommitRepo";
import { NextResponse } from "next/server";

export async function createCardComment(
  boardId: string,
  cardId: string,
  description: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new AppError("Board not found", 404);
  }

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found", 404);
  }

  // const newCardCommit = await CommitRepo.createCardCommit(
  //   cardId,
  //   description,
  //   user.userId,
  // );
  const newCardCommit = await CommitRepo.createCardCommit(
    boardId,
    cardId,
    description,
    user.userId,
  );

  return NextResponse.json(
    {
      message: "Comment created successfully.",
      commit: newCardCommit,
    },
    { status: 201 },
  );
}
export async function getCardComments(boardId: string, cardId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }
  /* check board exist first */
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }
  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found", 404);
  }
  const cardCommitsDetails = await CommitRepo.getCommitByCardId(cardId);

  return NextResponse.json(
    {
      message: "Comments retrieved successfully.",
      commits: cardCommitsDetails,
    },
    { status: 200 },
  );
}
export async function getCardCommentByCommitId(
  boardId: string,
  cardId: string,
  commitId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }
  /* check board exist first */
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }
  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found", 404);
  }
  const cardCommitsDetails = await CommitRepo.getCardCommitDetail(
    cardId,
    commitId,
  );
  return NextResponse.json(
    {
      message: "Board cards retrieved successfully!",
      cards: cardCommitsDetails,
    },
    {
      status: 200,
    },
  );
}
export async function updateCardCommentByCommitId(
  boardId: string,
  cardId: string,
  commitId: string,
  description: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (!boardDetails) {
    throw new AppError("Board not found", 404);
  }

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (!cardDetails) {
    throw new AppError("Card not found", 404);
  }

  if (!description?.trim()) {
    throw new AppError("Commit description is required", 400);
  }

  const updatedCommit = await CommitRepo.updateCommitById(
    boardId,
    cardId,
    commitId,
    description.trim(),
    user.userId,
  );

  return NextResponse.json({
    message: "Commit description updated successfully.",
    commit: updatedCommit,
  });
}
export async function deleteCardCommentByCommitId(
  boardId: string,
  cardId: string,
  commitId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Unauthorized", 401);
  }
  /* check board exist first */
  const boardDetails = await BoardRepo.getBoardById(boardId);

  if (boardDetails.length === 0) {
    throw new Error("Board not found");
  }
  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (cardDetails.length === 0) {
    throw new AppError("Card not found", 404);
  }
  // const deleteCardCommit = await CommitRepo.deleteCommitById(cardId, commitId);
  const deleteCardCommit = await CommitRepo.deleteCommitById(
    boardId,
    cardId,
    commitId,
    user.userId,
  );
  return NextResponse.json(
    {
      message: "Board cards retrieved successfully!",
      cards: deleteCardCommit,
    },
    {
      status: 200,
    },
  );
}
