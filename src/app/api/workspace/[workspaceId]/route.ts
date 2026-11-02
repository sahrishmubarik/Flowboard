import {
  getWorkspaceById,
  updateWorkspaceName,
  deleteWorkspace,
} from "@/services/workspace";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    return await getWorkspaceById(workspaceId);
  } catch (error) {
    return handleRouteError(error, "GET_WORKSPACE_ERROR:");
  }
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
    return handleRouteError(error, "WORKSPACE_UPDATE_ERROR:");
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
    return handleRouteError(error, "WORKSPACE_UPDATE_ERROR:");
  }
}
