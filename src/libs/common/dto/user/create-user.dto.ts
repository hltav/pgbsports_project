import { z } from 'zod';
import { Role } from '@prisma/client';
import { SafeInfer } from './../../../../types/zod';

export const CreateUserSchema = z.object({
  firstname: z.string().default(''),
  lastname: z.string().default(''),
  nickname: z.string().default(''),
  email: z.string().email(),
  password: z.string().min(6).max(12),
  role: z.nativeEnum(Role).optional(),
});

export type CreateUserDTO = SafeInfer<typeof CreateUserSchema>;
