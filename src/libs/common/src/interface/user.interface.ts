import { Role } from '@prisma/client';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  password: string;
  accessToken?: string;
  role: Role;
}
