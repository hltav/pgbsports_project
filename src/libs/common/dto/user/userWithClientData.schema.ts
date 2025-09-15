import { z } from 'zod';
import { Role } from '@prisma/client';
import { AddressSchema } from '../../../../modules/client-data/dto/address.schema';
import { SafeInfer } from '../../../../types/zod';

export const ClientDataSchema = z.object({
  id: z.number().optional(),
  gender: z.string().optional(),
  cpf: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  userId: z.number(),
  address: AddressSchema.optional().nullable(),
});

export const UserWithClientDataSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  nickname: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.nativeEnum(Role),
  searchableEmailHash: z.string(),
  refreshToken: z.string().nullable().optional(),
  clientData: ClientDataSchema.nullable(),
});

export type UserWithClientData = SafeInfer<typeof UserWithClientDataSchema>;
