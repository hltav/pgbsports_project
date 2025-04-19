import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email().optional(),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
