import { NextResponse } from "next/server";
import { getBoardById, updateBoardName, deleteBoard,inviteMemberInBoard } from "@/services/board";
import { AppError } from "@/lib/errors/AppError";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;

  return getBoardById(boardId);
}
type UpdateBoardBody = {
  boardName: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;

    const body: UpdateBoardBody = await request.json();

    const { boardName } = body;

    return await updateBoardName(boardId, boardName);
  } catch (error) {
    console.error("BOARD_UPDATE_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;

   

    return await deleteBoard(boardId);
  } catch (error) {
    console.error("BOARD_DELETE_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
type InviteBoardMemberBody = {
  email: string;
  userId?: string;
  role: "admin" | "member" | "manager";
};
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      boardId: string;
    }>;
  },
) {
  try {
    const { workspaceId, boardId } = await params;

    const body: InviteBoardMemberBody = await request.json();

    const { userId, email, role } = body;
    return await inviteMemberInBoard(
      workspaceId,
      boardId,
      userId,
      email
      ,role,
    );
  }
catch (error) {
    console.error("INVITE_MEMBER_IN_BOARD_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}