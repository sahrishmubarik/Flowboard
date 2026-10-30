import { z } from "zod";

export const listNotificationsValidation = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).optional(),
  // "true" lists only notifications that have not been read yet.
  unread: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const notificationIdValidation = z
  .string()
  .uuid("Invalid notification ID.");

export const markAllNotificationsReadValidation = z.object({
  // Only notifications created up to this time are marked as read.
  before: z.string().datetime("before must be an ISO date-time."),
});
