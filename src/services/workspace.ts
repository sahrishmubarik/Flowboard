
import { getCurrentUser } from "@/lib/middleware/auth";
import { db } from "@/db";

import { workspace } from "@/db/workspaceSchema";
import {
  validateData,
  workspaceValidation,
} from "@/lib/validations/workspace";
import {  eq, and } from "drizzle-orm";
import { workspaceRepo } from "@/repositories/organizationRepo";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";
export async function createWorkspace(body: unknown) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const validation = validateData(
    workspaceValidation,
    body
  );

  if (!validation.success) {
    return Response.json(
      {
        message: validation.error,
      },
      {
        status: 400,
      }
    );
  }

  const { workspaceName } = validation.data;

  const userId = user.userId;

  const result = await db.transaction(async (transaction) => {

    // 1. Create workspace
    const newWorkspace = await workspaceRepo.create(transaction, {
      workspaceName,
      createdBy: userId,
    });

    // 2. Create owner membership
    const organizationMember =
      await organizationMemberRepo.create(transaction, {
        organizationId: newWorkspace.id,
        userId,
        role: "owner",
        assignedBy: userId,
      });

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
    }
  );
}
export async function getWorkspace() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  console.log("user:", user);
  console.log("userId:", user.userId);
   const user_id=user.userId;
 

  const workspaceData = await workspaceRepo.listForUser(user_id);
  if (!workspaceData) {
    return Response.json(
      {
        message: "Workspace not found",
      },
      {
        status: 404,
      }
    );
  }

  return Response.json(
    {
      message: "Fetched workspaces successfully",
      workspace: workspaceData,
     
    },
 
    {
      status: 200,
    }
  );
}
export async function getWorkspaceById(workspaceId:string) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const workspaceData = await workspaceRepo.getForUser(
    user.userId,
    workspaceId
  );

  if (!workspaceData) {
    return Response.json(
      {
        message: "Workspace not found",
      },
      {
        status: 404,
      }
    );
  }

  return Response.json(
    {
      message: "Fetched workspace successfully",
      workspace: workspaceData,
    },
    {
      status: 200,
    }
  );
}