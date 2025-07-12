import { z } from 'zod';
import { SafeInfer } from './../../../../types/zod';

export const EmailVerificationSchema = z.object({
  id: z.number(),
  token: z.string(),
  userId: z.number(),
  expiresAt: z.date(),
  verified: z.boolean(),
  createdAt: z.date(),
});

export type EmailVerification = SafeInfer<typeof EmailVerificationSchema>;
