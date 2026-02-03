import {
  OperationTypeEnum,
  optionalStringSchema,
  optionalNumberSchema,
} from '../../z.dto/bankroll.dto';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateOperationSchema = z.object({
  bankrollId: z.number().int().positive(),
  type: OperationTypeEnum,
  amount: decimalSchema,
  description: optionalStringSchema,
  relatedBankrollId: optionalNumberSchema,
  date: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
});

export type CreateOperationDTO = SafeInfer<typeof CreateOperationSchema>;

export const GetOperationSchema = CreateOperationSchema.extend({
  id: z.number().int(),
});

export type GetOperationDTO = SafeInfer<typeof GetOperationSchema>;
