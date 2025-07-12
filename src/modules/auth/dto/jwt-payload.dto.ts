import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const JwtPayloadSchema = z.object({
  sub: z.number(),
  email: z.string().email().optional(),
  nickname: z.string().optional(),
  role: z.string().optional(),
});

export type JwtPayload = SafeInfer<typeof JwtPayloadSchema>;
