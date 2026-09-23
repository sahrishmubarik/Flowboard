
export const BoardRepo={
     async create( workspaceId: string, boardName:string, user_id:string) {
        const [invitation] = await db
          .select()
          .from(invitationSchema)
          .where(
            and(
              eq(invitationSchema.email, email),
              eq(invitationSchema.workspaceId, workspaceId),
              eq(invitationSchema.status, "PENDING"),
            ),
          );
    
        return invitation;
      },
}