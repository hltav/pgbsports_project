import { CreateAddressDto, UpdateAddressDto } from './create-address.dto';

export class CreateClientDataDto {
  gender: string = '';
  cpf: string = '';
  image: string = '';
  userId!: number;
  address?: CreateAddressDto;
}

export class UpdateClientDataDto {
  gender?: string;
  cpf?: string;
  image?: string;
  userId?: number;
  address?: UpdateAddressDto;
}
