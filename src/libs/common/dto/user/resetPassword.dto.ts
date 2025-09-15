import { z } from 'zod';
import { SafeInfer } from './../../../../types/zod';

export const ResetPasswordSchema = z.object({
  token: z.string().nonempty('Token é obrigatório'),
  newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type ResetPasswordDTO = SafeInfer<typeof ResetPasswordSchema>;
