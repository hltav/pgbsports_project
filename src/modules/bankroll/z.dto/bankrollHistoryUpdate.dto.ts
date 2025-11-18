import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../types/zod';
import { HistoryTypeEnum } from './createHistories.dto';

const optionalDecimalSchema = decimalSchema.optional().nullable();
const optionalNumberSchema = z.number().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();

export const BankrollUpdateSchema = z.object({
  bankrollId: z.number(),
  type: HistoryTypeEnum,
  monetaryChange: decimalSchema,
  stake: optionalDecimalSchema,
  odds: optionalDecimalSchema,
  potentialWin: optionalDecimalSchema,
  actualReturn: optionalDecimalSchema,
  eventId: optionalNumberSchema,
  eventName: optionalStringSchema,
  description: optionalStringSchema,
});

export type BankrollUpdateData = SafeInfer<typeof BankrollUpdateSchema>;
