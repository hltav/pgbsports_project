import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.number(),
  email: z.string().email().optional(),
  nickname: z.string().optional(),
  role: z.string().optional(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
