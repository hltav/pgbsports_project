import { Address, Role } from '@prisma/client';

export class CreateUserDTO {
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  password: string;
  role?: Role;
}

export class UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  nickname?: string;
  password?: string;
}

export class GetUserDTO {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  email: string;
  role?: Role;
  clientData?: {
    id: number;
    gender: string;
    cpf: string;
    image: string;
    userId: number;
    address?: Address | null; // 🔹 Adicione essa linha para permitir `address`
  } | null;
}
