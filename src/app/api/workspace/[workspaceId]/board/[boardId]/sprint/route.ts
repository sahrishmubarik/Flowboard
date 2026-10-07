import { NextResponse } from "next/server";
import {
  createSprint,
  getBoardSprint,
  updateSprintStatus,
} from "@/services/sprint";
import { AppError } from "@/lib/errors/AppError";

type sprintBody = {
  sprintName: string;
  goal: string;
  startDate: string;
  endDate: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: sprintBody = await request.json();

    const { sprintName, startDate, endDate, goal } = body;
    return await createSprint(boardId, sprintName, startDate, endDate, goal);
  } catch (error) {
    console.error("CREATE_SPRINT_ERROR:", error);

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
    return await getBoardSprint(boardId);
  } catch (error) {
    console.error("GET_BOARD_SPRINT_LIST_ERROR:", error);

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
type UpdateSprintStatusBody = {
  sprintId: string;
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: UpdateSprintStatusBody = await request.json();
    const { sprintId } = body;
    return await updateSprintStatus(boardId, sprintId);
  } catch (error) {
    console.error("UPDATE_SPRINT_STATUS_ERROR:", error);

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
