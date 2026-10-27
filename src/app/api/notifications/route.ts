import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors/AppError";
import {
  getMyNotifications,
  markAllNotificationsRead,
} from "@/services/notificationService";

function errorResponse(error: unknown, label: string) {
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

  console.error(label, error);

  return NextResponse.json(
    { message: "Internal server error. Please try again." },
    { status: 500 },
  );
}

// GET /api/notifications?limit=20&cursor=... — the current user's notifications
export async function GET(request: NextRequest) {
  try {
    return await getMyNotifications(request.nextUrl.searchParams);
  } catch (error) {
    return errorResponse(error, "GET_NOTIFICATIONS_ERROR:");
  }
}

// PATCH /api/notifications { before } — mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    return await markAllNotificationsRead(body);
  } catch (error) {
    return errorResponse(error, "MARK_ALL_NOTIFICATIONS_READ_ERROR:");
  }
}
