
import { getCurrentUser } from "@/lib/middleware/auth";
import { db } from "@/db";
import { workspace } from "@/db/workspaceSchema";
import {
  validateData,
  workspaceValidation,
} from "@/lib/validations/workspace";
import {  eq, and } from "drizzle-orm";

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
 console.log("user:", user);
console.log("userId:", user.userId);
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

  console.log("workspaceName:", workspaceName);
  console.log("createdBy:", user.userId);

  const [newWorkspace] = await db
    .insert(workspace)
    .values({
      workspaceName: workspaceName,
      createdBy: user.userId,
    })
    .returning({
      id: workspace.id,
      workspaceName: workspace.workspaceName,
      createdBy: workspace.createdBy,
      createdAt: workspace.createdAt,
    });

  return Response.json(
    {
      message: "Workspace created successfully",
      workspace: newWorkspace,
    },
    {
      status: 201,
    }
  );
}
export async function getWorkspace(workspaceId: string) {
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

  if (!workspaceId) {
    return Response.json(
      {
        message: "Workspace ID is required",
      },
      {
        status: 400,
      }
    );
  }

  const [workspaceData] = await db
    .select({
      id: workspace.id,
      workspaceName: workspace.workspaceName,
    })
    .from(workspace)
    .where(
      and(
        eq(workspace.id, workspaceId),
        eq(workspace.createdBy, user.userId)
      )
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
      workspace: workspaceData,
    },
    {
      status: 200,
    }
  );
}