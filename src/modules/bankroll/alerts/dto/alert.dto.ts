import { AlertTypeEnum, optionalDateSchema } from '../../z.dto/bankroll.dto';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const CreateBankrollAlertSchema = z.object({
  bankrollId: z.number().int().positive(),
  type: AlertTypeEnum,
  threshold: decimalSchema,
  message: z.string().max(255),
  isActive: z.boolean().default(true),
});

export type CreateBankrollAlertDTO = SafeInfer<
  typeof CreateBankrollAlertSchema
>;

export const UpdateBankrollAlertSchema = z.object({
  threshold: decimalSchema.optional(),
  message: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  triggeredAt: optionalDateSchema,
});

export type UpdateBankrollAlertDTO = SafeInfer<
  typeof UpdateBankrollAlertSchema
>;

export const GetBankrollAlertSchema = CreateBankrollAlertSchema.extend({
  id: z.number().int(),
  triggeredAt: optionalDateSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type GetBankrollAlertDTO = SafeInfer<typeof GetBankrollAlertSchema>;
