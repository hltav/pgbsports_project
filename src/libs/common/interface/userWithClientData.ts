import { User } from '@prisma/client';
import { AddressDTO } from '../../common/dto/client-data/address.schema';

export interface UserWithClientData extends User {
  clientData: {
    id?: number;
    gender?: string;
    cpf?: string;
    image?: string;
    userId: number;
    address?: AddressDTO | undefined;
  } | null;
}
