import { createBoard, getBoardByWorkspaceId } from "@/services/board";
import { handleRouteError } from "@/lib/errors/handleRouteError";
type BoardName = {
  boardName: string;
};
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;
    const body: BoardName = await request.json();
    const { boardName } = body;
    return await createBoard(workspaceId, boardName);
  } catch (error) {
    return handleRouteError(error, "BOARD_API_ERROR:");
  }
}

/* get boards in specific workspace */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;
    return await getBoardByWorkspaceId(workspaceId);
  } catch (error) {
    return handleRouteError(error, "GET_BOARD_DETAIL_API_ERROR:");
  }
}
