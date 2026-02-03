import { SafeInfer } from '../../../types/zod';
import z from 'zod';

export const ExternalMatchBaseSchema = z.object({
  id: z.number().int().positive(),
  apiSportsEventId: z.string().trim().max(50),
  tsdbEventId: z.string().trim().max(50).optional().nullable(),
  apiSource: z.string().trim().max(50).default('thesportsdb'),
  sport: z.string().trim().max(50).min(1, 'Esporte é obrigatório'),
  league: z.string().trim().max(100).min(1, 'Liga é obrigatória'),
  leagueId: z.string().trim().max(50).optional().nullable(),
  season: z.string().trim().max(20).optional().nullable(),
  round: z.string().min(0).max(32767).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  homeTeam: z.string().trim().max(100).min(1, 'Time da casa é obrigatório'),
  awayTeam: z.string().trim().max(100).min(1, 'Time visitante é obrigatório'),
  homeTeamBadge: z.string().trim().url().max(255).optional().nullable(),
  awayTeamBadge: z.string().trim().url().max(255).optional().nullable(),
  homeScoreHT: z.number().int().min(0).optional().nullable(),
  awayScoreHT: z.number().int().min(0).optional().nullable(),
  homeScoreFT: z.number().int().min(0).optional().nullable(),
  awayScoreFT: z.number().int().min(0).optional().nullable(),
  status: z.string().optional().nullable().default('SCHEDULED'),
  eventDate: z.date(),
  eventDateLocal: z.date().optional().nullable(),
  timezone: z.string().trim().max(50).optional().nullable(),
  isPostponed: z.boolean().default(false),
  thumbnail: z.string().trim().url().max(255).optional().nullable(),
  venue: z.string().trim().max(200).optional().nullable(),
  lastSyncAt: z.date(),
  syncAttempts: z.number().int().min(0).max(32767).default(0),
  syncError: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetMatchDTO = SafeInfer<typeof ExternalMatchBaseSchema>;
