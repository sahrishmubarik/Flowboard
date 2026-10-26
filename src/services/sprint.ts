import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireBoardRole } from "@/lib/middleware/boardPermission";
import { SprintRepo } from "@/repositories/sprintRepo";
import { NextResponse } from "next/server";

export async function createSprint(
  boardId: string,
  sprintName: string,
  startDate: string,
  endDate: string,
  goal: string,
  carryUnresolvedTickets: boolean,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const userId = user.userId;

  await requireBoardRole(userId, boardId, ["owner", "admin"]);

  const sprint = await SprintRepo.create(
    boardId,
    sprintName,
    startDate,
    endDate,
    goal,
    userId,
    carryUnresolvedTickets,
  );

  return NextResponse.json(
    {
      message: "Sprint created successfully!",
      sprint,
    },
    {
      status: 201,
    },
  );
}

export async function getBoardSprint(boardId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const userId = user.userId;

  await requireBoardRole(userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  const sprints = await SprintRepo.getByBoardId(boardId);

  return NextResponse.json(
    {
      message: "Sprints fetched successfully!",
      sprints,
    },
    {
      status: 200,
    },
  );
}

export async function updateSprintStatus(boardId: string, sprintId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const userId = user.userId;

  await requireBoardRole(userId, boardId, [
    "owner",
    "admin",
    "manager",
    "member",
  ]);

  const sprint = await SprintRepo.updateStatus(sprintId, boardId, userId);

  return NextResponse.json(
    {
      message: "Sprint status updated successfully!",
      sprint,
    },
    {
      status: 200,
    },
  );
}

export async function updateSprintDetails(
  boardId: string,
  sprintId: string,
  input: {
    sprintName: string;
    goal: string;
    startDate: string;
    endDate: string;
    carryUnresolvedTickets: boolean;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 401);
  }

  await requireBoardRole(user.userId, boardId, ["owner", "admin"]);

  const sprint = await SprintRepo.updateDetails(
    sprintId,
    boardId,
    user.userId,
    input,
  );

  return NextResponse.json(
    {
      message: "Sprint updated successfully!",
      sprint,
    },
    { status: 200 },
  );
}

export async function deleteSprint(boardId: string, sprintId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 401);
  }

  await requireBoardRole(user.userId, boardId, ["owner", "admin"]);

  const sprint = await SprintRepo.deleteSprint(sprintId, boardId, user.userId);

  return NextResponse.json(
    {
      message: "Sprint deleted successfully!",
      sprint,
    },
    { status: 200 },
  );
}
