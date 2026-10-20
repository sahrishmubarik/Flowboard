import { NextResponse } from "next/server";
import { createCardComment, getCardComments } from "@/services/CardComments";
import { AppError } from "@/lib/errors/AppError";

type commitBody = {
  title: string;
  description: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> },
) {
  try {
    const { boardId, cardId } = await params;
    const body: commitBody = await request.json();

    const { title, description } = body;

    console.log(title);
    return await createCardComment(boardId, cardId, title, description);
  } catch (error) {
    console.error("CREATE_CARD_COMMIT_ERROR:", error);

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
      cardId: string;
    }>;
  },
) {
  try {
    const { boardId, cardId } = await params;

    return await getCardComments(boardId, cardId);
  } catch (error) {
    console.error("GET_CARD_COMMENTS_ERROR:", error);

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
