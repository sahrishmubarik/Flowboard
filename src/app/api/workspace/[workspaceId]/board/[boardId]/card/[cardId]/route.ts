import { NextResponse } from "next/server";
import { getBoardCardDetail, moveBoardCard } from "@/services/card";
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
    const { boardId, cardId } = await params;

    if (!cardId) {
      return NextResponse.json(
        { message: "cardId is required" },
        { status: 400 },
      );
    }

    return await getBoardCardDetail(boardId, cardId);
  } catch (error) {
    console.error("GET_BOARD_CARD_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}

/*
 * Move a card to another position or board list.
 *
 * Request body:
 * {
 *   "destinationListId": "list-uuid",
 *   "position": 2
 * }
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { boardId, cardId } = await params;

    if (!boardId || !cardId) {
      return NextResponse.json(
        { message: "boardId and cardId are required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { destinationListId, position } = body;

    if (typeof destinationListId !== "string" || !destinationListId.trim()) {
      return NextResponse.json(
        { message: "destinationListId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(position) || position < 1) {
      return NextResponse.json(
        { message: "position must be a positive integer" },
        { status: 400 },
      );
    }

    return await moveBoardCard(boardId, cardId, destinationListId, position);
  } catch (error) {
    console.error("PATCH_MOVE_BOARD_CARD_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
