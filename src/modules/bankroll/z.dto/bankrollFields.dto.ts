import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';

export const BankrollUpdateFieldsSchema = z.object({
  balance: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
  unidValue: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
  totalStaked: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
  totalReturned: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
  totalDeposited: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
  totalWithdrawn: z
    .union([decimalSchema, z.object({ increment: decimalSchema })])
    .optional(),
});

export type BankrollUpdateFields = Prisma.BankrollUpdateInput;
