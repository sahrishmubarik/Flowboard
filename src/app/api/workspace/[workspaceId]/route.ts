
import { getWorkspaceById } from "@/services/workspace";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  return getWorkspaceById(workspaceId);
}

