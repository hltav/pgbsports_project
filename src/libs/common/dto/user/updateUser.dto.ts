import { z } from 'zod';
import { SafeInfer } from '../../../../types/zod';
import { Role } from '@prisma/client';

export const UpdateUserSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  nickname: z.string().optional(),
  password: z.string().min(6).optional(),
  refreshToken: z.string().nullable().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserDTO = SafeInfer<typeof UpdateUserSchema>;
