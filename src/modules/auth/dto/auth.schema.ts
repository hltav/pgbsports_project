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

export type SchemaJwtPayload = z.infer<typeof JwtPayloadSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type AuthenticatedRequest = z.infer<typeof AuthenticatedRequestSchema> &
  Express.Request;
