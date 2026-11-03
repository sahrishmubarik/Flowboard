import { NextResponse } from "next/server";
import {
  createSprint,
  getBoardSprint,
  updateSprintStatus,
  updateSprintDetails,
  deleteSprint,
} from "@/services/sprint";
import { handleRouteError } from "@/lib/errors/handleRouteError";
type sprintBody = {
  sprintName: string;
  goal: string;
  startDate: string;
  endDate: string;
  carryUnresolvedTickets: boolean;
};
export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: sprintBody = await request.json();

    const { sprintName, startDate, endDate, goal, carryUnresolvedTickets } =
      body;
    return await createSprint(
      boardId,
      sprintName,
      startDate,
      endDate,
      goal,
      carryUnresolvedTickets,
    );
  } catch (error) {
    return handleRouteError(error, "CREATE_SPRINT_ERROR:");
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
    return handleRouteError(error, "GET_BOARD_SPRINT_LIST_ERROR:");
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
    return handleRouteError(error, "UPDATE_SPRINT_STATUS_ERROR:");
  }
}
type UpdateSprintDetailsBody = {
  sprintId: string;
  sprintName: string;
  goal: string;
  startDate: string;
  endDate: string;
  carryUnresolvedTickets: boolean;
};
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: UpdateSprintDetailsBody = await request.json();
    const {
      sprintId,
      sprintName,
      goal,
      startDate,
      endDate,
      carryUnresolvedTickets,
    } = body;

    if (
      !sprintId ||
      !sprintName?.trim() ||
      !startDate ||
      !endDate ||
      typeof goal !== "string" ||
      typeof carryUnresolvedTickets !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid sprint details" },
        { status: 400 },
      );
    }

    return await updateSprintDetails(boardId, sprintId, {
      sprintName: sprintName.trim(),
      goal,
      startDate,
      endDate,
      carryUnresolvedTickets,
    });
  } catch (error) {
    return handleRouteError(error, "UPDATE_SPRINT_DETAILS_ERROR:");
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { boardId } = await params;
    const body: { sprintId: string } = await request.json();

    if (!body.sprintId) {
      return NextResponse.json(
        { message: "sprintId is required" },
        { status: 400 },
      );
    }

    return await deleteSprint(boardId, body.sprintId);
  } catch (error) {
    return handleRouteError(error, "DELETE_SPRINT_ERROR:");
  }
}
