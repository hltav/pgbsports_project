import { z } from 'zod';
import { UpdateAddressDto } from './update-address.dto';

export const UpdateClientDataSchema = z.object({
  gender: z.string().optional(),
  cpf: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  userId: z.number().optional(),
  address: UpdateAddressDto.optional(),
});

export type UpdateClientDataDTO = z.infer<typeof UpdateClientDataSchema>;
