import { NextResponse } from "next/server";
import { getBoardStats } from "@/services/board";
import { AppError } from "@/lib/errors/AppError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;

    return await getBoardStats(boardId);
  } catch (error) {
    console.error("GET_BOARD_STATS_ERROR:", error);

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
