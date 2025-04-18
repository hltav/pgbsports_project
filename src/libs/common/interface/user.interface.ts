import { Role } from '@prisma/client';
import { ClientDataDTO } from '../../common/dto/client-data';

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
  clientData?: ClientDataDTO;
}
