import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';
import { Role } from '@prisma/client';

export const JwtPayloadSchema = z.object({
  sub: z.number(),
  email: z.string().email().optional(),
  nickname: z.string().optional(),
  role: z.nativeEnum(Role),
});

export type JwtPayload = SafeInfer<typeof JwtPayloadSchema>;
