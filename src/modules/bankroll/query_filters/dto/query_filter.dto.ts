import {
  EventStatusEnum,
  OperationTypeEnum,
  ResultEnum,
} from '../../z.dto/bankroll.dto';
import { SafeInfer } from './../../../../types/zod';
import z from 'zod';

export const BankrollFilterSchema = z.object({
  userId: z.number().int().optional(),
  isActive: z.boolean().optional(),
  bookmaker: z.string().optional(),
  bankrollId: z.number().int().optional(),
});

export type BankrollFilterDTO = SafeInfer<typeof BankrollFilterSchema>;

export const EventFilterSchema = z.object({
  bankrollId: z.number().int().optional(),
  userId: z.number().int().optional(),
  result: ResultEnum.optional(),
  status: EventStatusEnum.optional(),
  modality: z.string().optional(),
  market: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type EventFilterDTO = SafeInfer<typeof EventFilterSchema>;

export const HistoryFilterSchema = z.object({
  bankrollId: z.number().int().optional(),
  type: OperationTypeEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type HistoryFilterDTO = SafeInfer<typeof HistoryFilterSchema>;
