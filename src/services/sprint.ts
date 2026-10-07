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

  await requireBoardRole(userId, boardId, ["owner", "admin"]);

  const sprint = await SprintRepo.updateStatus(sprintId, boardId);

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
