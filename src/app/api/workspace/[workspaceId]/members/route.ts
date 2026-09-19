import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import {
  getWorkspaceMembers,
  getWorkspaceMembersByRole,
} from "@/services/workspaceMember";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (role) {
      return await getWorkspaceMembersByRole(workspaceId, role);
    }

    return await getWorkspaceMembers(workspaceId);
  } catch (error) {
    console.error("GET_WORKSPACE_MEMBERS_ERROR:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}