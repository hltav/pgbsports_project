import { z } from 'zod';
import { decimalSchema } from './../../../../libs/common/dto/decimalSchema.interface';
import { SafeInfer } from './../../../../types/zod';
import { HistoryTypeEnum } from './createHistories.dto';

const optionalDecimalSchema = decimalSchema.optional().nullable();
const optionalNumberSchema = z.number().optional().nullable();
const optionalStringSchema = z.string().optional().nullable();

export const BankrollUpdateSchema = z.object({
  // === Campos obrigatórios do BankrollHistory ===
  bankrollId: z.number(),
  type: HistoryTypeEnum,

  amount: decimalSchema, // Valor da operação (depósito, saque, stake, retorno)

  // === Referências opcionais ===
  betId: optionalNumberSchema, // Referência ao Event (quando aplicável)
  description: optionalStringSchema,

  // === Campos auxiliares do Event (para processamento, não salvos no History) ===
  // Esses campos vêm do Event e são usados apenas para cálculos/exibição
  eventName: optionalStringSchema, // Event.event (nome do jogo)
  stake: optionalDecimalSchema, // Event.amount (valor apostado)
  odd: optionalDecimalSchema, // Event.odd (cotação)
  potentialReturn: optionalDecimalSchema, // Event.potentialWin (ganho potencial)
  actualReturn: optionalDecimalSchema, // Event.actualReturn (retorno real)
});

export type BankrollUpdateData = SafeInfer<typeof BankrollUpdateSchema>;
