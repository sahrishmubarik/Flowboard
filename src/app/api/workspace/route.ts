import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { createWorkspace, getWorkspace } from "@/services/workspace";

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
    console.error("AUTH_API_ERROR:", error);

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
export async function GET() {
  try {
    return await getWorkspace();
  } catch (error) {
    console.error("WORKSPACE_GET_API_ERROR:", error);
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
