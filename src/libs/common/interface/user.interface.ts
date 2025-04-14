import { Role } from '@prisma/client';
import { ClientData } from './client-data.interface';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string | null;
  role: Role;
  clientData?: ClientData;
}
