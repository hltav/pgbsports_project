import z from 'zod';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import { Prisma } from '@prisma/client';

export const CreateBankrollRecordSchema = z.object({
  bankrollId: z.number().int().positive(),
  type: z.string().max(50), // MAX_DAILY_PROFIT, BEST_STREAK, etc
  value: decimalSchema,
  date: z.coerce.date(),
  metadata: z
    .union([
      z.record(z.unknown()),
      z.array(z.unknown()),
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
    ])
    .optional()
    .transform((val) => {
      if (val === null) {
        return Prisma.JsonNull;
      }
      return val as Prisma.InputJsonValue;
    }),
});

export type CreateBankrollRecordDTO = SafeInfer<
  typeof CreateBankrollRecordSchema
>;

export const GetBankrollRecordSchema = CreateBankrollRecordSchema.extend({
  id: z.number().int(),
  createdAt: z.coerce.date(),
});

export type GetBankrollRecordDTO = SafeInfer<typeof GetBankrollRecordSchema>;
