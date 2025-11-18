import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../types/zod';

export const HistoryTypeEnum = z.enum([
  'DEPOSIT',
  'WITHDRAWAL',
  'BET_PLACED',
  'BET_WON',
  'BET_LOST',
  'BET_VOID',
  'BALANCE_ADJUSTMENT',
  'UNID_VALUE_CHANGE',
]);

const optionalDecimalSchema = decimalSchema.optional().nullable();
const optionalNumberSchema = z.number().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();

export const BankrollHistorySchema = z.object({
  id: z.number(),
  bankrollId: z.number(),
  date: z.coerce.date(),
  type: HistoryTypeEnum.or(z.string()),
  balanceBefore: decimalSchema,
  balanceAfter: decimalSchema,
  unidValue: decimalSchema,
  amount: optionalDecimalSchema,
  stake: optionalDecimalSchema,
  odds: optionalDecimalSchema,
  potentialWin: optionalDecimalSchema,
  actualReturn: optionalDecimalSchema,
  unidValueBefore: optionalDecimalSchema,
  unidValueAfter: optionalDecimalSchema,
  eventId: optionalNumberSchema,
  eventName: optionalStringSchema,
  description: optionalStringSchema,
});

export type BankrollHistoryDTO = SafeInfer<typeof BankrollHistorySchema>;
