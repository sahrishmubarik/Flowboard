import { z } from "zod";

const uuidSchema = z.string().uuid();

const taskTypeSchema = z.enum(["bug", "feature", "task", "tbd"]);

const prioritySchema = z.enum([
  "normal",
  "show stopper",
  "critical",
  "major",
  "minor",
]);

const durationSchema = z.number().finite().min(0).max(1_000_000);

export const updateCardDetailSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("taskType"),
    type: taskTypeSchema,
  }),

  z.object({
    action: z.literal("priority"),
    priority: prioritySchema,
  }),
  z.object({
    action: z.literal("sprint"),
    sprintId: z.array(z.string().uuid()).nullable().optional(),
  }),

  z.object({
    action: z.literal("estimateTime"),
    estimateTime: durationSchema.nullable(),
  }),

  z.object({
    action: z.literal("spentTime"),
    spentTime: durationSchema.nullable(),
  }),

  z.object({
    action: z.literal("moveCard"),
    destinationListId: uuidSchema,
    position: z.number().int().min(1),
  }),
  z.object({
    action: z.literal("assignedTo"),
    assignedTo: z.string().uuid().nullable(),
  }),
]);

export type UpdateCardDetailInput = z.infer<typeof updateCardDetailSchema>;
