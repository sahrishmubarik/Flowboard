import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import { workspaceRepo } from "@/repositories/organizationRepo";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";
import {
  validateData,
  workspaceMemberRoleValidation,
} from "@/lib/validations/workspace";
export async function getWorkspaceMembers(
  workspaceId: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const workspaceData =
    await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }

  await requireWorkspaceRole(
    user.userId,
    workspaceId,
    ["owner", "admin"],
  );

  const members =
    await organizationMemberRepo.getByWorkspaceId(
      workspaceId,
    );

  return NextResponse.json(
    {
      message: "Workspace members fetched successfully.",
      members,
    },
    {
      status: 200,
    },
  );
}

export async function getWorkspaceMembersByRole(
  workspaceId: string,
  role: string,
) {
  const validation = validateData(
    workspaceMemberRoleValidation,
    role,
  );

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const workspaceData =
    await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }

  await requireWorkspaceRole(
    user.userId,
    workspaceId,
    ["owner", "admin", "manager", "member"],
  );

  const members =
    await organizationMemberRepo.getByWorkspaceIdAndRole(
      workspaceId,
      validation.data,
    );

  return NextResponse.json(
    {
      message: "Workspace members fetched successfully.",
      members,
    },
    { status: 200 },
  );
}