import { NextResponse } from "next/server";
import { createCard, getBoardCard } from "@/services/card";
import { AppError } from "@/lib/errors/AppError";

type cardBody = {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: string;
  sprintId: string;
  listId: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: cardBody = await request.json();

    const {
      title,
      description,
      startDate,
      dueDate,
      priority,
      sprintId,
      listId,
    } = body;
    return await createCard(
      boardId,
      title,
      description,
      startDate,
      dueDate,
      priority,
      sprintId,
      listId,
    );
  } catch (error) {
    console.error("CREATE_CARD_ERROR:", error);

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

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      boardId: string;
    }>;
  },
) {
  try {
    const { boardId } = await params;

    /*
     * GET request:
     * sprintId comes from the query string.
     *
     * Example:
     * /card?sprintId=88ddbb34-...
     */
    const { searchParams } = new URL(request.url);

    const sprintId = searchParams.get("sprintId");

    if (!sprintId) {
      return NextResponse.json(
        {
          message: "sprintId is required",
          cards: [],
        },
        { status: 400 },
      );
    }

    return await getBoardCard(boardId, sprintId);
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
