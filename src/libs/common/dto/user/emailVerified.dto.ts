import { z } from 'zod';

export const EmailVerificationSchema = z.object({
  id: z.number(),
  token: z.string(),
  userId: z.number(),
  expiresAt: z.date(),
  verified: z.boolean(),
  createdAt: z.date(),
});

export type EmailVerification = z.infer<typeof EmailVerificationSchema>;
