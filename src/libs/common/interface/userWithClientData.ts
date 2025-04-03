import { User } from '@prisma/client';
import { Address } from './address.interface';

export interface UserWithClientData extends User {
  clientData: {
    id?: number;
    gender?: string;
    cpf?: string;
    image?: string;
    userId: number;
    address?: Address | null;
  } | null;
}
