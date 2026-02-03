import { SafeInfer } from '../../../types/zod';
import z from 'zod';

export const CreateExternalMatchSchema = z.object({
  apiSportsEventId: z
    .string()
    .trim()
    .min(1, 'ID do evento na API é obrigatório')
    .max(50),
  tsdbEventId: z
    .string()
    .trim()
    .min(1, 'ID secundário do evento na API é opcional')
    .max(50)
    .optional()
    .nullable(),
  apiSource: z.string().trim().max(50).default('thesportsdb'),
  sport: z.string().trim().min(1, 'Esporte é obrigatório').max(50),
  league: z.string().trim().min(1, 'Liga é obrigatória').max(100),
  leagueBadge: z.string().trim().min(1).max(100).optional(),
  homeTeam: z.string().trim().min(1, 'Time da casa é obrigatório').max(100),
  awayTeam: z.string().trim().min(1, 'Time visitante é obrigatório').max(100),
  eventDate: z.date({ required_error: 'Data do evento é obrigatória' }),
  leagueId: z.string().trim().max(50).optional().nullable(),
  season: z.string().trim().max(20).optional().nullable(),
  round: z.string().min(0).max(32767).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  homeTeamBadge: z
    .string()
    .trim()
    .url('URL do badge inválida')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  awayTeamBadge: z
    .string()
    .trim()
    .url('URL do badge inválida')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  homeScoreHT: z
    .number()
    .int()
    .min(0, 'Placar não pode ser negativo')
    .optional()
    .nullable(),
  awayScoreHT: z
    .number()
    .int()
    .min(0, 'Placar não pode ser negativo')
    .optional()
    .nullable(),
  homeScoreFT: z
    .number()
    .int()
    .min(0, 'Placar não pode ser negativo')
    .optional()
    .nullable(),
  awayScoreFT: z
    .number()
    .int()
    .min(0, 'Placar não pode ser negativo')
    .optional()
    .nullable(),
  status: z.string().optional().nullable().default('SCHEDULED'),
  eventDateLocal: z.date().optional().nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
  isPostponed: z.boolean().default(false),
  thumbnail: z
    .string()
    .trim()
    .url('URL da thumbnail inválida')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  venue: z.string().trim().max(200).optional().nullable(),
});

export type CreateMatchDTO = SafeInfer<typeof CreateExternalMatchSchema>;

export const UpdateExternalMatchSchema = z.object({
  id: z.number().int().positive('ID deve ser positivo'),
  apiSportsEventId: z.string().trim().min(1).max(50).optional(),
  tsdbEventId: z.string().trim().min(1).max(50).optional(),
  apiSource: z.string().trim().max(50).optional(),
  sport: z.string().trim().min(1).max(50).optional(),
  league: z.string().trim().min(1).max(100).optional(),
  leagueId: z.string().trim().max(50).optional().nullable(),
  season: z.string().trim().max(20).optional().nullable(),
  round: z.string().min(0).max(32767).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  homeTeam: z.string().trim().min(1).max(100).optional(),
  awayTeam: z.string().trim().min(1).max(100).optional(),
  homeTeamBadge: z
    .string()
    .trim()
    .url()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  awayTeamBadge: z
    .string()
    .trim()
    .url()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  leagueBadge: z.string().trim().min(1).max(100).optional(),
  homeScoreHT: z.number().int().min(0).optional().nullable(),
  awayScoreHT: z.number().int().min(0).optional().nullable(),
  homeScoreFT: z.number().int().min(0).optional().nullable(),
  awayScoreFT: z.number().int().min(0).optional().nullable(),
  status: z.string().optional().nullable(),
  eventDate: z.date().optional(),
  eventDateLocal: z.date().optional().nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
  isPostponed: z.boolean().optional(),
  thumbnail: z
    .string()
    .trim()
    .url()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  venue: z.string().trim().max(200).optional().nullable(),
});

export type UpdateMatchDTO = SafeInfer<typeof UpdateExternalMatchSchema>;

export const UpdateMatchScoresSchema = z.object({
  homeScoreHT: z.number().int().min(0).optional().nullable(),
  awayScoreHT: z.number().int().min(0).optional().nullable(),
  homeScoreFT: z.number().int().min(0).optional().nullable(),
  awayScoreFT: z.number().int().min(0).optional().nullable(),
  status: z.string().optional().nullable(),
});

export type UpdateMatchScoresDTO = SafeInfer<typeof UpdateMatchScoresSchema>;
