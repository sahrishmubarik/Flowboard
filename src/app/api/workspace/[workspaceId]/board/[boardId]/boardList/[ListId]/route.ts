import {
  getBoardListByListId,
  updateListName,
  deleteListById,
} from "@/services/boardList";
import { handleRouteError } from "@/lib/errors/handleRouteError";

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
    return handleRouteError(error, "GET_BOARD_LIST_ERROR:");
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
    return handleRouteError(error, "UPDATE_BOARD_LIST_NAME_ERROR:");
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
    return handleRouteError(error, "BOARD_LIST_DELETE_ERROR:");
  }
}
