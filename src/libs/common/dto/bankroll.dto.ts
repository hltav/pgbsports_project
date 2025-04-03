import { IsString, IsNumber, IsOptional } from 'class-validator';

export class BankrollCreateDTO {
  @IsString()
  name: string;

  @IsNumber()
  balance: number;
}

export class BankrollUpdateDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;
}
export class GetBankrollDTO {
  id: number;
  name: string;
  balance: number;
}
