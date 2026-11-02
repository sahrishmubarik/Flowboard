import {
  getBoardCardDetail,
  moveBoardCard,
  updateCardDetail,
  deleteCardById,
} from "@/services/card";

import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/errors/handleRouteError";
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
    return handleRouteError(error, "GET_BOARD_CARD_ERROR:");
  }
}

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
    return handleRouteError(error, "PATCH_MOVE_BOARD_CARD_ERROR:");
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { boardId, cardId } = await params;

    if (!boardId || !cardId) {
      return NextResponse.json(
        { message: "boardId and cardId are required" },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();

    const result = await updateCardDetail(
      boardId,
      cardId,
      "", // The service obtains the authenticated user itself.
      body,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "Update_Card_Error:");
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { boardId, cardId } = await params;

    if (!boardId || !cardId) {
      return NextResponse.json(
        { message: "boardId and cardId are required" },
        { status: 400 },
      );
    }

    const result = await deleteCardById(boardId, cardId);

    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "DELETE_Card_Error:");
  }
}
