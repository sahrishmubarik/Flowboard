import { getBoardStats } from "@/services/board";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;

    return await getBoardStats(boardId);
  } catch (error) {
    return handleRouteError(error, "GET_BOARD_STATS_ERROR:");
  }
}
