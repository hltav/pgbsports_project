import { z } from 'zod';
import { MatchStatus } from '@prisma/client';

export const FusedMatchDataSchema = z.object({
  // --- Identificadores de API ---
  apiSportsEventId: z.string(),
  tsdbEventId: z.string(),

  // --- Informações do Evento e Status ---
  eventDate: z.date(),
  timezone: z.string(),
  status: z.nativeEnum(MatchStatus),
  isPostponed: z.boolean(),

  // --- Times e Logos ---
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeTeamBadge: z.string().nullable().optional(),
  awayTeamBadge: z.string().nullable().optional(),

  // --- Placar ---
  homeScoreHT: z.number().nullable().optional(),
  awayScoreHT: z.number().nullable().optional(),
  homeScoreFT: z.number().nullable().optional(),
  awayScoreFT: z.number().nullable().optional(),

  // --- Metadados ---
  venue: z.string().nullable().optional(),
  league: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),

  // --- Metadados de Sincronização ---
  sport: z.string().default('Soccer'),
  lastSyncAt: z.date(),
});

export type FusedMatchData = z.infer<typeof FusedMatchDataSchema>;
