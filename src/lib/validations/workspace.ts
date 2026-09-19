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
export const emailRule = z
  .string()
  .min(1, "Email is required")
  .email("Please provide a valid email address")
  .trim()
  .toLowerCase();

export const  inviteValidation=z.object({
  email:emailRule,
  role: z.enum([ "admin", "manager", "member", ]),
});
export type inviteInput=z.infer<typeof inviteValidation>;

export const acceptInvitationValidation = z.object({
  token: z
    .string()
    .min(1, "Invitation token is required."),
});

export const revokeInvitationValidation = z.object({
  email: emailRule,
});

export type revokeInvitationInput = z.infer<
  typeof revokeInvitationValidation
>;


export const workspaceMemberRoleValidation = z.enum([
  "owner",
  "admin",
  "manager",
  "member",
]);
export type WorkspaceMemberRole = z.infer<
  typeof workspaceMemberRoleValidation
>;
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