import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import {
  deleteMemberFormBoard,
  getBoardMembers,
  inviteMemberInBoard,
} from "@/services/boardMember";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { workspaceId, boardId } = await params;

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "5");

    return await getBoardMembers(boardId, page, limit);
  } catch (error) {
    console.error("GET_BOARD_MEMBER_DETAIL_API_ERROR:", error);

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
/* invite member */
type InviteMemberInBoard = {
  userId: string;
  email: string;
  role: string;
};
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { workspaceId, boardId } = await params;
    const body: InviteMemberInBoard = await request.json();
    const { userId, email, role } = body;

    return await inviteMemberInBoard(workspaceId, boardId, userId, email, role);
  } catch (error) {
    console.error("INVITE_BOARD_MEMBER_DETAIL_API_ERROR:", error);

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
/* remove member in board */
type DeleteMemberBody = {
  userId: string;
};
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; boardId: string }> },
) {
  try {
    const { workspaceId, boardId } = await params;
    const body: DeleteMemberBody = await request.json();
    const { userId } = body;

    return await deleteMemberFormBoard(userId, boardId);
  } catch (error) {
    console.error("DELETE_BOARD_MEMBER_DETAIL_API_ERROR:", error);

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
