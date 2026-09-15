
import { NextResponse } from "next/server";

import { createWorkspace, getWorkspace,
  } from "@/services/workspace";

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
            message: "Invalid authentication action.",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AUTH_API_ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  return getWorkspace(workspaceId);
}