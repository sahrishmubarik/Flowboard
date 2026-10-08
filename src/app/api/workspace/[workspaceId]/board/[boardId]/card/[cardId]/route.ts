import { NextResponse } from "next/server";
import { getBoardCardDetail } from "@/services/card";
import { AppError } from "@/lib/errors/AppError";

type RouteParams = {
  params: Promise<{
    workspaceId: string;
    boardId: string;
    cardId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { workspaceId, boardId, cardId } = await params;

    if (!cardId) {
      return NextResponse.json(
        {
          message: "cardId is required",
        },
        {
          status: 400,
        },
      );
    }
    return await getBoardCardDetail(boardId, cardId);
  } catch (error) {
    console.error("GET_BOARD_SPRINT_CARD_ERROR:", error);

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
