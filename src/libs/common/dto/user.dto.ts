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
      direction?: string;
      houseNumber?: number;
      neighborhood?: string;
      city?: string;
      state?: string;
      country?: string;
      clientDataId?: number; // 🔹 Torne `clientDataId` opcional
      createdAt?: Date;
      updatedAt?: Date;
    } | null;
  } | null;
  refreshToken?: string | null;
}
