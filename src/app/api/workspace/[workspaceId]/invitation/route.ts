import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { inviteMember, acceptInvitation, revokeInvitation, getInvitationStatus } 
from "@/services/invitation";

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
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const body = await request.json();

    return await revokeInvitation(workspaceId, body);
  } catch (error) {
    console.error("REVOKE_INVITATION_API_ERROR:", error);

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
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
){
   try{
    const { workspaceId } = await params;
 
       const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;

    return await getInvitationStatus(
      workspaceId,
      page,
      limit,
    );
   }
   catch(error){
console.error("GET_INVITATION_STATUS_API_ERROR:", error);

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