import { z } from 'zod';
import { CreateAddressDto } from './create-address.dto';
import { SafeInfer } from './../../../types/zod';
import { sensitiveClientData } from './../../../libs/common/zod/sensitive';

export const CreateClientDataSchema = z.object({
  gender: sensitiveClientData('O campo "Gender" é obrigatório.'),
  cpf: sensitiveClientData('O campo "CPF" é obrigatório.'),
  image: sensitiveClientData('O campo "Image" é obrigatório.'),
  phone: sensitiveClientData('O campo "Phone" é obrigatório.'),
  userId: z.number(),
  address: CreateAddressDto.optional(),
});

export type CreateClientDataDTO = SafeInfer<typeof CreateClientDataSchema>;
