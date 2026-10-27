import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import { getMyUnreadCount } from "@/services/notificationService";

// GET /api/notifications/unread-count — polled by the notification bell
export async function GET() {
  try {
    return await getMyUnreadCount();
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("GET_UNREAD_NOTIFICATIONS_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
