import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { BoardRepo } from "@/repositories/boardRepo";
import { AuditLogService } from "@/services/auditLogService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    // 1. Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("Unauthorized user", 401);
    }

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const boardId = searchParams.get("boardId");
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");

    if (!boardId) {
      throw new AppError("boardId is required", 400);
    }

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new AppError(
        "page must be >= 1 and limit must be between 1 and 100",
        400,
      );
    }

    // 3. Verify that the user has access to this board
    // getBoards already filters by workspaceId and userId.
    const { boards } = await BoardRepo.getBoards(workspaceId, user.userId);

    const selectedBoard = boards.find((board) => board.id === boardId);

    if (!selectedBoard) {
      throw new AppError("Board not found or access denied", 404);
    }

    // 4. Fetch paginated activity for this workspace and board
    const result = await AuditLogService.getByWorkspaceAndBoard(
      workspaceId,
      boardId,
      page,
      limit,
    );

    return NextResponse.json(
      {
        message: "Activity fetched successfully",
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_ACTIVITY_API_ERROR:", error);

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
