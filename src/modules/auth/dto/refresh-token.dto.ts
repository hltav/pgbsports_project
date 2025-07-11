import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().nonempty(),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
