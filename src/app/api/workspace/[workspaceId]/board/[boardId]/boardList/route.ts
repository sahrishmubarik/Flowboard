import {
  createBoardList,
  getBoardList,
  reorderBoardLists,
} from "@/services/boardList";
import { handleRouteError } from "@/lib/errors/handleRouteError";

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
    return handleRouteError(error, "CREATE_BOARD_LIST_ERROR:");
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
    return handleRouteError(error, "GET_BOARD_LIST_ERROR:");
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
    return handleRouteError(
      error,
      "Failed to reorder board lists:",
      "Internal server error",
    );
  }
}
