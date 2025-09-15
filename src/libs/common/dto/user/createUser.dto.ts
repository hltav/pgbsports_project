import { z } from 'zod';
import { Role } from '@prisma/client';
import { SafeInfer } from '../../../../types/zod';
import { sensitiveEmail, sensitiveString } from '../../zod/sensitive';

export const CreateUserSchema = z.object({
  firstname: sensitiveString('Nome é obrigatório'),
  lastname: sensitiveString('Sobrenome é obrigatório'),
  nickname: sensitiveString('Nickname é obrigatório'),
  email: sensitiveEmail('Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50),
  role: z
    .nativeEnum(Role)
    .optional()
    .default('USER' as Role),
});

export type CreateUserDTO = SafeInfer<typeof CreateUserSchema>;
