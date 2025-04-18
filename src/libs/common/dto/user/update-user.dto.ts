import { z } from 'zod';

export const UpdateUserSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  nickname: z.string().optional(),
  password: z.string().min(6).optional(),
  refreshToken: z.string().nullable().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
