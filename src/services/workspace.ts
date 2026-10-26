import { getCurrentUser } from "@/lib/middleware/auth";
import { db } from "@/db";
import { AppError } from "@/lib/errors/AppError";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import { validateData, workspaceValidation } from "@/lib/validations/workspace";

import { workspaceRepo } from "@/repositories/organizationRepo";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";
import { AuditLogService } from "@/services/auditLogService";
export async function createWorkspace(body: { name: string }) {
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

  // const result = await db.transaction(async (tx) => {
  //   const newWorkspace = await workspaceRepo.create(tx, {
  //     workspaceName,
  //     createdBy: userId,
  //   });

  //   const organizationMember = await organizationMemberRepo.create(tx, {
  //     organizationId: newWorkspace.id,
  //     userId,
  //     role: "owner",
  //     assignedBy: userId,
  //   });

  //   return {
  //     workspace: newWorkspace,
  //     member: organizationMember,
  //   };
  // });

  const result = await db.transaction(async (tx) => {
    const newWorkspace = await workspaceRepo.create(tx, {
      workspaceName,
      createdBy: userId,
    });

    const organizationMember = await organizationMemberRepo.create(tx, {
      organizationId: newWorkspace.id,
      userId,
      role: "owner",
      assignedBy: userId,
    });

    await AuditLogService.record(
      {
        performedBy: userId,
        workspaceId: newWorkspace.id,
        entityType: "workspace",
        entityId: newWorkspace.id,
        action: "WORKSPACE_CREATED",
        details: {
          workspaceName: newWorkspace.workspaceName,
          ownerId: userId,
          ownerRole: "owner",
        },
      },
      tx,
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

// export async function updateWorkspaceName(
//   workspaceId: string,
//   workspaceName: string,
// ) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user", 401);
//   }
//   const user_id = user.userId;
//   const validation = validateData(workspaceValidation, { workspaceName });

//   if (!validation.success) {
//     throw new AppError(validation.error, 400);
//   }

//   const { workspaceName: validateWorkspaceName } = validation.data;

//   await requireWorkspaceRole(user_id, workspaceId, ["owner"]);
//   const result = workspaceRepo.updateWorkspaceName(
//     workspaceId,
//     validateWorkspaceName,
//   );
//   return Response.json(
//     {
//       message: "Workspace Name update successfully",
//       workspace: result,
//     },
//     {
//       status: 201,
//     },
//   );
// }

export async function updateWorkspaceName(
  workspaceId: string,
  workspaceName: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  await requireWorkspaceRole(user.userId, workspaceId, ["owner"]);

  const validation = validateData(workspaceValidation, {
    workspaceName,
  });

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const newName = validation.data.workspaceName;

  const updatedWorkspace = await db.transaction(async (tx) => {
    const previousWorkspace = await workspaceRepo.findById(workspaceId, tx);

    if (!previousWorkspace) {
      throw new AppError("Workspace not found", 404);
    }

    if (previousWorkspace.workspaceName === newName) {
      return previousWorkspace;
    }

    const updated = await workspaceRepo.updateWorkspaceName(
      workspaceId,
      newName,
      tx,
    );

    if (!updated) {
      throw new AppError("Workspace update failed", 500);
    }

    await AuditLogService.record(
      {
        performedBy: user.userId,
        workspaceId,
        entityType: "workspace",
        entityId: workspaceId,
        action: "WORKSPACE_UPDATED",
        details: {
          field: "workspaceName",
          previousValue: previousWorkspace.workspaceName,
          newValue: updated.workspaceName,
        },
      },
      tx,
    );

    return updated;
  });

  return Response.json(
    {
      message: "Workspace name updated successfully",
      workspace: updatedWorkspace,
    },
    { status: 200 },
  );
}

// export async function deleteWorkspace(workspaceId: string) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user", 401);
//   }
//   const user_id = user.userId;
//   await requireWorkspaceRole(user_id, workspaceId, ["owner"]);
//   const result = workspaceRepo.deleteWorkspace(workspaceId);
//   return Response.json(
//     {
//       message: "Workspace DELETE successfully",
//       workspace: result,
//     },
//     {
//       status: 201,
//     },
//   );
// }

export async function deleteWorkspace(workspaceId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user", 401);
  }

  await requireWorkspaceRole(user.userId, workspaceId, ["owner"]);

  const deletedWorkspace = await db.transaction(async (tx) => {
    const existingWorkspace = await workspaceRepo.findById(workspaceId, tx);

    if (!existingWorkspace) {
      throw new AppError("Workspace not found", 404);
    }

    await AuditLogService.record(
      {
        performedBy: user.userId,
        workspaceId,
        entityType: "workspace",
        entityId: workspaceId,
        action: "WORKSPACE_DELETED",
        details: {
          workspaceName: existingWorkspace.workspaceName,
          createdBy: existingWorkspace.createdBy,
        },
      },
      tx,
    );

    const deleted = await workspaceRepo.deleteWorkspace(workspaceId, tx);

    if (!deleted) {
      throw new AppError("Workspace deletion failed", 500);
    }

    return deleted;
  });

  return Response.json(
    {
      message: "Workspace deleted successfully",
      workspace: deletedWorkspace,
    },
    { status: 200 },
  );
}
