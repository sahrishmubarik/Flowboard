import { z } from "zod";

export const nameRule = z
  .string()
  .min(3, "Name must be at least 3 characters.")
  .max(50, "Name cannot exceed 50 characters.")
  .trim();

export const workspaceValidation = z.object({
  workspaceName: nameRule,
});

export type workspaceInput = z.infer<typeof workspaceValidation>;

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((err) => err.message)
      .join(", ");

    return {
      success: false as const,
      error: errorMessage,
      data: null,
    };
  }

  return {
    success: true as const,
    error: null,
    data: result.data,
  };
}