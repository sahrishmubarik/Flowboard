import { getMyUnreadCount } from "@/services/notificationService";
import { handleRouteError } from "@/lib/errors/handleRouteError";

// GET /api/notifications/unread-count — polled by the notification bell
export async function GET() {
  try {
    return await getMyUnreadCount();
  } catch (error) {
    return handleRouteError(error, "GET_UNREAD_NOTIFICATIONS_ERROR:");
  }
}
