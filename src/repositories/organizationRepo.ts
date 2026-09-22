import { db } from "@/db";
import { eq, and } from "drizzle-orm";
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
      .innerJoin(
        workspace,
        eq(organizationMembers.organizationId, workspace.id),
      )
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
        eq(organizationMembers.organizationId, workspace.id),
      )
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(workspace.id, workspaceId),
        ),
      );

    return workspaceData;
  },
  /* get workspace by id */
  async findById(workspaceId) {
    const [workspaceData] = await db
      .select({
        id: workspace.id,
        workspaceName: workspace.workspaceName,
        createdBy: workspace.createdBy,
        createdAt: workspace.createdAt,
      })
      .from(workspace)
      .where(eq(workspace.id, workspaceId));
    return workspaceData;
  },
  async create(transaction: typeof db, { workspaceName, createdBy }) {
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
  async updateWorkspaceName(
    workspaceId: string,
    workspaceName: string,
  ) {
    const [updatedWorkspace] = await db
      .update(workspace)
      .set({
        workspaceName,
      })
      .where(eq(workspace.id, workspaceId))
      .returning();

    return updatedWorkspace;
  },
 
    async deleteWorkspace(workspaceId: string) {
  const [deletedWorkspace] = await db
    .delete(workspace)
    .where(eq(workspace.id, workspaceId))
    .returning({
      id: workspace.id,
      workspaceName: workspace.workspaceName,
    });

  return deletedWorkspace;

  },
};
