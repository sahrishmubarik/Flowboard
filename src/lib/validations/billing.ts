import { z } from "zod";

export const checkoutValidation = z.object({
  plan: z.enum(["PRO", "BUSINESS"], {
    message: "Please choose a valid plan.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutValidation>;
