import { NextResponse } from "next/server";
import {
  getBoardListByListId,
  updateListName,
  deleteListById,
} from "@/services/boardList";
import { AppError } from "@/lib/errors/AppError";

type getListByIdBody = {
  listId: string;
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: getListByIdBody = await request.json();
    const { listId } = body;
    return await getBoardListByListId(boardId, listId);
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
type UpdateListBody = {
  listId: string;
  listName: string;
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: UpdateListBody = await request.json();
    const { listId, listName } = body;
    return await updateListName(boardId, listId, listName);
  } catch (error) {
    console.error("UPDATE_BOARD_LIST_NAME_ERROR:", error);

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
type DeleteListBody = {
  listId: string;
};
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: DeleteListBody = await request.json();
    const { listId } = body;
    return await deleteListById(boardId, listId);
  } catch (error) {
    console.error("BOARD_LIST_DELETE_ERROR:", error);

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
