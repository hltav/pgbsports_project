import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().nonempty(),
});

export type RefreshTokenDTO = SafeInfer<typeof RefreshTokenSchema>;
