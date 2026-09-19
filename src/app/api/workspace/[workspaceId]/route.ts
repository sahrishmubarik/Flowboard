import { NextResponse } from "next/server";
import { getWorkspaceById, updateWorkspaceName, deleteWorkspace } from "@/services/workspace";
import { AppError } from "@/lib/errors/AppError";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  return getWorkspaceById(workspaceId);
}
type UpdateWorkspaceBody = {
  workspaceName: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const body: UpdateWorkspaceBody = await request.json();

    const { workspaceName } = body;

    return await updateWorkspaceName(workspaceId, workspaceName);
  } catch (error) {
    console.error("WORKSPACE_UPDATE_ERROR:", error);

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
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

   

    return await deleteWorkspace(workspaceId);
  } catch (error) {
    console.error("WORKSPACE_UPDATE_ERROR:", error);

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