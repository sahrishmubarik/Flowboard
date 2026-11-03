import { markNotificationRead } from "@/services/notificationService";
import { handleRouteError } from "@/lib/errors/handleRouteError";

type RouteParams = {
  params: Promise<{ notificationId: string }>;
};

// PATCH /api/notifications/:notificationId — mark one notification as read
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { notificationId } = await params;

    return await markNotificationRead(notificationId);
  } catch (error) {
    return handleRouteError(error, "MARK_NOTIFICATION_READ_ERROR:");
  }
}
