import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEventDTO {
  @IsNumber()
  @IsNotEmpty()
  bankId: number;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsString()
  @IsNotEmpty()
  market: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  result?: string; // Opcional, pois tem um valor padrão no schema
}

export class UpdateEventDTO {
  @IsNumber()
  @IsOptional()
  bankId?: number;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  event?: string;

  @IsString()
  @IsOptional()
  market?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  result?: string;
}

export class GetEventDTO {
  id: number;
  bankId: number;
  eventType: string;
  event: string;
  market: string;
  amount: number;
  result: string;
}
