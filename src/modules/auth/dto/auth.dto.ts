import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const AuthUserSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  nickname: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type AuthUserDTO = SafeInfer<typeof AuthUserSchema>;
