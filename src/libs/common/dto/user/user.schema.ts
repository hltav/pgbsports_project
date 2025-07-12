import { z } from 'zod';
import { ClientDataSchema } from '../../../../modules/client-data/dto/client-data.schema';
import { Role } from '@prisma/client';
import { EmailVerificationSchema } from './emailVerified.dto';
import { SafeInfer } from './../../../../types/zod';

export const UserSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  nickname: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  accessToken: z.string().optional(),
  refreshToken: z.string().nullable().optional(),
  role: z.nativeEnum(Role),
  clientData: ClientDataSchema.optional(),
  emailVerification: EmailVerificationSchema.optional(), // <- aqui!
});

export type User = SafeInfer<typeof UserSchema>;
