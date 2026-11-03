import { NextRequest } from "next/server";

import {
  getMyNotifications,
  markAllNotificationsRead,
} from "@/services/notificationService";
import { handleRouteError } from "@/lib/errors/handleRouteError";

// GET /api/notifications?limit=20&cursor=...&unread=true — the current user's notifications
export async function GET(request: NextRequest) {
  try {
    return await getMyNotifications(request.nextUrl.searchParams);
  } catch (error) {
    return handleRouteError(error, "GET_NOTIFICATIONS_ERROR:");
  }
}

// PATCH /api/notifications { before } — mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    return await markAllNotificationsRead(body);
  } catch (error) {
    return handleRouteError(error, "MARK_ALL_NOTIFICATIONS_READ_ERROR:");
  }
}
