


import { db } from "@/db";
 import { eq , and} from "drizzle-orm"; 
import { workspace } from "@/db/workspaceSchema";
import { organizationMembers } from "@/db/workspaceSchema";
export const workspaceRepo = {
/* get all user workspaces */
  async listForUser(userId) {
    return db
      .select({
        workspaceId: workspace.id,
        workspaceName: workspace.workspaceName,
        role: organizationMembers.role,
        createdAt: workspace.createdAt,
      })
      .from(organizationMembers)
      .innerJoin(workspace, eq(organizationMembers.organizationId, workspace.id))
      .where(eq(organizationMembers.userId, userId));
  },
   async getForUser(userId, workspaceId) {
  const [workspaceData] = await db
    .select({
      workspaceId: workspace.id,
      workspaceName: workspace.workspaceName,
      role: organizationMembers.role,
      createdAt: workspace.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(
      workspace,
      eq(organizationMembers.organizationId, workspace.id)
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(workspace.id, workspaceId)
      )
    );

  return workspaceData;
},

  async create(
    transaction: typeof db,
    { workspaceName, createdBy }
  ) {
    const [row] = await transaction
      .insert(workspace)
      .values({
        workspaceName,
        createdBy,
      })
      .returning({
        id: workspace.id,
        workspaceName: workspace.workspaceName,
        createdBy: workspace.createdBy,
      });

    return row;
  },
};