import { z } from 'zod';
import { Role } from '@prisma/client';
import { SafeInfer } from './../../../types/zod';

export const ChangeUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type ChangeUserRoleDto = SafeInfer<typeof ChangeUserRoleSchema>;
