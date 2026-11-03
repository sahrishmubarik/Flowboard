import {
  getCardCommentByCommitId,
  deleteCardCommentByCommitId,
  updateCardCommentByCommitId,
} from "@/services/CardComments";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      boardId: string;
      cardId: string;
      commentId: string;
    }>;
  },
) {
  try {
    const { boardId, cardId, commentId: commitId } = await params;

    return await getCardCommentByCommitId(boardId, cardId, commitId);
  } catch (error) {
    return handleRouteError(error, "GET_CARD_COMMENT_COMMITID_ERROR:");
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      boardId: string;
      cardId: string;
      commentId: string;
    }>;
  },
) {
  try {
    const { boardId, cardId, commentId: commitId } = await params;

    return await deleteCardCommentByCommitId(boardId, cardId, commitId);
  } catch (error) {
    return handleRouteError(error, "DELETE_CARD_COMMENT_COMMITID_ERROR:");
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      boardId: string;
      cardId: string;
      commentId: string;
    }>;
  },
) {
  try {
    const { boardId, cardId, commentId } = await params;
    const body: { description: string } = await request.json();

    return await updateCardCommentByCommitId(
      boardId,
      cardId,
      commentId,
      body.description,
    );
  } catch (error) {
    return handleRouteError(
      error,
      "UPDATE_COMMENT_ERROR:",
      "Failed to update commit description.",
    );
  }
}
