import { z } from 'zod';

export const AuthUserSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  nickname: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type AuthUserDTO = z.infer<typeof AuthUserSchema>;
