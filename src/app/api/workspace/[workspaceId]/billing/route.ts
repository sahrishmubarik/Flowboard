import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { getBillingOverview } from "@/services/billing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    return await getBillingOverview(workspaceId);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("BILLING_OVERVIEW_API_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
