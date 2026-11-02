import { createCardComment, getCardComments } from "@/services/CardComments";
import { handleRouteError } from "@/lib/errors/handleRouteError";

type commitBody = {
  description: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  try {
    const { boardId, cardId } = await params;
    const body: commitBody = await request.json();

    const { description } = body;

    return await createCardComment(boardId, cardId, description);
  } catch (error) {
    return handleRouteError(error, "CREATE_CARD_COMMIT_ERROR:");
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
      cardId: string;
    }>;
  },
) {
  try {
    const { boardId, cardId } = await params;

    return await getCardComments(boardId, cardId);
  } catch (error) {
    return handleRouteError(error, "GET_CARD_COMMENTS_ERROR:");
  }
}
