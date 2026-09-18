import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { inviteMember, acceptInvitation } from "@/services/invitation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const body = await request.json();

    const { action } = body;

    switch (action) {
      case "invite-member":
        return await inviteMember(workspaceId, body);

      // case "pending-invitations":
      //   return await getPendingInvitations(workspaceId);

      case "accept-invitation": {
        const result = await acceptInvitation(workspaceId, body);

        return NextResponse.json(result, {
          status: 200,
        });
      }
      // case "revoke-invitation":
      //   return await revokeInvitation(workspaceId, body);

      default:
        return NextResponse.json(
          {
            message: "Invalid invitation action.",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("INVITATION_POST_API_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error. Please try again.",
      },
      { status: 500 },
    );
  }
}
