import { z } from 'zod';
import { CreateAddressDto } from './create-address.dto';

export const CreateClientDataSchema = z.object({
  gender: z.string().min(1, 'Gender is required'),
  cpf: z.string().min(1, 'CPF is required'),
  image: z.string().min(1, 'Image is required'),
  phone: z.string().min(1, 'Phone is required.'),
  userId: z.number(),
  address: CreateAddressDto.optional(),
});

export type CreateClientDataDTO = z.infer<typeof CreateClientDataSchema>;
