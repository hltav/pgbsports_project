import { z } from 'zod';
import { decimalSchema } from '../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from '../../../../types/zod';
import { OperationType } from '@prisma/client';

export const HistoryTypeEnum = z.nativeEnum(OperationType);

const optionalNumberSchema = z.number().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();
const optionalDecimalSchema = decimalSchema.optional().nullable();

export const CreateBankrollHistorySchema = z.object({
  bankrollId: z.number(),
  type: HistoryTypeEnum,
  balanceBefore: decimalSchema,
  balanceAfter: decimalSchema,
  amount: decimalSchema,
  unidValueBefore: decimalSchema,
  unidValueAfter: decimalSchema,

  betId: optionalNumberSchema,
  description: optionalStringSchema,
});

export type CreateBankrollHistoryDTO = SafeInfer<
  typeof CreateBankrollHistorySchema
>;

export const GetBankrollHistorySchema = CreateBankrollHistorySchema.extend({
  id: z.number(),
  date: z.coerce.date(),
  bets: z
    .object({
      eventDescription: z.string(),
      stake: decimalSchema,
      odd: decimalSchema,
      potentialReturn: decimalSchema,
      actualReturn: optionalDecimalSchema,
    })
    .optional()
    .nullable(),
});

export type GetBankrollHistoryDTO = SafeInfer<typeof GetBankrollHistorySchema>;
