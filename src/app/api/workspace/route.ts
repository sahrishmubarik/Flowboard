import { NextResponse } from "next/server";
import { createWorkspace, getWorkspace } from "@/services/workspace";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { action } = body;

    switch (action) {
      case "create-workspace":
        return await createWorkspace(body);

      default:
        return NextResponse.json(
          {
            message: "Page not found",
          },
          { status: 404 },
        );
    }
  } catch (error) {
    return handleRouteError(error, "AUTH_API_ERROR:");
  }
}
export async function GET() {
  try {
    return await getWorkspace();
  } catch (error) {
    return handleRouteError(error, "WORKSPACE_GET_API_ERROR:");
  }
}
