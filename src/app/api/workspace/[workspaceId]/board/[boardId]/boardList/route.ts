import { NextResponse } from "next/server";
import {
  createBoardList,
  getBoardList,
  reorderBoardLists,
} from "@/services/boardList";
import { AppError } from "@/lib/errors/AppError";

type BoardListBody = {
  listName: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: BoardListBody = await request.json();
    const { listName } = body;
    return await createBoardList(boardId, listName);
  } catch (error) {
    console.error("CREATE_BOARD_LIST_ERROR:", error);

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
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    return await getBoardList(boardId);
  } catch (error) {
    console.error("GET_BOARD_LIST_ERROR:", error);

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

type ReorderBoardListsBody = {
  orderedIds: string[];
};

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ workspaceId: string; boardId: string }>;
  },
) {
  try {
    const { boardId } = await params;

    const body: ReorderBoardListsBody = await request.json();

    return await reorderBoardLists(boardId, body.orderedIds);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Failed to reorder board lists:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
