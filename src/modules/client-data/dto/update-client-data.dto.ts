import { z } from 'zod';
import { UpdateAddressDto } from './update-address.dto';
import { SafeInfer } from './../../../types/zod';

export const UpdateClientDataSchema = z.object({
  gender: z.string().optional(),
  cpf: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  userId: z.number().optional(),
  address: UpdateAddressDto.optional(),
});

export type UpdateClientDataDTO = SafeInfer<typeof UpdateClientDataSchema>;
