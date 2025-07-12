import { SafeInfer } from './../../../types/zod';
import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.number().positive(),
  email: z.string().email(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const AuthenticatedUserSchema = z.object({
  id: z.number().positive(),
  email: z.string().email(),
});

export const AuthenticatedRequestSchema = z.object({
  user: AuthenticatedUserSchema,
});

export type SchemaJwtPayload = SafeInfer<typeof JwtPayloadSchema>;
export type AuthenticatedUser = SafeInfer<typeof AuthenticatedUserSchema>;
export type AuthenticatedRequest = SafeInfer<typeof AuthenticatedRequestSchema>;
