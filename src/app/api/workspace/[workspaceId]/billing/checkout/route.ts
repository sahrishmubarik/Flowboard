import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { startCheckout } from "@/services/billing";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const body = await request.json();

    return await startCheckout(workspaceId, body);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    console.error("BILLING_CHECKOUT_API_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
