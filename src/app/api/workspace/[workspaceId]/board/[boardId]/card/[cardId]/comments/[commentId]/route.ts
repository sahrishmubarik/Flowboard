import { NextResponse } from "next/server";
import {
  getCardCommentByCommitId,
  deleteCardCommentByCommitId,
} from "@/services/CardComments";
import { AppError } from "@/lib/errors/AppError";

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
    console.error("GET_CARD_COMMENT_COMMITID_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error. Please try again.",
      },
      {
        status: 500,
      },
    );
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
    console.error("DELETE_CARD_COMMENT_COMMITID_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
