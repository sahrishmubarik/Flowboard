import { z } from "zod";

// ==========================================
// 1. REUSABLE PRIMITIVE CORE RULES
// ==========================================
export const emailRule = z
  .string()
  .min(1, "Email is required")
  .email("Please provide a valid email address")
  .trim()
  .toLowerCase();

//Enhanced Password Rule with Secure Regular Expression
export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters long") // Increased to 8 for industry standard strength
  .max(100, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
  );

export const nameRule = z
  .string()
  .min(3, "Name must be at least 3 characters.")
  .max(50, "Name cannot exceed 50 characters.")
  .trim();

export const registerSchema = z
  .object({
    name: nameRule,
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirm password is required"), // Added Field
  })
  // Password Match Verification Constraint
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error exactly confirmPassword input point par allocate hoga
  });
export const registerRequestSchema = registerSchema.extend({
  redirect: z.string().nullable().optional(),
});
export const verifyEmailSchema = z.object({
  token: z.string(),
});
export const loginSchema = z.object({
  email: emailRule,
  password: passwordRule,
});
export const forgotPasswordSchema = z.object({
  email: emailRule,
});
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordRule,
    confirmPassword: z.string().min(1, "confirm password is required"),
  }) // Password Match Verification Constraint
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error exactly confirmPassword input point par allocate hoga
  });

// Infer TypeScript structural types
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterRequestInput = z.infer<typeof registerRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: passwordRule,

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
// ==========================================
// 3. GLOBAL STANDARDIZED VALIDATOR FUNCTION
// ==========================================
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((err) => err.message)
      .join(", ");
    return { success: false as const, error: errorMessage, data: null };
  }

  return { success: true as const, error: null, data: result.data };
}
