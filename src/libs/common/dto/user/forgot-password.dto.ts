import { z } from 'zod';
import { SafeInfer } from './../../../../types/zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDTO = SafeInfer<typeof ForgotPasswordSchema>;
