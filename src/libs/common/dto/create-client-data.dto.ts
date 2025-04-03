import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreateClientDataDto {
  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  address?: CreateAddressDto;
}

export class UpdateClientDataDto {
  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsOptional()
  address?: CreateAddressDto;
}
