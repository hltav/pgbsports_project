import { Role } from '@prisma/client';

export class CreateUserDTO {
  firstname: string = '';
  lastname: string = '';
  nickname: string = '';
  email: string = '';
  password: string = '';
  role?: Role;
}

export class UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  nickname?: string;
  password?: string;
  refreshToken?: string | null;
}

export class GetUserDTO {
  id?: number;
  firstname: string = '';
  lastname: string = '';
  nickname: string = '';
  email: string = '';
  role?: Role;
  clientData?: {
    id?: number;
    gender?: string;
    cpf?: string;
    image?: string;
    userId?: number;
    address?: {
      id?: number;
      direction?: string | null;
      houseNumber?: number | null;
      neighborhood?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      clientDataId?: number;
      createdAt?: Date;
      updatedAt?: Date;
    } | null;
  } | null;
  refreshToken?: string | null;
}
