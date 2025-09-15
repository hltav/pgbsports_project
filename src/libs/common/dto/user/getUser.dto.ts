import { Role } from '@prisma/client';
import { z } from 'zod';
import { SafeInfer } from '../../../../types/zod';

export const AddressSchema = z.object({
  id: z.number().optional(),
  direction: z.string().nullable().optional(),
  houseNumber: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  clientDataId: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ClientDataSchema = z.object({
  id: z.number().optional(),
  gender: z.string().optional(),
  cpf: z.string().optional(),
  image: z.string().optional(),
  phone: z.string().optional(),
  userId: z.number().optional(),
  address: AddressSchema.nullable().optional(),
});

export const GetUserSchema = z.object({
  id: z.number(),
  firstname: z.string().default(''),
  lastname: z.string().default(''),
  nickname: z.string().default(''),
  email: z.string().email(),
  role: z.nativeEnum(Role).optional(),
  clientData: ClientDataSchema.nullable().optional(),
  refreshToken: z.string().nullable().optional(),
});

export type GetUserDTO = SafeInfer<typeof GetUserSchema>;
