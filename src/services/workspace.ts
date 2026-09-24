import { getCurrentUser } from "@/lib/middleware/auth";
import { db } from "@/db";
import { AppError } from "@/lib/errors/AppError";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import {
  validateData,
  workspaceValidation,
} from "@/lib/validations/workspace";

import { workspaceRepo } from "@/repositories/organizationRepo";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";


export async function createWorkspace(body:{name:string}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const validation = validateData(workspaceValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { workspaceName } = validation.data;

  const userId = user.userId;
  console.log("Workspace user id ", userId);

  const result = await db.transaction(async (transaction) => {
    // 1. Create workspace
    const newWorkspace = await workspaceRepo.create(transaction, {
      workspaceName,
      createdBy: userId,
    });

    // 2. Create owner membership
    const organizationMember = await organizationMemberRepo.create(
      transaction,
      {
        organizationId: newWorkspace.id,
        userId,
        role: "owner",
        assignedBy: userId,
      },
    );

    return {
      workspace: newWorkspace,
      member: organizationMember,
    };
  });

  return Response.json(
    {
      message: "Workspace created successfully",
      workspace: result.workspace,
      member: result.member,
    },
    {
      status: 201,
    },
  );
}
export async function getWorkspace() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }
  const user_id = user?.userId;
  const workspaceData = await workspaceRepo.listForUser(user_id);
  if (!workspaceData) {
    throw new AppError("Workspace not found.", 401);
  }

  return Response.json(
    {
      message: "Fetched workspaces successfully",
     ...workspaceData,
    },

    {
      status: 200,
    },
  );
}
export async function getWorkspaceById(workspaceId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  const workspaceData = await workspaceRepo.getForUser(
    user.userId,
    workspaceId,
  );

  if (!workspaceData) {
    throw new AppError("Workspace not found", 404);
  }

  return Response.json(
    {
      message: "Fetched workspace successfully",
      workspace: workspaceData,
    },
    {
      status: 200,
    },
  );
}

export async function updateWorkspaceName(workspaceId:string, workspaceName:string){
    const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401); 
  }
const user_id=user.userId;
const validation = validateData(
    workspaceValidation,
    {workspaceName,}
  );

  if (!validation.success) {
   throw new AppError(validation.error, 400); 
  }

  const { workspaceName:validateWorkspaceName }  = validation.data;

await requireWorkspaceRole(user_id, workspaceId, ["owner"]);
const result= workspaceRepo.updateWorkspaceName(workspaceId,validateWorkspaceName);
return Response.json(
    {
      message: "Workspace Name update successfully",
      workspace: result,
      
    },
    {
      status: 201,
    }
  );
}

export async function deleteWorkspace(workspaceId:string){
    const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401); 
  }
const user_id=user.userId;
await requireWorkspaceRole(user_id, workspaceId, ["owner"]);
const result= workspaceRepo.deleteWorkspace(workspaceId);
return Response.json(
    {
      message: "Workspace DELETE successfully",
      workspace: result,
      
    },
    {
      status: 201,
    }
  );
}
