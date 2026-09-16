import { db } from "@/db";
import { organizationMembers } from "@/db/workspaceSchema";

export const organizationMemberRepo = {
  async create(
    transaction: typeof db,
    {
      organizationId,
      userId,
      role,
      assignedBy,
    }
  ) {
    const [row] = await transaction
      .insert(organizationMembers)
      .values({
        organizationId,
        userId,
        role,
        assignedBy,
      })
      .returning({
        id: organizationMembers.id,
      });

    return row;
  },
};