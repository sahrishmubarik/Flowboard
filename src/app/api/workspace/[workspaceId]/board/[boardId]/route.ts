import { getBoardById, updateBoardName, deleteBoard } from "@/services/board";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    const { boardId } = await params;

    return await getBoardById(boardId);
  } catch (error) {
    return handleRouteError(error, "GET_BOARD_ERROR:");
  }
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
    return handleRouteError(error, "BOARD_UPDATE_ERROR:");
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
    return handleRouteError(error, "BOARD_DELETE_ERROR:");
  }
}
// type InviteBoardMemberBody = {
//   email: string;
//   userId?: string;
//   role: "admin" | "member" | "manager";
// };
// export async function POST(
//   request: Request,
//   {
//     params,
//   }: {
//     params: Promise<{
//       workspaceId: string;
//       boardId: string;
//     }>;
//   },
// ) {
//   try {
//     const { workspaceId, boardId } = await params;

//     const body: InviteBoardMemberBody = await request.json();

//     const { userId, email, role } = body;
//     return await inviteMemberInBoard(
//       workspaceId,
//       boardId,
//       userId,
//       email
//       ,role,
//     );
//   }
// catch (error) {
//     console.error("INVITE_MEMBER_IN_BOARD_ERROR:", error);

//     if (error instanceof AppError) {
//       return NextResponse.json(
//         { message: error.message },
//         { status: error.statusCode },
//       );
//     }

//     return NextResponse.json(
//       { message: "Internal server error. Please try again." },
//       { status: 500 },
//     );
//   }
// }
