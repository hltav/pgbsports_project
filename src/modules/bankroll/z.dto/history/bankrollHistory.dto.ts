import { z } from 'zod';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import { HistoryTypeEnum } from './createHistories.dto';

const optionalNumberSchema = z.number().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();
const optionalDecimalSchema = decimalSchema.optional().nullable();

export const BankrollHistorySchema = z.object({
  id: z.number(),
  bankrollId: z.number(),
  type: HistoryTypeEnum,
  date: z.coerce.date(),

  balanceBefore: decimalSchema,
  balanceAfter: decimalSchema,
  amount: decimalSchema,
  unidValueBefore: decimalSchema,
  unidValueAfter: decimalSchema,

  eventId: optionalNumberSchema,
  description: optionalStringSchema,
  createdAt: z.coerce.date(), // ✅ corrigido

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

export type BankrollHistoryDTO = SafeInfer<typeof BankrollHistorySchema>;
