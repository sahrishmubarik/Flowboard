import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import {
  getWorkspaceMembers,
  getWorkspaceMembersByRole,
  deactivateUserFromOrganization,
} from "@/services/workspaceMember";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");

    const limit = Number(searchParams.get("limit") ?? "5");

    const role = searchParams.get("role");

    if (role) {
      return await getWorkspaceMembersByRole(workspaceId, role, page, limit);
    }
    return await getWorkspaceMembers(workspaceId, page, limit);
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
type deActivatedUserBody = {
  userId: string;
};
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;
    const body: deActivatedUserBody = await request.json();
    const { userId } = body;
    return await deactivateUserFromOrganization(userId, workspaceId);
  } catch (error) {
    console.error("UPDATE_WORKSPACE_MEMBERS_DEACTIVATE_ERROR:", error);

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
