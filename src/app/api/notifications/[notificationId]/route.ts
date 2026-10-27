import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { markNotificationRead } from "@/services/notificationService";

type RouteParams = {
  params: Promise<{ notificationId: string }>;
};

// PATCH /api/notifications/:notificationId — mark one notification as read
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { notificationId } = await params;

    return await markNotificationRead(notificationId);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("MARK_NOTIFICATION_READ_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
