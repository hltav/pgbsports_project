import { z } from 'zod';
import { Role } from '@prisma/client';
import { AddressSchema } from '../client-data/address.schema';

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
  refreshToken: z.string().nullable().optional(),
  clientData: ClientDataSchema.nullable(),
});

export type UserWithClientData = z.infer<typeof UserWithClientDataSchema>;
