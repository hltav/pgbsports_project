import { Address } from './address.interface';
import { User } from './user.interface';

export interface ClientData {
  id: number;
  gender: string;
  cpf: string;
  image: string;
  userId: number;
  user?: User;
  address?: Address | null;
}

export interface UpdateClientData {
  id: number;
  gender?: string;
  cpf?: string;
  image?: string;
  userId: number;
  user?: User;
  address?: Address;
}
